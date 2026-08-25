import crypto from "node:crypto";
import { eq, desc, ne, and } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  projects as projectsTable,
  categories as categoriesTable,
  serviceRequests as serviceRequestsTable,
  users as usersTable,
  services as servicesTable,
  ratings as ratingsTable,
} from "@workspace/db";

export const DATA_DIR = process.cwd() + "/data";
export const UPLOADS_DIR = DATA_DIR + "/uploads";

export type UserRole = "admin" | "employee" | "captain" | "client";

export interface User {
  id: string;
  username: string;
  displayName: string;
  passwordHash: string;
  passwordSalt: string;
  role: UserRole;
  salary: number;
  skills: string[];
  resetTokenHash: string | null;
  resetTokenExpiresAt: number | null;
  createdAt: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: string;
  createdAt: number;
}

export interface Rating {
  id: string;
  targetUserId: string;
  raterUserId: string;
  stars: number;
  comment: string;
  createdAt: number;
}

export type ServiceRequestStatus =
  | "new"
  | "accepted"
  | "in-progress"
  | "completed"
  | "rejected";

export interface ServiceRequest {
  id: string;
  name: string;
  serviceType: string;
  description: string;
  budget: string;
  contactMethod: string;
  contactValue: string;
  status: ServiceRequestStatus;
  assignedCaptainId: string | null;
  createdAt: number;
}

export type ContentBlock =
  | { id: string; type: "h1" | "h2" | "text"; text: string; color: string | null }
  | { id: string; type: "image"; url: string; width: number | null; height: number | null; alt: string }
  | { id: string; type: "video"; url: string };

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  coverAspect: "video" | "square" | "wide" | "portrait" | "auto";
  coverFit: "cover" | "contain";
  tags: string[];
  comingSoon: boolean;
  categoryId: string | null;
  actionType: "none" | "view" | "download";
  actionUrl: string;
  useTheme: boolean;
  content: ContentBlock[];
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  createdAt: number;
}

export interface AdminAccount {
  username: string;
  passwordHash: string;
  passwordSalt: string;
  resetTokenHash: string | null;
  resetTokenExpiresAt: number | null;
}

const DEFAULT_PROJECTS_RAW: Omit<Project, "content" | "coverAspect" | "coverFit" | "actionType" | "actionUrl" | "useTheme" | "comingSoon" | "categoryId">[] = [
  { id: "p-erp", title: "نظام إدارة الموارد EnterpriseERP", description: "نظام ERP متكامل لشركة صناعية كبرى، يغطي المشتريات، المبيعات، الموارد البشرية، والمالية مع لوحات تحكم تحليلية.", image: "/images/project-erp.png", tags: ["React", "Node.js", "PostgreSQL", "TailwindCSS"], createdAt: 1 },
  { id: "p-finance", title: "تطبيق FinanceTrack", description: "تطبيق موبايل ذكي لتتبع المصروفات الشخصية والاستثمارات باستخدام تقنيات الذكاء الاصطناعي للتنبؤ المالي.", image: "/images/project-mobile.png", tags: ["React Native", "TypeScript", "Firebase"], createdAt: 2 },
  { id: "p-estorex", title: "منصة E-StoreX", description: "منصة تجارة إلكترونية متطورة تدعم المتاجر المتعددة، مع نظام توصيات للمنتجات وبوابات دفع إلكترونية متعددة.", image: "/images/project-ecommerce.png", tags: ["Next.js", "Stripe", "GraphQL", "MongoDB"], createdAt: 3 },
  { id: "p-aigen", title: "أداة AI ContentGen", description: "أداة ذكاء اصطناعي لتوليد المحتوى التسويقي والمقالات للمؤسسات الإعلامية، تدعم اللغة العربية بدقة عالية.", image: "/images/project-ai.png", tags: ["Python", "FastAPI", "OpenAI API", "React"], createdAt: 4 },
  { id: "p-health", title: "نظام SmartHealth", description: "نظام إدارة العيادات والمستشفيات الخاص، يشمل حجز المواعيد، السجلات الطبية الإلكترونية، ونظام الصيدلية.", image: "/images/project-erp.png", tags: ["Vue.js", "Django", "MySQL", "Docker"], createdAt: 5 },
  { id: "p-delivery", title: "تطبيق DeliveryGo", description: "تطبيق لوجستي لتوصيل الطلبات، يشمل تطبيقين (للعميل والمندوب) مع لوحة تحكم للشركة ونظام تتبع حي.", image: "/images/project-mobile.png", tags: ["Flutter", "Node.js", "Socket.io", "Google Maps"], createdAt: 6 },
  { id: "p-network", title: "حلول الشبكات NetWorks Pro", description: "حلول متكاملة لإدارة وتصميم شبكات الحاسوب للشركات والمؤسسات، تشمل التصميم، التركيب، الحماية والمراقبة المركزية.", image: "/images/project-erp.png", tags: ["Cisco", "MikroTik", "Network Security", "Monitoring"], createdAt: 7 },
];

