import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { useState } from "react";

const SERVICE_OPTIONS = [
  "موقع ويب",
  "تطبيق موبايل",
  "بوت تيليجرام",
  "نظام إدارة (Dashboard)",
  "نظام تشغيل / حل خاص",
  "أخرى",
];

const CONTACT_OPTIONS = [
  { value: "whatsapp", label: "واتساب" },
  { value: "telegram", label: "تيليجرام" },
  { value: "email", label: "البريد الإلكتروني" },
  { value: "phone", label: "هاتف" },
];

const BUDGET_OPTIONS = [
  "أقل من 500$",
  "500$ - 1500$",
  "1500$ - 5000$",
  "أكثر من 5000$",
  "غير محدد",
];

function getInitialService(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  const s = params.get("service") || "";
  return SERVICE_OPTIONS.includes(s) ? s : "";
}

export default function RequestService() {
  const [name, setName] = useState("");
  const [serviceType, setServiceType] = useState(getInitialService());
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [contactMethod, setContactMethod] = useState("whatsapp");
  const [contactValue, setContactValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !serviceType || !description || !contactValue) {
      setError("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(
        `${import.meta.env.BASE_URL}api/service-requests`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            serviceType,
            description,
            budget,
            contactMethod,
            contactValue,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <section className="py-12 sm:py-20">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4">
              اطلب <span className="text-primary">خدمتك</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              املأ النموذج وسنتواصل معك خلال 24 ساعة لمناقشة تفاصيل مشروعك.
            </p>
          </motion.div>

          {done ? (
            <div className="bg-card border border-primary/30 rounded-2xl p-8 sm:p-10 text-center">
              <div className="text-4xl sm:text-5xl mb-4">✅</div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3">
                تم استلام طلبك بنجاح
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                شكراً لثقتك بـ HyperSoft. سيتم التواصل معك قريباً عبر وسيلة
                الاتصال التي اخترتها.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-card border border-border rounded-2xl p-5 sm:p-8 md:p-10 space-y-5 sm:space-y-6"
            >
              <Field label="الاسم الكامل *">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                />
              </Field>

              <Field label="نوع الخدمة *">
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">-- اختر الخدمة --</option>
                  {SERVICE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="وصف المشروع *">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="input"
                  placeholder="اشرح فكرة مشروعك، الميزات المطلوبة، والجدول الزمني المتوقع..."
                  required
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Field label="الميزانية المتوقعة">
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="input"
                  >
                    <option value="">-- اختر --</option>
                    {BUDGET_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="وسيلة التواصل المفضلة *">
                  <select
                    value={contactMethod}
                    onChange={(e) => setContactMethod(e.target.value)}
                    className="input"
                    required
                  >
                    {CONTACT_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field
                label={
                  contactMethod === "email"
                    ? "بريدك الإلكتروني *"
                    : contactMethod === "phone"
                      ? "رقم هاتفك *"
                      : contactMethod === "telegram"
                        ? "معرّف تيليجرام أو رقم *"
                        : "رقم الواتساب *"
                }
              >
                <input
                  type="text"
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  className="input"
                  required
                  dir="ltr"
                />
              </Field>

              {error && (
                <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-md p-3 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex h-12 sm:h-14 items-center justify-center rounded-md bg-primary px-6 text-base sm:text-lg font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "جارٍ الإرسال..." : "إرسال طلب الخدمة"}
              </button>
            </form>
          )}
        </div>
      </section>

      <style>{`
        .input {
          width: 100%;
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
          padding: 0.65rem 0.875rem;
          color: hsl(var(--foreground));
          font-size: 1rem;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        @media (min-width: 640px) {
          .input { padding: 0.75rem 1rem; }
        }
        .input:focus {
          outline: none;
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 2px hsl(var(--primary) / 0.15);
        }
        select.input {
          appearance: auto;
          cursor: pointer;
        }
        textarea.input {
          resize: vertical;
          min-height: 120px;
        }
      `}</style>
    </Layout>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block mb-1.5 sm:mb-2 font-medium text-foreground/90 text-sm sm:text-base">
        {label}
      </span>
      {children}
    </label>
  );
}
