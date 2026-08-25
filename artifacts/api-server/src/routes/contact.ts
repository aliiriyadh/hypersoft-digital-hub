import { Router, type IRouter } from "express";
import { getTransporter, escapeHtml, RECIPIENT } from "../lib/mailer";

const router: IRouter = Router();

router.post("/contact", async (req, res) => {
  const { name, email, subject, message } = (req.body ?? {}) as Record<
    string,
    unknown
  >;

  const nameStr = typeof name === "string" ? name.trim() : "";
  const emailStr = typeof email === "string" ? email.trim() : "";
  const subjectStr = typeof subject === "string" ? subject.trim() : "";
  const messageStr = typeof message === "string" ? message.trim() : "";

  if (!nameStr || !emailStr || !subjectStr || !messageStr) {
    return res
      .status(400)
      .json({ error: "جميع الحقول مطلوبة" });
  }

  if (
    nameStr.length > 200 ||
    emailStr.length > 200 ||
    subjectStr.length > 300 ||
    messageStr.length > 5000
  ) {
    return res.status(400).json({ error: "حجم البيانات كبير جداً" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailStr)) {
    return res.status(400).json({ error: "البريد الإلكتروني غير صالح" });
  }

  try {
    const transporter = getTransporter();
    const htmlBody = `
      <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.8;color:#222;">
        <h2 style="color:#0ea5e9;border-bottom:2px solid #0ea5e9;padding-bottom:8px;">
          رسالة جديدة من موقع HyperSoft
        </h2>
        <p><strong>الاسم:</strong> ${escapeHtml(nameStr)}</p>
        <p><strong>البريد الإلكتروني:</strong> ${escapeHtml(emailStr)}</p>
        <p><strong>الموضوع:</strong> ${escapeHtml(subjectStr)}</p>
        <p><strong>الرسالة:</strong></p>
        <div style="background:#f5f5f5;padding:16px;border-radius:8px;white-space:pre-wrap;">
${escapeHtml(messageStr)}
        </div>
        <hr style="margin-top:24px;border:none;border-top:1px solid #ddd;" />
        <p style="font-size:12px;color:#888;">
          أُرسلت هذه الرسالة من نموذج التواصل في موقع HyperSoft.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"HyperSoft Website" <${RECIPIENT}>`,
      to: RECIPIENT,
      replyTo: `"${nameStr}" <${emailStr}>`,
      subject: `[HyperSoft] ${subjectStr}`,
      text: `الاسم: ${nameStr}\nالبريد: ${emailStr}\nالموضوع: ${subjectStr}\n\n${messageStr}`,
      html: htmlBody,
    });

    req.log.info({ email: emailStr }, "Contact email sent");
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to send contact email");
    return res
      .status(500)
      .json({ error: "تعذّر إرسال الرسالة، حاول لاحقاً." });
  }
});

export default router;