const DEFAULT_ADMIN_USERNAME = "admin";
const INITIAL_ADMIN_PASSWORD_ENV = "ADMIN_INITIAL_PASSWORD";

const DEFAULT_SERVICES_RAW = [
  { id: "s-web", title: "تطوير مواقع الويب", description: "مواقع شركات ومتاجر ومنصات بأحدث التقنيات.", price: 500, icon: "language" },
  { id: "s-mobile", title: "تطبيقات الموبايل", description: "تطبيقات iOS و Android بتجربة مستخدم سلسة.", price: 1500, icon: "smartphone" },
  { id: "s-bot", title: "بوتات تيليجرام", description: "بوتات Telegram احترافية للأعمال والأتمتة.", price: 300, icon: "smart_toy" },
  { id: "s-dashboard", title: "أنظمة إدارة (Dashboards)", description: "لوحات تحكم متكاملة مع تقارير وصلاحيات.", price: 1200, icon: "dashboard" },
  { id: "s-system", title: "أنظمة تشغيل وحلول خاصة", description: "أنظمة برمجية مخصصة وأتمتة عمليات.", price: 2000, icon: "memory" },
];

const VALID_STATUSES: ServiceRequestStatus[] = ["new", "accepted", "in-progress", "completed", "rejected"];
const VALID_ROLES: UserRole[] = ["admin", "employee", "captain", "client"];

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function sanitizeBlocks(blocks: unknown): ContentBlock[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.filter((b): b is ContentBlock => {
    if (!b || typeof b !== "object") return false;
    const t = (b as Record<string, unknown>)["type"];
    return t === "h1" || t === "h2" || t === "text" || t === "image" || t === "video";
  });
}

function rowToProject(row: typeof projectsTable.$inferSelect): Project {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image,
    coverAspect: (row.coverAspect as Project["coverAspect"]) || "video",
    coverFit: (row.coverFit as Project["coverFit"]) || "cover",
    tags: (row.tags as string[]) || [],
    comingSoon: row.comingSoon,
    categoryId: row.categoryId ?? null,
    actionType: (row.actionType as Project["actionType"]) || "none",
    actionUrl: row.actionUrl,
    useTheme: row.useTheme,
    content: sanitizeBlocks(row.content),
    createdAt: Number(row.createdAt),
  };
}

function rowToUser(row: typeof usersTable.$inferSelect): User {
  return {
    id: row.id,
    username: row.username,
    displayName: row.displayName,
    passwordHash: row.passwordHash,
    passwordSalt: row.passwordSalt,
    role: (row.role as UserRole),
    salary: row.salary,
    skills: (row.skills as string[]) || [],
    resetTokenHash: row.resetTokenHash ?? null,
    resetTokenExpiresAt: row.resetTokenExpiresAt ? Number(row.resetTokenExpiresAt) : null,
    createdAt: Number(row.createdAt),
  };
}

function rowToService(row: typeof servicesTable.$inferSelect): ServiceItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    icon: row.icon,
    createdAt: Number(row.createdAt),
  };
}

function rowToRequest(row: typeof serviceRequestsTable.$inferSelect): ServiceRequest {
  return {
    id: row.id,
    name: row.name,
    serviceType: row.serviceType,
    description: row.description,
    budget: row.budget,
    contactMethod: row.contactMethod,
    contactValue: row.contactValue,
    status: (row.status as ServiceRequestStatus),
    assignedCaptainId: row.assignedCaptainId ?? null,
    createdAt: Number(row.createdAt),
  };
}

function rowToRating(row: typeof ratingsTable.$inferSelect): Rating {
  return {
    id: row.id,
    targetUserId: row.targetUserId,
    raterUserId: row.raterUserId,
    stars: row.stars,
    comment: row.comment,
    createdAt: Number(row.createdAt),
  };
}

export function hashPassword(password: string, saltHex?: string): { hash: string; salt: string } {
  const salt = saltHex ?? crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash: derived, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: candidate } = hashPassword(password, salt);
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ──────────────────────────────────────────────
// Seed / init
// ──────────────────────────────────────────────

