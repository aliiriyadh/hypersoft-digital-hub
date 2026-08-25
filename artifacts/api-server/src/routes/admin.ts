import {
  Router,
  type IRouter,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import crypto from "node:crypto";
import {
  getAdmin,
  saveAdmin,
  verifyPassword,
  hashPassword,
  addProject,
  deleteProject,
  updateProject,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getServiceRequests,
  updateServiceRequestStatus,
  deleteServiceRequest,
  assignServiceRequestCaptain,
  getUsers,
  getUserById,
  getUserByUsername,
  addUser,
  updateUser,
  deleteUser,
  getServices,
  addService,
  updateService,
  deleteService,
  getRatings,
  addRating,
  deleteRating,
  getProjects,
  type Project,
  type ContentBlock,
  type ServiceRequestStatus,
  type UserRole,
} from "../lib/storage";
import { signToken, verifyToken, hashResetToken } from "../lib/auth";
import { getTransporter, escapeHtml, RECIPIENT } from "../lib/mailer";

const router: IRouter = Router();

const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const RESET_TTL_MS = 1000 * 60 * 30;

interface AuthedRequest extends Request {
  adminUser?: string;
  userId?: string;
  userRole?: UserRole;
}

async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers["authorization"];
  if (!header || typeof header !== "string" || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }
  const token = header.slice("Bearer ".length).trim();
  const payload = verifyToken(token, "session");
  if (!payload) {
    res.status(401).json({ error: "الجلسة منتهية، سجّل الدخول مرة أخرى" });
    return;
  }
  req.adminUser = payload.sub;
  req.userId = payload.uid;
  req.userRole = payload.role as UserRole | undefined;
  next();
}

function requireRole(...roles: UserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({ error: "ليس لديك صلاحية لهذا الإجراء" });
      return;
    }
    next();
  };
}

function publicUser(u: {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  salary: number;
  skills: string[];
  createdAt: number;
}) {
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    role: u.role,
    salary: u.salary,
    skills: u.skills,
    createdAt: u.createdAt,
  };
}

function parseProjectPayload(
  body: Record<string, unknown>,
): Partial<Omit<Project, "id" | "createdAt">> {
  const out: Partial<Omit<Project, "id" | "createdAt">> = {};
  if (typeof body["title"] === "string") out.title = body["title"].trim();
  if (typeof body["description"] === "string")
    out.description = body["description"].trim();
  if (typeof body["image"] === "string") out.image = body["image"].trim();
  const aspect = body["coverAspect"];
  if (
    aspect === "video" ||
    aspect === "square" ||
    aspect === "wide" ||
    aspect === "portrait" ||
    aspect === "auto"
  ) {
    out.coverAspect = aspect;
  }
  const fit = body["coverFit"];
  if (fit === "cover" || fit === "contain") out.coverFit = fit;
  if (Array.isArray(body["tags"])) {
    out.tags = (body["tags"] as unknown[])
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.trim())
      .filter(Boolean);
  } else if (typeof body["tags"] === "string") {
    out.tags = (body["tags"] as string)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if (typeof body["comingSoon"] === "boolean") out.comingSoon = body["comingSoon"];
  if (typeof body["categoryId"] === "string" || body["categoryId"] === null) {
    out.categoryId = body["categoryId"] as string | null;
  }
  const action = body["actionType"];
  if (action === "none" || action === "view" || action === "download") {
    out.actionType = action;
  }
  if (typeof body["actionUrl"] === "string")
    out.actionUrl = body["actionUrl"].trim();
  if (typeof body["useTheme"] === "boolean") out.useTheme = body["useTheme"];
  if (Array.isArray(body["content"])) {
    out.content = body["content"] as ContentBlock[];
  }
  return out;
}

router.post("/admin/login", async (req, res) => {
  const { username, password } = (req.body ?? {}) as Record<string, unknown>;
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "بيانات غير صالحة" });
  }
  const user = await getUserByUsername(username);
  if (!user || !verifyPassword(password, user.passwordHash, user.passwordSalt)) {
    return res
      .status(401)
      .json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
  }
  if (user.role === "client") {
    return res
      .status(403)
      .json({ error: "هذا الحساب من نوع عميل ولا يستطيع الدخول للوحة التحكم" });
  }
  const token = signToken({
    sub: user.username,
    type: "session",
    exp: Date.now() + SESSION_TTL_MS,
    role: user.role,
    uid: user.id,
  });
  return res.json({
    token,
    username: user.username,
    role: user.role,
    displayName: user.displayName,
    userId: user.id,
  });
});

