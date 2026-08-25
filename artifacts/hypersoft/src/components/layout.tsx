import { Link } from "wouter";
import { SiTelegram, SiInstagram, SiFacebook } from "react-icons/si";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "الرئيسية" },
    { href: "/services", label: "الخدمات" },
    { href: "/projects", label: "المشاريع" },
    { href: "/about", label: "عن الشركة" },
    { href: "/contact", label: "تواصل معنا" },
    { href: "/request", label: "اطلب خدمتك" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="text-xl sm:text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent shrink-0">
            HyperSoft
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4 lg:gap-8 flex-wrap justify-end">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground/80 hover:text-primary transition-colors font-medium text-sm lg:text-base whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-foreground p-2 rounded-md hover:bg-accent transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background border-b border-border py-4 px-4 flex flex-col gap-1"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors px-3 py-2.5 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-12 pb-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              HyperSoft
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              شركة رائدة في مجال تقنية المعلومات وتطوير البرمجيات. نقدم حلولاً مبتكرة للشركات والمؤسسات بلمسة احترافية وتكنولوجيا متطورة.
            </p>
          </div>

          <div>
            <h4 className="text-base font-bold mb-4 text-foreground">روابط سريعة</h4>
            <ul className="space-y-2.5">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">الرئيسية</Link></li>
              <li><Link href="/services" className="text-muted-foreground hover:text-primary transition-colors text-sm">الخدمات</Link></li>
              <li><Link href="/projects" className="text-muted-foreground hover:text-primary transition-colors text-sm">المشاريع</Link></li>
              <li><Link href="/request" className="text-muted-foreground hover:text-primary transition-colors text-sm">اطلب خدمتك</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">معلومات عن الشركة</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">تواصل معنا</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">سياسة الخصوصية</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">شروط الاستخدام</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-bold mb-4 text-foreground">تواصل معنا</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:modeali2021@gmail.com"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm min-w-0"
                  dir="ltr"
                >
                  <MdEmail className="text-lg shrink-0" />
                  <span className="break-all">modeali2021@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+9647862382352"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                  dir="ltr"
                >
                  <MdPhone className="text-lg shrink-0" />
                  <span>+964 786 238 2352</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2 text-muted-foreground text-sm">
                  <MdLocationOn className="text-lg mt-0.5 shrink-0" />
                  <span>العراق - النجف الأشرف - مجمع قمبر السكني</span>
                </div>
              </li>
              <li>
                <div className="flex gap-3 mt-4">
                  <a
                    href="https://t.me/G_RTP"
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                    aria-label="تيليجرام"
                  >
                    <SiTelegram />
                  </a>
                  <a
                    href="https://t.me/HyperSoft26"
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                    title="قناة الشركة على تليجرام"
                    aria-label="قناة تيليجرام"
                  >
                    <SiTelegram />
                  </a>
                  <a
                    href="https://www.instagram.com/aliiriyadh?igsh=MW51NHZ4anVjMnR1aw=="
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                    aria-label="انستغرام"
                  >
                    <SiInstagram />
                  </a>
                  <a
                    href="https://www.facebook.com/share/1aAREErnpU/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                    aria-label="فيسبوك"
                  >
                    <SiFacebook />
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 text-center">
          <p className="text-muted-foreground text-sm">
            © 2026 HyperSoft - قسم IT - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/30">
      <Navbar />
      <main className="flex-grow pt-16 sm:pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
