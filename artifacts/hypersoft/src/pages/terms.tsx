import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const sections = [
  {
    title: "1. القبول بالشروط",
    body: "بدخولك واستخدامك لموقع HyperSoft الإلكتروني، فإنك تُقرّ بأنك قرأت ووافقت على الالتزام بكل الشروط والأحكام الواردة هنا. إذا كنت لا توافق على أيٍّ من هذه الشروط، يُرجى عدم استخدام الموقع.",
  },
  {
    title: "2. وصف الخدمة",
    body: "تقدّم HyperSoft خدمات تطوير البرمجيات، التطبيقات، الحلول الشبكية، والاستشارات التقنية. جميع المعلومات المعروضة على الموقع لأغراض تعريفية ولا تُعدّ التزاماً تعاقدياً ما لم يتم توقيع اتفاقية رسمية منفصلة.",
  },
  {
    title: "3. الاستخدام المقبول",
    body: "يلتزم المستخدم بعدم استخدام الموقع لأي أغراض غير قانونية أو ضارة، بما في ذلك (على سبيل المثال لا الحصر): انتحال الهوية، إرسال محتوى مسيء أو احتيالي عبر نموذج التواصل، محاولة اختراق الموقع، نشر برامج خبيثة، أو إزعاج إدارة الموقع.",
  },
  {
    title: "4. سوء الاستخدام",
    body: "تحتفظ HyperSoft بحق حظر أي مستخدم يُسيء استخدام الموقع أو نموذج التواصل، أو يقوم بإرسال رسائل عشوائية (Spam) أو محتوى مخالف للذوق العام أو القانون العراقي. وقد تتخذ الشركة الإجراءات القانونية اللازمة بحق المخالفين.",
  },
  {
    title: "5. الملكية الفكرية",
    body: "جميع المحتويات المعروضة على هذا الموقع من نصوص، صور، شعارات، تصاميم، وأكواد برمجية هي ملك حصري لشركة HyperSoft - قسم IT، وتخضع لحماية حقوق الملكية الفكرية. يُمنع نسخها أو إعادة استخدامها أو توزيعها بدون إذن خطي مسبق.",
  },
  {
    title: "6. إخلاء المسؤولية",
    body: "تُقدَّم خدمات الموقع 'كما هي' دون أي ضمانات صريحة أو ضمنية. لا تتحمل HyperSoft أي مسؤولية عن أي أضرار مباشرة أو غير مباشرة قد تنتج عن استخدام الموقع أو عدم القدرة على استخدامه.",
  },
  {
    title: "7. الروابط الخارجية",
    body: "قد يحتوي الموقع على روابط لمواقع أو منصات خارجية (مثل التليجرام، الفيسبوك، الإنستغرام). نحن غير مسؤولين عن محتوى أو سياسات تلك المواقع، ويتحمل المستخدم وحده مسؤولية التعامل معها.",
  },
  {
    title: "8. تعديل الشروط",
    body: "تحتفظ HyperSoft بحق تعديل أو تحديث هذه الشروط في أي وقت ودون إشعار مسبق. سيتم نشر النسخة الجديدة على هذه الصفحة، ويُعدّ استمرار استخدامك للموقع بعد التعديل قبولاً منك للشروط المُحدثة.",
  },
  {
    title: "9. القانون المعمول به",
    body: "تخضع هذه الشروط وتُفسّر وفقاً لقوانين جمهورية العراق، وتختص المحاكم العراقية المختصة بالنظر في أي نزاع ينشأ عنها.",
  },
  {
    title: "10. التواصل",
    body: "لأي استفسار يخص شروط الاستخدام، يُرجى مراسلتنا عبر البريد الإلكتروني: modeali2021@gmail.com أو من خلال صفحة تواصل معنا.",
  },
];

export default function Terms() {
  return (
    <Layout>
      <div className="py-12 sm:py-20">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 sm:mb-16"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 text-primary mb-4 sm:mb-6">
              <FileText className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-6">
              شروط <span className="text-primary">الاستخدام</span>
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground">آخر تحديث: 2026</p>
          </motion.div>

          <div className="space-y-4 sm:space-y-8">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-5 sm:p-8 hover:border-primary/40 transition-colors"
              >
                <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-foreground">
                  {section.title}
                </h2>
                <p className="text-muted-foreground leading-loose text-sm sm:text-lg">
                  {section.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