router.get("/admin/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = req.userId ? await getUserById(req.userId) : null;
  res.json({
    username: req.adminUser,
    role: req.userRole,
    userId: req.userId,
    displayName: user?.displayName ?? req.adminUser,
  });
});

router.post("/admin/forgot-password", async (req, res) => {
  const admin = await getAdmin();
  const rawToken = crypto.randomBytes(32).toString("hex");
  admin.resetTokenHash = hashResetToken(rawToken);
  admin.resetTokenExpiresAt = Date.now() + RESET_TTL_MS;
  await saveAdmin(admin);

  const origin =
    (req.headers["origin"] as string | undefined) ||
    `${req.protocol}://${req.get("host")}`;
  const adminBase = process.env["ADMIN_PATH"] || "/control-9k2x-portal";
  const resetUrl = `${origin}${adminBase}/reset/${rawToken}`;

  try {
    await getTransporter().sendMail({
      from: `"HyperSoft Control" <${RECIPIENT}>`,
      to: RECIPIENT,
      subject: "[HyperSoft] إعادة تعيين كلمة المرور للوحة التحكم",
      text: `تم طلب إعادة تعيين كلمة المرور.\n\nاضغط على الرابط التالي لإعادة التعيين (صالح لمدة 30 دقيقة):\n${resetUrl}\n\nإذا لم تطلب ذلك، تجاهل هذه الرسالة.`,
      html: `
        <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.8;color:#222;">
          <h2 style="color:#0ea5e9;border-bottom:2px solid #0ea5e9;padding-bottom:8px;">
            إعادة تعيين كلمة المرور
          </h2>
          <p>تم طلب إعادة تعيين كلمة مرور لوحة تحكم HyperSoft.</p>
          <p>
            <a href="${escapeHtml(resetUrl)}"
               style="display:inline-block;padding:12px 28px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">
               إعادة تعيين كلمة المرور
            </a>
          </p>
          <p style="color:#666;font-size:13px;">الرابط صالح لمدة 30 دقيقة فقط.</p>
          <p style="color:#666;font-size:13px;">إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة.</p>
          <hr style="margin-top:24px;border:none;border-top:1px solid #ddd;" />
          <p style="font-size:11px;color:#999;direction:ltr;text-align:left;">
            ${escapeHtml(resetUrl)}
          </p>
        </div>
      `,
    });
    req.log.info("Password reset email sent");
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to send reset email");
    return res
      .status(500)
      .json({ error: "تعذّر إرسال رسالة إعادة التعيين" });
  }
});

router.post("/admin/reset-password", async (req, res) => {
  const { token, newPassword } = (req.body ?? {}) as Record<string, unknown>;
  if (
    typeof token !== "string" ||
    typeof newPassword !== "string" ||
    newPassword.length < 8
  ) {
    return res
      .status(400)
      .json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
  }
  const admin = await getAdmin();
  if (
    !admin.resetTokenHash ||
    !admin.resetTokenExpiresAt ||
    admin.resetTokenExpiresAt < Date.now()
  ) {
    return res.status(400).json({ error: "الرابط غير صالح أو منتهي الصلاحية" });
  }
  const candidate = hashResetToken(token);
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(admin.resetTokenHash, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(400).json({ error: "الرابط غير صالح" });
  }
  const { hash, salt } = hashPassword(newPassword);
  admin.passwordHash = hash;
  admin.passwordSalt = salt;
  admin.resetTokenHash = null;
  admin.resetTokenExpiresAt = null;
  await saveAdmin(admin);
  return res.json({ success: true });
});

router.post("/admin/projects", requireAuth, async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const patch = parseProjectPayload(body);
  if (!patch.title || !patch.description) {
    return res.status(400).json({ error: "العنوان والوصف مطلوبان" });
  }
  if (patch.title.length > 200 || patch.description.length > 2000) {
    return res.status(400).json({ error: "حجم البيانات كبير جداً" });
  }
  const project = await addProject({
    title: patch.title,
    description: patch.description,
    ...patch,
  });
  return res.json({ project });
});