export async function ensureSeeded(): Promise<void> {
  // Projects
  const existingProjects = await db.select({ id: projectsTable.id }).from(projectsTable).limit(1);
  if (existingProjects.length === 0) {
    await db.insert(projectsTable).values(
      DEFAULT_PROJECTS_RAW.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        image: p.image,
        coverAspect: "video",
        coverFit: "cover",
        tags: p.tags,
        comingSoon: true,
        categoryId: null,
        actionType: "none",
        actionUrl: "",
        useTheme: true,
        content: [],
        createdAt: p.createdAt,
      }))
    );
  }

  // Services
  const existingServices = await db.select({ id: servicesTable.id }).from(servicesTable).limit(1);
  if (existingServices.length === 0) {
    await db.insert(servicesTable).values(
      DEFAULT_SERVICES_RAW.map((s) => ({ ...s, createdAt: Date.now() }))
    );
  }

  // Admin user
  const existingUsers = await db.select({ id: usersTable.id }).from(usersTable).limit(1);
  if (existingUsers.length === 0) {
    const initialPassword = process.env[INITIAL_ADMIN_PASSWORD_ENV];
    if (!initialPassword) {
      throw new Error(`${INITIAL_ADMIN_PASSWORD_ENV} is required when creating the first admin user`);
    }
    const { hash, salt } = hashPassword(initialPassword);
    await db.insert(usersTable).values({
      id: `u-${crypto.randomBytes(6).toString("hex")}`,
      username: DEFAULT_ADMIN_USERNAME,
      displayName: DEFAULT_ADMIN_USERNAME,
      passwordHash: hash,
      passwordSalt: salt,
      role: "admin",
      salary: 0,
      skills: [],
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      createdAt: Date.now(),
    });
  }
}

// ──────────────────────────────────────────────
// Projects
// ──────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const rows = await db.select().from(projectsTable).orderBy(projectsTable.createdAt);
  return rows.map(rowToProject);
}

export async function getProject(id: string): Promise<Project | null> {
  const rows = await db.select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
  return rows[0] ? rowToProject(rows[0]) : null;
}

export async function addProject(
  input: Partial<Omit<Project, "id" | "createdAt">> & { title: string; description: string }
): Promise<Project> {
  const id = `p-${crypto.randomBytes(6).toString("hex")}`;
  const row = {
    id,
    title: input.title,
    description: input.description,
    image: input.image ?? "",
    coverAspect: input.coverAspect ?? "video",
    coverFit: input.coverFit ?? "cover",
    tags: input.tags ?? [],
    comingSoon: input.comingSoon ?? false,
    categoryId: input.categoryId ?? null,
    actionType: input.actionType ?? "none",
    actionUrl: input.actionUrl ?? "",
    useTheme: input.useTheme ?? true,
    content: sanitizeBlocks(input.content) as unknown[],
    createdAt: Date.now(),
  };
  await db.insert(projectsTable).values(row);
  return rowToProject(row as typeof projectsTable.$inferSelect);
}

export async function deleteProject(id: string): Promise<boolean> {
  const result = await db.delete(projectsTable).where(eq(projectsTable.id, id));
  return (result.rowCount ?? 0) > 0;
}

export async function updateProject(
  id: string,
  patch: Partial<Omit<Project, "id" | "createdAt">>
): Promise<Project | null> {
  const current = await getProject(id);
  if (!current) return null;
  const updated = {
    ...current,
    ...patch,
    content: patch.content !== undefined ? sanitizeBlocks(patch.content) : current.content,
  };
  await db.update(projectsTable)
    .set({
      title: updated.title,
      description: updated.description,
      image: updated.image,
      coverAspect: updated.coverAspect,
      coverFit: updated.coverFit,
      tags: updated.tags,
      comingSoon: updated.comingSoon,
      categoryId: updated.categoryId,
      actionType: updated.actionType,
      actionUrl: updated.actionUrl,
      useTheme: updated.useTheme,
      content: updated.content as unknown[],
    })
    .where(eq(projectsTable.id, id));
  return updated;
}

// ──────────────────────────────────────────────
// Categories
// ──────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const rows = await db.select().from(categoriesTable).orderBy(categoriesTable.createdAt);
  return rows.map((r) => ({ id: r.id, name: r.name, createdAt: Number(r.createdAt) }));
}

export async function addCategory(name: string): Promise<Category> {
  const id = `c-${crypto.randomBytes(6).toString("hex")}`;
  const createdAt = Date.now();
  await db.insert(categoriesTable).values({ id, name, createdAt });
  return { id, name, createdAt };
}

