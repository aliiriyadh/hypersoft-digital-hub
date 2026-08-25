import nodemailer from "nodemailer";

export const RECIPIENT = "modeali2021@gmail.com";

let cached: nodemailer.Transporter | null = null;

export function getTransporter(): nodemailer.Transporter {
  if (cached) return cached;
  const pass = process.env["GMAIL_APP_PASSWORD"];
  if (!pass) throw new Error("GMAIL_APP_PASSWORD is not configured");
  cached = nodemailer.createTransport({
    service: "gmail",
    auth: { user: RECIPIENT, pass },
  });
  return cached;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