router.patch("/admin/projects/:id", requireAuth, async (req, res) => {
  const id = req.params["id"]!;
  const body = (req.body ?? {}) as Record<string, unknown>;
  const patch = parseProjectPayload(body);
  const updated = await updateProject(id, patch);
  if (!updated) return res.status(404).json({ error: "المشروع غير موجود" });
  return res.json({ project: updated });
});

router.delete("/admin/projects/:id", requireAuth, async (req, res) => {
  const id = req.params["id"]!;
  const ok = await deleteProject(id);
  if (!ok) return res.status(404).json({ error: "المشروع غير موجود" });
  return res.json({ success: true });
});

router.get("/admin/categories", requireAuth, async (_req, res) => {
  const categories = await getCategories();
  res.json({ categories });
});

router.post("/admin/categories", requireAuth, async (req, res) => {
  const name =
    typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!name || name.length > 80) {
    return res.status(400).json({ error: "اسم القائمة مطلوب" });
  }
  const cat = await addCategory(name);
  res.json({ category: cat });
});

router.patch("/admin/categories/:id", requireAuth, async (req, res) => {
  const id = req.params["id"]!;
  const name =
    typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!name) return res.status(400).json({ error: "الاسم مطلوب" });
  const updated = await updateCategory(id, name);
  if (!updated) return res.status(404).json({ error: "القائمة غير موجودة" });
  res.json({ category: updated });
});

router.delete("/admin/categories/:id", requireAuth, async (req, res) => {
  const id = req.params["id"]!;
  const ok = await deleteCategory(id);
  if (!ok) return res.status(404).json({ error: "القائمة غير موجودة" });
  res.json({ success: true });
});

router.get("/admin/service-requests", requireAuth, async (_req, res) => {
  const requests = await getServiceRequests();
  res.json({ requests });
});

router.patch("/admin/service-requests/:id", requireAuth, async (req, res) => {
  const id = req.params["id"]!;
  const status = (req.body ?? {})["status"];
  const updated = await updateServiceRequestStatus(
    id,
    status as ServiceRequestStatus,
  );
  if (!updated) return res.status(404).json({ error: "الطلب غير موجود أو الحالة غير صالحة" });
  res.json({ request: updated });
});

router.delete("/admin/service-requests/:id", requireAuth, requireRole("admin", "employee"), async (req, res) => {
  const id = req.params["id"]!;
  const ok = await deleteServiceRequest(id);
  if (!ok) return res.status(404).json({ error: "الطلب غير موجود" });
  res.json({ success: true });
});

// Assign a captain to a service request (admin/employee)
router.patch(
  "/admin/service-requests/:id/assign",
  requireAuth,
  requireRole("admin", "employee"),
  async (req, res) => {
    const id = req.params["id"]!;
    const captainId = (req.body ?? {})["captainId"];
    if (captainId !== null && typeof captainId !== "string") {
      return res.status(400).json({ error: "captainId غير صالح" });
    }
    if (typeof captainId === "string") {
      const captain = await getUserById(captainId);
      if (!captain || captain.role !== "captain") {
        return res.status(400).json({ error: "المستخدم المختار ليس كابتن" });
      }
    }
    const updated = await assignServiceRequestCaptain(id, captainId);
    if (!updated) return res.status(404).json({ error: "الطلب غير موجود" });
    res.json({ request: updated });
  },
);

// ===== Users CRUD =====

router.get("/admin/users", requireAuth, async (_req, res) => {
  const users = await getUsers();
  res.json({ users: users.map(publicUser) });
});

router.post(
  "/admin/users",
  requireAuth,
  requireRole("admin", "employee"),
  async (req: AuthedRequest, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const username = typeof body["username"] === "string" ? body["username"].trim() : "";
    const password = typeof body["password"] === "string" ? body["password"] : "";
    const displayName =
      typeof body["displayName"] === "string" ? body["displayName"].trim() : username;
    const role = body["role"] as UserRole;
    const salary = typeof body["salary"] === "number" ? body["salary"] : 0;
    const skills = Array.isArray(body["skills"])
      ? (body["skills"] as unknown[]).filter((s): s is string => typeof s === "string")
      : [];

    if (!username || username.length > 60 || password.length < 6) {
      return res
        .status(400)
        .json({ error: "اسم المستخدم وكلمة المرور (6 أحرف على الأقل) مطلوبان" });
    }
    if (!["admin", "employee", "captain", "client"].includes(role)) {
      return res.status(400).json({ error: "الرتبة غير صالحة" });
    }
    // Employees may only add captains; only Admins can create admins/employees
    if (req.userRole === "employee" && role !== "captain") {
      return res
        .status(403)
        .json({ error: "الموظف يمكنه فقط إضافة كباتن" });
    }
    try {
      const u = await addUser({ username, displayName, password, role, salary, skills });
      res.json({ user: publicUser(u) });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "تعذّرت العملية";
      res.status(400).json({ error: msg });
    }
  },
);