export async function updateCategory(id: string, name: string): Promise<Category | null> {
  const rows = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id)).limit(1);
  if (!rows[0]) return null;
  await db.update(categoriesTable).set({ name }).where(eq(categoriesTable.id, id));
  return { id, name, createdAt: Number(rows[0].createdAt) };
}

export async function deleteCategory(id: string): Promise<boolean> {
  const result = await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  if ((result.rowCount ?? 0) === 0) return false;
  // Detach projects from deleted category
  await db.update(projectsTable)
    .set({ categoryId: null })
    .where(eq(projectsTable.categoryId, id));
  return true;
}

// ──────────────────────────────────────────────
// Service Requests
// ──────────────────────────────────────────────

export async function getServiceRequests(): Promise<ServiceRequest[]> {
  const rows = await db.select().from(serviceRequestsTable).orderBy(desc(serviceRequestsTable.createdAt));
  return rows.map(rowToRequest);
}

export async function addServiceRequest(
  input: Omit<ServiceRequest, "id" | "createdAt" | "status"> & { status?: ServiceRequestStatus }
): Promise<ServiceRequest> {
  const id = `r-${crypto.randomBytes(6).toString("hex")}`;
  const createdAt = Date.now();
  const row = {
    id,
    name: input.name,
    serviceType: input.serviceType,
    description: input.description,
    budget: input.budget,
    contactMethod: input.contactMethod,
    contactValue: input.contactValue,
    status: input.status ?? "new",
    assignedCaptainId: input.assignedCaptainId ?? null,
    createdAt,
  };
  await db.insert(serviceRequestsTable).values(row);
  return rowToRequest(row as typeof serviceRequestsTable.$inferSelect);
}

export async function updateServiceRequestStatus(
  id: string,
  status: ServiceRequestStatus
): Promise<ServiceRequest | null> {
  if (!VALID_STATUSES.includes(status)) return null;
  const rows = await db.select().from(serviceRequestsTable).where(eq(serviceRequestsTable.id, id)).limit(1);
  if (!rows[0]) return null;
  await db.update(serviceRequestsTable).set({ status }).where(eq(serviceRequestsTable.id, id));
  return rowToRequest({ ...rows[0], status });
}

export async function assignServiceRequestCaptain(
  id: string,
  captainId: string | null
): Promise<ServiceRequest | null> {
  const rows = await db.select().from(serviceRequestsTable).where(eq(serviceRequestsTable.id, id)).limit(1);
  if (!rows[0]) return null;
  await db.update(serviceRequestsTable).set({ assignedCaptainId: captainId }).where(eq(serviceRequestsTable.id, id));
  return rowToRequest({ ...rows[0], assignedCaptainId: captainId });
}

export async function deleteServiceRequest(id: string): Promise<boolean> {
  const result = await db.delete(serviceRequestsTable).where(eq(serviceRequestsTable.id, id));
  return (result.rowCount ?? 0) > 0;
}

// ──────────────────────────────────────────────
// Users
// ──────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  const rows = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  return rows.map(rowToUser);
}

export async function getUserById(id: string): Promise<User | null> {
  const rows = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  return rows[0] ? rowToUser(rows[0]) : null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const rows = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  return rows[0] ? rowToUser(rows[0]) : null;
}

export async function getPrimaryAdmin(): Promise<User> {
  const rows = await db.select().from(usersTable).where(eq(usersTable.role, "admin")).limit(1);
  if (rows[0]) return rowToUser(rows[0]);
  const all = await db.select().from(usersTable).limit(1);
  return rowToUser(all[0]!);
}

export async function saveUsers(_users: User[]): Promise<void> {
  // Kept for legacy compatibility — unused in DB mode
}

export async function addUser(input: {
  username: string;
  displayName?: string;
  password: string;
  role: UserRole;
  salary?: number;
  skills?: string[];
}): Promise<User> {
  const existing = await getUserByUsername(input.username);
  if (existing) throw new Error("اسم المستخدم موجود بالفعل");
  const { hash, salt } = hashPassword(input.password);
  const id = `u-${crypto.randomBytes(6).toString("hex")}`;
  const createdAt = Date.now();
  const row = {
    id,
    username: input.username,
    displayName: input.displayName || input.username,
    passwordHash: hash,
    passwordSalt: salt,
    role: input.role,
    salary: input.salary ?? 0,
    skills: input.skills ?? [],
    resetTokenHash: null,
    resetTokenExpiresAt: null,
    createdAt,
  };
  await db.insert(usersTable).values(row);
  return rowToUser(row as typeof usersTable.$inferSelect);
}

