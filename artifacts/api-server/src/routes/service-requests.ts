import { Router, type IRouter } from "express";
import { addServiceRequest } from "../lib/storage";
import { getTransporter, escapeHtml, RECIPIENT } from "../lib/mailer";

const router: IRouter = Router();

const ALLOWED_SERVICES = [
  "موقع ويب",
  "تطبيق موبايل",
  "بوت تيليجرام",
  "نظام إدارة (Dashboard)",
  "نظام تشغيل / حل خاص",
  "أخرى",
];

const ALLOWED_CONTACT = ["whatsapp", "telegram", "email", "phone"];

router.post("/service-requests", async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const name = typeof body["name"] === "string" ? body["name"].trim() : "";
  const serviceType =
    typeof body["serviceType"] === "string" ? body["serviceType"].trim() : "";
  const description =
    typeof body["description"] === "string" ? body["description"].trim() : "";
  const budget = typeof body["budget"] === "string" ? body["budget"].trim() : "";
  const contactMethod =
    typeof body["contactMethod"] === "string"
      ? body["contactMethod"].trim()
      : "";
  const contactValue =
    typeof body["contactValue"] === "string"
      ? body["contactValue"].trim()
      : "";

  if (!name || !serviceType || !description || !contactMethod || !contactValue) {
    return res.status(400).json({ error: "يرجى تعبئة جميع الحقول المطلوبة" });
  }
  if (
    name.length > 200 ||
    serviceType.length > 100 ||
    description.length > 5000 ||
    budget.length > 100 ||
    contactValue.length > 200
  ) {
    return res.status(400).json({ error: "حجم البيانات كبير جداً" });
  }
  if (!ALLOWED_SERVICES.includes(serviceType)) {
    return res.status(400).json({ error: "نوع الخدمة غير صالح" });
  }
  if (!ALLOWED_CONTACT.includes(contactMethod)) {
    return res.status(400).json({ error: "وسيلة التواصل غير صالحة" });
  }

  const created = await addServiceRequest({
    name,
    serviceType,
    description,
    budget,
    contactMethod,
    contactValue,
  });

  // notify admin by email (best effort)
  try {
    const html = `
      <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.8;color:#222;">
        <h2 style="color:#7c3aed;border-bottom:2px solid #7c3aed;padding-bottom:8px;">
          طلب خدمة جديد من موقع HyperSoft
        </h2>
        <p><strong>الاسم:</strong> ${escapeHtml(name)}</p>
        <p><strong>نوع الخدمة:</strong> ${escapeHtml(serviceType)}</p>
        <p><strong>الميزانية:</strong> ${escapeHtml(budget || "لم تُحدد")}</p>
        <p><strong>وسيلة التواصل:</strong> ${escapeHtml(contactMethod)} — ${escapeHtml(contactValue)}</p>
        <p><strong>وصف المشروع:</strong></p>
        <div style="background:#f5f5f5;padding:16px;border-radius:8px;white-space:pre-wrap;">
${escapeHtml(description)}
        </div>
        <hr style="margin-top:24px;border:none;border-top:1px solid #ddd;" />
        <p style="font-size:12px;color:#888;">
          يمكنك إدارة الطلب من لوحة التحكم.
        </p>
      </div>
    `;
    await getTransporter().sendMail({
      from: `"HyperSoft Requests" <${RECIPIENT}>`,
      to: RECIPIENT,
      subject: `[HyperSoft] طلب خدمة جديد: ${serviceType}`,
      text: `طلب جديد من ${name}\nالخدمة: ${serviceType}\nالميزانية: ${budget}\nالتواصل: ${contactMethod} - ${contactValue}\n\n${description}`,
      html,
    });
  } catch (err) {
    req.log.warn({ err }, "Failed to send service-request notification email");
  }

  return res.json({ success: true, id: created.id });
});

export default router;
