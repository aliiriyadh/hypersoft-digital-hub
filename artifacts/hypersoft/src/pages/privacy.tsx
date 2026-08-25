import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "1. مقدمة",
    body: "تحرص شركة HyperSoft على حماية خصوصية زوارها وعملائها. توضح هذه السياسة كيف نقوم بجمع المعلومات التي تقدمها عبر موقعنا الإلكتروني، وكيف نستخدمها وكيف نحميها. باستخدامك لهذا الموقع فإنك توافق على ممارساتنا الموضحة أدناه.",
  },
  {
    title: "2. المعلومات التي نجمعها",
    body: "قد نقوم بجمع معلومات مثل: الاسم، البريد الإلكتروني، رقم الهاتف، وأي معلومات أخرى يقدمها المستخدم طوعاً عبر نموذج التواصل. كما قد نقوم بجمع بيانات تقنية تلقائياً مثل عنوان IP، نوع المتصفح، ونظام التشغيل لأغراض تحليلية وتحسين تجربة الاستخدام.",
  },
  {
    title: "3. كيف نستخدم المعلومات",
    body: "تُستخدم المعلومات حصراً للرد على استفساراتك، تقديم الخدمات والدعم الفني، تطوير خدماتنا، وإرسال أي إشعارات أو تحديثات تخص طلبك. لا نقوم بإرسال أي مواد ترويجية بدون موافقتك المسبقة.",
  },
  {
    title: "4. مشاركة المعلومات مع أطراف ثالثة",
    body: "لا نقوم ببيع أو تأجير أو مشاركة بياناتك الشخصية مع أي طرف ثالث لأغراض تسويقية. قد نضطر للإفصاح عن المعلومات فقط في حال طُلب منا ذلك بموجب القانون أو لحماية حقوق الشركة وسلامتها.",
  },
  {
    title: "5. حماية البيانات",
    body: "نطبّق إجراءات تقنية وإدارية صارمة لحماية بياناتك من الوصول غير المصرّح به، التعديل، الإفشاء أو الإتلاف، بما في ذلك التشفير وتقييد صلاحيات الوصول الداخلي.",
  },
  {
    title: "6. ملفات تعريف الارتباط (Cookies)",
    body: "قد يستخدم الموقع ملفات تعريف الارتباط لتحسين تجربة المستخدم وقياس الأداء. يمكنك التحكم بها أو تعطيلها من إعدادات متصفحك.",
  },
  {
    title: "7. حقوق المستخدم",
    body: "يحق لك في أي وقت طلب الوصول إلى بياناتك أو تصحيحها أو حذفها أو الاعتراض على معالجتها، وذلك بمراسلتنا عبر البريد الإلكتروني الموضح في صفحة التواصل.",
  },
  {
    title: "8. التعديلات على السياسة",
    body: "نحتفظ بحق تعديل هذه السياسة في أي وقت، وسيتم نشر النسخة المحدثة على هذه الصفحة مع تاريخ آخر تحديث. استمرارك في استخدام الموقع بعد التعديلات يُعدّ موافقة منك على السياسة الجديدة.",
  },
  {
    title: "9. التواصل",
    body: "لأي استفسار يتعلق بسياسة الخصوصية، يرجى التواصل معنا عبر البريد: modeali2021@gmail.com أو من خلال صفحة تواصل معنا.",
  },
];

export default function Privacy() {
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
              <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-6">
              سياسة <span className="text-primary">الخصوصية</span>
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
