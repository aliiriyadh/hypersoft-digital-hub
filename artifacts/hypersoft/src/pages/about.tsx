import { Layout } from "@/components/layout";
import { motion } from "framer-motion";

export default function About() {
  return (
    <Layout>
      <div className="py-12 sm:py-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="order-2 lg:order-1"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 sm:mb-6">
                قصة <span className="text-primary">HyperSoft</span>
              </h1>
              <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
                <p>
                  تأسست HyperSoft لتكون قوة رائدة في مجال تكنولوجيا المعلومات
                  وتطوير البرمجيات. نحن نؤمن بأن التكنولوجيا هي المحرك الأساسي
                  لنجاح الأعمال في العصر الحديث.
                </p>
                <p>
                  يضم فريقنا نخبة من أفضل المطورين، المصممين، ومهندسي الأنظمة
                  الذين يجمعون بين الشغف بالابتكار والخبرة العميقة في أحدث
                  التقنيات. نحن لا نكتب مجرد أكواد برمجية، بل نبني حلولاً ذكية
                  تحل مشاكل حقيقية.
                </p>
                <p>
                  منذ انطلاقتنا، التزمنا بتقديم أعلى معايير الجودة في كل مشروع،
                  مع التركيز على الأداء والأمان وتجربة المستخدم الاستثنائية.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 mt-8 sm:mt-12">
                <div className="bg-card p-5 sm:p-6 rounded-xl border border-border">
                  <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2 sm:mb-3">
                    رؤيتنا
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    أن نكون الخيار الأول للشركات الباحثة عن التحول الرقمي المبتكر
                    والموثوق في منطقة الشرق الأوسط.
                  </p>
                </div>
                <div className="bg-card p-5 sm:p-6 rounded-xl border border-border">
                  <h3 className="text-xl sm:text-2xl font-bold text-secondary mb-2 sm:mb-3">
                    مهمتنا
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    تمكين شركائنا من تحقيق أهدافهم من خلال توفير حلول برمجية
                    متطورة، آمنة، وقابلة للتوسع.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="order-1 lg:order-2"
            >
              <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent z-10 mix-blend-overlay" />
                <img
                  src="/images/about.png"
                  alt="فريق HyperSoft"
                  className="w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