router.patch(
  "/admin/users/:id",
  requireAuth,
  requireRole("admin", "employee"),
  async (req: AuthedRequest, res) => {
    const id = req.params["id"]!;
    const body = (req.body ?? {}) as Record<string, unknown>;
    const target = await getUserById(id);
    if (!target) return res.status(404).json({ error: "المستخدم غير موجود" });

    const patch: Parameters<typeof updateUser>[1] = {};
    if (typeof body["displayName"] === "string") patch.displayName = body["displayName"].trim();
    if (typeof body["password"] === "string" && (body["password"] as string).length >= 6) {
      patch.password = body["password"] as string;
    }
    if (Array.isArray(body["skills"])) {
      patch.skills = (body["skills"] as unknown[]).filter(
        (s): s is string => typeof s === "string",
      );
    }

    // Only admin can change role/salary
    if (req.userRole === "admin") {
      if (typeof body["role"] === "string") patch.role = body["role"] as UserRole;
      if (typeof body["salary"] === "number") patch.salary = body["salary"];
    } else {
      // Employee cannot edit admins or other employees
      if (target.role === "admin" || target.role === "employee") {
        return res
          .status(403)
          .json({ error: "الموظف لا يمكنه تعديل المدراء أو الموظفين" });
      }
    }

    const updated = await updateUser(id, patch);
    if (!updated) return res.status(404).json({ error: "المستخدم غير موجود" });
    res.json({ user: publicUser(updated) });
  },
);

router.delete(
  "/admin/users/:id",
  requireAuth,
  requireRole("admin"),
  async (req: AuthedRequest, res) => {
    const id = req.params["id"]!;
    if (id === req.userId) {
      return res.status(400).json({ error: "لا يمكنك حذف حسابك الشخصي" });
    }
    try {
      const ok = await deleteUser(id);
      if (!ok) return res.status(404).json({ error: "المستخدم غير موجود" });
      res.json({ success: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "تعذّر الحذف";
      res.status(400).json({ error: msg });
    }
  },
);

// ===== Services CRUD =====

router.get("/admin/services", requireAuth, async (_req, res) => {
  const services = await getServices();
  res.json({ services });
});

router.post(
  "/admin/services",
  requireAuth,
  requireRole("admin", "employee"),
  async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const title = typeof body["title"] === "string" ? body["title"].trim() : "";
    const description = typeof body["description"] === "string" ? body["description"].trim() : "";
    const price = typeof body["price"] === "number" ? body["price"] : 0;
    const icon = typeof body["icon"] === "string" ? body["icon"] : "category";
    if (!title || !description) {
      return res.status(400).json({ error: "العنوان والوصف مطلوبان" });
    }
    const s = await addService({ title, description, price, icon });
    res.json({ service: s });
  },
);

router.patch(
  "/admin/services/:id",
  requireAuth,
  requireRole("admin", "employee"),
  async (req, res) => {
    const id = req.params["id"]!;
    const body = (req.body ?? {}) as Record<string, unknown>;
    const patch: Parameters<typeof updateService>[1] = {};
    if (typeof body["title"] === "string") patch.title = body["title"].trim();
    if (typeof body["description"] === "string") patch.description = body["description"].trim();
    if (typeof body["price"] === "number") patch.price = body["price"];
    if (typeof body["icon"] === "string") patch.icon = body["icon"];
    const updated = await updateService(id, patch);
    if (!updated) return res.status(404).json({ error: "الخدمة غير موجودة" });
    res.json({ service: updated });
  },
);

router.delete(
  "/admin/services/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const id = req.params["id"]!;
    const ok = await deleteService(id);
    if (!ok) return res.status(404).json({ error: "الخدمة غير موجودة" });
    res.json({ success: true });
  },
);

