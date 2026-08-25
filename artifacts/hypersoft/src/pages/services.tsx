import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  MdLanguage,
  MdSmartphone,
  MdSmartToy,
  MdDashboard,
  MdMemory,
} from "react-icons/md";

const SERVICES = [
  {
    icon: MdLanguage,
    title: "تطوير مواقع الويب",
    desc: "مواقع شركات، متاجر إلكترونية، ومنصات SaaS بأحدث التقنيات (React / Next.js).",
    features: [
      "تصميم متجاوب لجميع الأجهزة",
      "أداء عالي وسرعة تحميل",
      "تحسين محركات البحث (SEO)",
      "لوحة تحكم لإدارة المحتوى",
    ],
    serviceType: "موقع ويب",
  },
  {
    icon: MdSmartphone,
    title: "تطوير تطبيقات الموبايل",
    desc: "تطبيقات iOS وAndroid أصلية أو متعددة المنصات بتجربة مستخدم سلسة.",
    features: [
      "Flutter / React Native",
      "ربط بقواعد بيانات حية",
      "إشعارات فورية",
      "نشر على المتاجر",
    ],
    serviceType: "تطبيق موبايل",
  },
  {
    icon: MdSmartToy,
    title: "بوتات تيليجرام",
    desc: "بوتات Telegram احترافية للأعمال، الدفع، الدعم، والأتمتة الذكية.",
    features: [
      "ربط مع APIs خارجية",
      "نظام دفع متكامل",
      "إدارة المستخدمين",
      "تقارير ولوحات تحكم",
    ],
    serviceType: "بوت تيليجرام",
  },
  {
    icon: MdDashboard,
    title: "أنظمة إدارة (Dashboards)",
    desc: "لوحات تحكم متكاملة لإدارة العمليات، الموظفين، والعملاء بكفاءة.",
    features: [
      "صلاحيات متعددة المستويات",
      "تقارير وإحصائيات حية",
      "تكامل مع الأنظمة الموجودة",
      "تصدير بيانات Excel/PDF",
    ],
    serviceType: "نظام إدارة (Dashboard)",
  },
  {
    icon: MdMemory,
    title: "أنظمة تشغيل وحلول خاصة",
    desc: "تطوير أنظمة برمجية مخصصة، أتمتة العمليات، وحلول تقنية مبتكرة لمتطلباتك.",
    features: [
      "تحليل وتصميم النظام",
      "تطوير حسب الطلب",
      "تكامل مع الأجهزة",
      "صيانة ودعم مستمر",
    ],
    serviceType: "نظام تشغيل / حل خاص",
  },
];

export default function Services() {
  return (
    <Layout>
      <section className="py-14 sm:py-20 border-b border-border">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6"
          >
            خدماتنا <span className="text-primary">التقنية</span>
          </motion.h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            حلول برمجية متكاملة تواكب احتياجاتك التقنية وتحول أفكارك إلى واقع.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-4 sm:mb-5 shrink-0">
                    <Icon size={28} className="sm:text-[32px]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4 sm:mb-5 text-sm sm:text-base">
                    {s.desc}
                  </p>
                  <ul className="space-y-2 mb-6 sm:mb-8 flex-grow">
                    {s.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-foreground/90 text-sm sm:text-base"
                      >
                        <span className="text-primary mt-0.5 shrink-0">◆</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/request?service=${encodeURIComponent(s.serviceType)}`}
                    className="inline-flex h-11 sm:h-12 items-center justify-center rounded-md bg-primary px-5 sm:px-6 font-medium text-primary-foreground hover:bg-primary/90 transition-colors text-sm sm:text-base"
                  >
                    اطلب هذه الخدمة
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
