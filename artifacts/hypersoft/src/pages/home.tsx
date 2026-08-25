import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useEffect, useState } from "react";

interface ProjectPreview {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
}

export default function Home() {
  const [projects, setProjects] = useState<ProjectPreview[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/projects`)
      .then((r) => r.json())
      .then((d) => {
        const list = (d.projects ?? []) as ProjectPreview[];
        setProjects(list.slice(0, 3));
      })
      .catch(() => setProjects([]));
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center py-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-bg.png"
            alt="Futuristic Tech Background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:30px_30px]" />
        </div>

        <div className="container relative z-10 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight">
              نصنع{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                المستقبل
              </span>{" "}
              <br />
              بحلول برمجية استثنائية
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-10 leading-relaxed max-w-2xl">
              HyperSoft هي شريكك التقني الموثوق. نبني تطبيقات ويب وموبايل وأنظمة
              ذكية ترتقي بأعمالك إلى آفاق جديدة من التميز والابتكار.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <Link
                href="/request"
                className="inline-flex h-12 sm:h-14 items-center justify-center rounded-md bg-primary px-6 sm:px-8 text-base sm:text-lg font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 w-full sm:w-auto"
              >
                ابدأ مشروعك
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 sm:h-14 items-center justify-center rounded-md border border-input bg-background px-6 sm:px-8 text-base sm:text-lg font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground w-full sm:w-auto"
              >
                تواصل معنا
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-20 border-y border-border bg-card/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: "+150", label: "مشروع منجز" },
              { value: "99%", label: "رضا العملاء" },
              { value: "+50", label: "خبير تقني" },
              { value: "24/7", label: "دعم فني مستمر" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-primary mb-1 sm:mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium text-sm sm:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black mb-3 sm:mb-4">
              خدماتنا <span className="text-primary">التقنية</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
              نقدم مجموعة متكاملة من الحلول البرمجية المصممة خصيصاً لتلبية
              احتياجات سوق العمل الحديث.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {[
              {
                title: "تطوير مواقع الويب",
                desc: "مواقع ومنصات قابلة للتوسع بأحدث التقنيات (React / Next.js).",
              },
              {
                title: "تطبيقات الموبايل",
                desc: "تطبيقات iOS و Android بتجربة مستخدم سلسة وعصرية.",
              },
              {
                title: "بوتات تيليجرام",
                desc: "بوتات Telegram احترافية للأعمال، الدفع، الدعم، والأتمتة.",
              },
              {
                title: "أنظمة إدارة (Dashboards)",
                desc: "لوحات تحكم متكاملة مع تقارير وصلاحيات متعددة.",
              },
              {
                title: "أنظمة تشغيل وحلول خاصة",
                desc: "أنظمة برمجية مخصصة وأتمتة عمليات حسب الطلب.",
              },
              {
                title: "الذكاء الاصطناعي",
                desc: "دمج قدرات AI لتحسين القرار وأتمتة العمليات.",
              },
            ].map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card p-6 sm:p-8 rounded-2xl border border-border hover:border-primary/50 transition-colors group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-0 bg-gradient-to-b from-primary to-secondary group-hover:h-full transition-all duration-300" />
                <h3 className="text-lg sm:text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      {projects.length > 0 && (
        <section className="py-16 sm:py-24 border-t border-border">
          <div className="container mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black mb-3 sm:mb-4">
                من <span className="text-primary">أعمالنا</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
                مشاريع نفذناها لعملاء يثقون بنا.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
              {projects.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors"
                >
                  <Link href={`/projects/${p.id}`}>
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold mb-2">{p.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                        {p.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {p.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-xs px-2 py-1 rounded bg-primary/10 text-primary"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8 sm:mt-10">
              <Link
                href="/projects"
                className="inline-flex h-11 sm:h-12 items-center justify-center rounded-md border border-border px-6 sm:px-8 font-medium hover:bg-accent transition-colors text-sm sm:text-base"
              >
                عرض جميع المشاريع
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 sm:py-24 border-t border-border bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black mb-3 sm:mb-4">
              آراء <span className="text-primary">عملائنا</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {[
              {
                name: "أحمد الكاظمي",
                role: "مدير شركة تجارية",
                quote:
                  "فريق HyperSoft نفذ نظام إدارة كامل لشركتنا بجودة عالية وفي الوقت المتفق عليه. ننصح بالتعامل معهم.",
              },
              {
                name: "زينب حسن",
                role: "صاحبة متجر إلكتروني",
                quote:
                  "متجري الإلكتروني يعمل بسلاسة منذ الإطلاق، والدعم الفني سريع ومحترف. شكراً لكم.",
              },
              {
                name: "علي الموسوي",
                role: "مدير مشاريع تقنية",
                quote:
                  "بوت تيليجرام الذي طوروه لنا أتمت 70% من العمليات اليومية. تجربة احترافية بكل المقاييس.",
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 sm:p-8"
              >
                <div className="text-primary text-3xl mb-3">"</div>
                <p className="text-foreground/90 leading-relaxed mb-6 text-sm sm:text-base">
                  {t.quote}
                </p>
                <div>
                  <div className="font-bold text-sm sm:text-base">{t.name}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="container mx-auto relative z-10 text-center">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6">
            هل أنت مستعد لبدء مشروعك؟
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto">
            دعنا نحول فكرتك إلى واقع ملموس. فريقنا من الخبراء جاهز لتنفيذ
            رؤيتك بأعلى معايير الجودة.
          </p>
          <Link
            href="/request"
            className="inline-flex h-12 sm:h-14 items-center justify-center rounded-md bg-primary px-8 sm:px-10 text-base sm:text-lg font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            اطلب خدمتك الآن
          </Link>
        </div>
      </section>
    </Layout>
  );
}