// ===== Ratings =====

router.get("/admin/ratings", requireAuth, async (_req, res) => {
  const ratings = await getRatings();
  res.json({ ratings });
});

router.post(
  "/admin/ratings",
  requireAuth,
  requireRole("admin", "employee"),
  async (req: AuthedRequest, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const targetUserId = typeof body["targetUserId"] === "string" ? body["targetUserId"] : "";
    const stars = typeof body["stars"] === "number" ? body["stars"] : 0;
    const comment = typeof body["comment"] === "string" ? body["comment"].trim() : "";
    if (!targetUserId || stars < 1 || stars > 5) {
      return res.status(400).json({ error: "بيانات التقييم غير صالحة" });
    }
    const target = await getUserById(targetUserId);
    if (!target) return res.status(404).json({ error: "المستخدم غير موجود" });
    if (target.role === "client") {
      return res.status(400).json({ error: "لا يمكن تقييم العملاء" });
    }
    if (target.role === "admin") {
      return res.status(400).json({ error: "لا يمكن تقييم المدراء" });
    }
    const r = await addRating({
      targetUserId,
      raterUserId: req.userId ?? "",
      stars,
      comment,
    });
    res.json({ rating: r });
  },
);

router.delete(
  "/admin/ratings/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const id = req.params["id"]!;
    const ok = await deleteRating(id);
    if (!ok) return res.status(404).json({ error: "التقييم غير موجود" });
    res.json({ success: true });
  },
);

// ===== Stats =====

router.get("/admin/stats", requireAuth, async (_req, res) => {
  const [requests, projects, users, services, ratings] = await Promise.all([
    getServiceRequests(),
    getProjects(),
    getUsers(),
    getServices(),
    getRatings(),
  ]);
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayMs = startOfToday.getTime();

  // Daily requests for last 14 days
  const days: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(todayMs - i * dayMs);
    const next = d.getTime() + dayMs;
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    const count = requests.filter(
      (r) => r.createdAt >= d.getTime() && r.createdAt < next,
    ).length;
    days.push({ date: label, count });
  }

  // Service breakdown
  const serviceCounts = new Map<string, number>();
  for (const r of requests) {
    serviceCounts.set(r.serviceType, (serviceCounts.get(r.serviceType) ?? 0) + 1);
  }
  const topServices = Array.from(serviceCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Status counts
  const statusCounts: Record<string, number> = {
    new: 0, accepted: 0, "in-progress": 0, completed: 0, rejected: 0,
  };
  for (const r of requests) statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;

  // Captains performance (avg rating + completed orders)
  const captains = users.filter((u) => u.role === "captain");
  const captainStats = captains.map((c) => {
    const cRatings = ratings.filter((r) => r.targetUserId === c.id);
    const avg = cRatings.length
      ? cRatings.reduce((s, r) => s + r.stars, 0) / cRatings.length
      : 0;
    const completedOrders = requests.filter(
      (r) => r.assignedCaptainId === c.id && r.status === "completed",
    ).length;
    const activeOrders = requests.filter(
      (r) => r.assignedCaptainId === c.id && (r.status === "accepted" || r.status === "in-progress"),
    ).length;
    return {
      id: c.id,
      displayName: c.displayName,
      username: c.username,
      avgRating: Math.round(avg * 10) / 10,
      ratingsCount: cRatings.length,
      completedOrders,
      activeOrders,
    };
  });

  // Total payroll
  const totalSalaries = users
    .filter((u) => u.role !== "client")
    .reduce((s, u) => s + (u.salary ?? 0), 0);

  res.json({
    summary: {
      requestsToday: requests.filter((r) => r.createdAt >= todayMs).length,
      requestsTotal: requests.length,
      activeOrders: requests.filter((r) => r.status === "accepted" || r.status === "in-progress").length,
      completedOrders: requests.filter((r) => r.status === "completed").length,
      projectsTotal: projects.length,
      servicesTotal: services.length,
      usersTotal: users.length,
      captainsTotal: captains.length,
      employeesTotal: users.filter((u) => u.role === "employee").length,
      totalSalaries,
      now,
    },
    days,
    topServices,
    statusCounts,
    captainStats,
  });
});

export default router;