export async function updateUser(
  id: string,
  patch: Partial<{ displayName: string; role: UserRole; salary: number; skills: string[]; password: string }>
): Promise<User | null> {
  const rows = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!rows[0]) return null;
  const u = rows[0];
  const set: Partial<typeof usersTable.$inferInsert> = {};
  if (patch.displayName !== undefined) set.displayName = patch.displayName;
  if (patch.role !== undefined && VALID_ROLES.includes(patch.role)) set.role = patch.role;
  if (typeof patch.salary === "number") set.salary = patch.salary;
  if (Array.isArray(patch.skills)) set.skills = patch.skills.filter((s) => typeof s === "string");
  if (patch.password) {
    const { hash, salt } = hashPassword(patch.password);
    set.passwordHash = hash;
    set.passwordSalt = salt;
  }
  await db.update(usersTable).set(set).where(eq(usersTable.id, id));
  return rowToUser({ ...u, ...set } as typeof usersTable.$inferSelect);
}

export async function deleteUser(id: string): Promise<boolean> {
  const target = await getUserById(id);
  if (!target) return false;
  if (target.role === "admin") {
    const admins = await db.select({ id: usersTable.id }).from(usersTable)
      .where(and(eq(usersTable.role, "admin"), ne(usersTable.id, id)));
    if (admins.length === 0) throw new Error("لا يمكن حذف آخر مدير في النظام");
  }
  await db.delete(usersTable).where(eq(usersTable.id, id));
  return true;
}

// Legacy wrappers
export async function getAdmin(): Promise<AdminAccount> {
  const u = await getPrimaryAdmin();
  return {
    username: u.username,
    passwordHash: u.passwordHash,
    passwordSalt: u.passwordSalt,
    resetTokenHash: u.resetTokenHash,
    resetTokenExpiresAt: u.resetTokenExpiresAt,
  };
}

export async function saveAdmin(admin: AdminAccount): Promise<void> {
  const rows = await db.select().from(usersTable).where(eq(usersTable.username, admin.username)).limit(1);
  if (!rows[0]) return;
  await db.update(usersTable)
    .set({
      passwordHash: admin.passwordHash,
      passwordSalt: admin.passwordSalt,
      resetTokenHash: admin.resetTokenHash,
      resetTokenExpiresAt: admin.resetTokenExpiresAt ?? null,
    })
    .where(eq(usersTable.username, admin.username));
}

// ──────────────────────────────────────────────
// Services
// ──────────────────────────────────────────────

export async function getServices(): Promise<ServiceItem[]> {
  const rows = await db.select().from(servicesTable).orderBy(servicesTable.createdAt);
  return rows.map(rowToService);
}

export async function addService(input: Omit<ServiceItem, "id" | "createdAt">): Promise<ServiceItem> {
  const id = `s-${crypto.randomBytes(6).toString("hex")}`;
  const createdAt = Date.now();
  await db.insert(servicesTable).values({ id, ...input, createdAt });
  return { id, ...input, createdAt };
}

export async function updateService(
  id: string,
  patch: Partial<Omit<ServiceItem, "id" | "createdAt">>
): Promise<ServiceItem | null> {
  const rows = await db.select().from(servicesTable).where(eq(servicesTable.id, id)).limit(1);
  if (!rows[0]) return null;
  await db.update(servicesTable).set(patch).where(eq(servicesTable.id, id));
  return rowToService({ ...rows[0], ...patch } as typeof servicesTable.$inferSelect);
}

export async function deleteService(id: string): Promise<boolean> {
  const result = await db.delete(servicesTable).where(eq(servicesTable.id, id));
  return (result.rowCount ?? 0) > 0;
}

// ──────────────────────────────────────────────
// Ratings
// ──────────────────────────────────────────────

export async function getRatings(): Promise<Rating[]> {
  const rows = await db.select().from(ratingsTable).orderBy(desc(ratingsTable.createdAt));
  return rows.map(rowToRating);
}

export async function addRating(input: Omit<Rating, "id" | "createdAt">): Promise<Rating> {
  const id = `rt-${crypto.randomBytes(6).toString("hex")}`;
  const createdAt = Date.now();
  await db.insert(ratingsTable).values({ id, ...input, createdAt });
  return { id, ...input, createdAt };
}

export async function deleteRating(id: string): Promise<boolean> {
  const result = await db.delete(ratingsTable).where(eq(ratingsTable.id, id));
  return (result.rowCount ?? 0) > 0;
}
