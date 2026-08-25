import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { SiTelegram, SiInstagram, SiFacebook } from "react-icons/si";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { useState } from "react";

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "فشل إرسال الرسالة");
      }
      toast({
        title: "تم الإرسال بنجاح",
        description:
          "شكراً لتواصلك معنا. سنقوم بالرد عليك في أقرب وقت ممكن.",
      });
      form.reset();
    } catch (err) {
      toast({
        title: "تعذّر إرسال الرسالة",
        description:
          err instanceof Error
            ? err.message
            : "حدث خطأ غير متوقع. حاول مجدداً.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="py-12 sm:py-20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-10 sm:mb-16"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6">
              تواصل <span className="text-primary">معنا</span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground">
              نحن هنا للاستماع إلى أفكارك ومناقشة مشروعك القادم. تواصل معنا
              عبر القنوات أدناه أو املأ النموذج.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
                معلومات التواصل
              </h2>

              <div className="space-y-5 sm:space-y-6 mb-8 sm:mb-12">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MdEmail className="text-xl sm:text-2xl" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg mb-1">
                      البريد الإلكتروني
                    </h3>
                    <a
                      href="mailto:modeali2021@gmail.com"
                      className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base break-all"
                      dir="ltr"
                    >
                      modeali2021@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MdPhone className="text-xl sm:text-2xl" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg mb-1">
                      رقم الهاتف (العراق)
                    </h3>
                    <a
                      href="tel:+9647862382352"
                      className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base"
                      dir="ltr"
                    >
                      +964 786 238 2352
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MdLocationOn className="text-xl sm:text-2xl" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg mb-1">العنوان</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      العراق - النجف الأشرف - مجمع قمبر السكني
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                منصات التواصل الاجتماعي
              </h2>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://t.me/G_RTP"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-card border border-border hover:border-primary hover:text-primary transition-all text-sm sm:text-base"
                >
                  <SiTelegram className="text-lg sm:text-xl shrink-0" />
                  <span className="font-medium" dir="ltr">@G_RTP</span>
                </a>
                <a
                  href="https://t.me/HyperSoft26"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-card border border-border hover:border-primary hover:text-primary transition-all text-sm sm:text-base"
                >
                  <SiTelegram className="text-lg sm:text-xl shrink-0" />
                  <span className="font-medium">قناة تليجرام</span>
                </a>
                <a
                  href="https://www.instagram.com/aliiriyadh?igsh=MW51NHZ4anVjMnR1aw=="
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-card border border-border hover:border-primary hover:text-primary transition-all text-sm sm:text-base"
                >
                  <SiInstagram className="text-lg sm:text-xl shrink-0" />
                  <span className="font-medium">انستغرام</span>
                </a>
                <a
                  href="https://www.facebook.com/share/1aAREErnpU/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-card border border-border hover:border-primary hover:text-primary transition-all text-sm sm:text-base"
                >
                  <SiFacebook className="text-lg sm:text-xl shrink-0" />
                  <span className="font-medium">فيسبوك</span>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-card p-5 sm:p-8 rounded-2xl border border-border shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full" />
                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 relative z-10">
                  أرسل لنا رسالة
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 relative z-10">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-2"
                    >
                      الاسم الكامل
                    </label>
                    <Input
                      id="name"
                      name="name"
                      required
                      className="h-11 sm:h-12 bg-background"
                      placeholder="أدخل اسمك"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2"
                    >
                      البريد الإلكتروني
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="h-11 sm:h-12 bg-background"
                      placeholder="example@email.com"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium mb-2"
                    >
                      الموضوع
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      required
                      className="h-11 sm:h-12 bg-background"
                      placeholder="موضوع الرسالة"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium mb-2"
                    >
                      الرسالة
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      className="min-h-[120px] sm:min-h-[150px] bg-background resize-none"
                      placeholder="كيف يمكننا مساعدتك؟"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 sm:h-12 text-base sm:text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة"}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
