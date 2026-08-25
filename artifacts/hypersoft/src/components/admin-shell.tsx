import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  ShoppingCart,
  Briefcase,
  Wrench,
  Users,
  UsersRound,
  Star,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import {
  ADMIN_BASE_PATH,
  adminFetch,
  clearSession,
  getDisplayName,
  getRole,
  getToken,
  getUsername,
  ROLE_BADGE_CLASS,
  ROLE_LABELS,
  type AdminRole,
} from "@/lib/admin-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  path: string;
  icon: typeof Home;
  roles: AdminRole[];
}

const NAV: NavItem[] = [
  { label: "الرئيسية", path: `${ADMIN_BASE_PATH}/dashboard/home`, icon: Home, roles: ["admin", "employee", "captain"] },
  { label: "الطلبات", path: `${ADMIN_BASE_PATH}/dashboard/orders`, icon: ShoppingCart, roles: ["admin", "employee", "captain"] },
  { label: "المشاريع", path: `${ADMIN_BASE_PATH}/dashboard`, icon: Briefcase, roles: ["admin", "employee"] },
  { label: "الخدمات", path: `${ADMIN_BASE_PATH}/dashboard/services`, icon: Wrench, roles: ["admin", "employee"] },
  { label: "العملاء", path: `${ADMIN_BASE_PATH}/dashboard/customers`, icon: Users, roles: ["admin", "employee"] },
  { label: "المستخدمين", path: `${ADMIN_BASE_PATH}/dashboard/users`, icon: UsersRound, roles: ["admin", "employee"] },
  { label: "التقييمات", path: `${ADMIN_BASE_PATH}/dashboard/ratings`, icon: Star, roles: ["admin", "employee", "captain"] },
  { label: "الإحصائيات", path: `${ADMIN_BASE_PATH}/dashboard/stats`, icon: BarChart3, roles: ["admin", "employee"] },
  { label: "الإعدادات", path: `${ADMIN_BASE_PATH}/dashboard/settings`, icon: Settings, roles: ["admin", "employee", "captain"] },
];

interface ShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  allow?: AdminRole[];
  notifications?: number;
}

export function AdminShell({ title, subtitle, children, allow, notifications }: ShellProps) {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<{
    role: AdminRole | null;
    displayName: string | null;
    username: string | null;
  }>({
    role: getRole(),
    displayName: getDisplayName(),
    username: getUsername(),
  });
  const [pendingNew, setPendingNew] = useState<number>(0);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setLocation(ADMIN_BASE_PATH);
      return;
    }
    let cancelled = false;
    const verify = async () => {
      try {
        const r = await adminFetch("/api/admin/me");
        if (cancelled) return;
        if (r.status === 401) {
          clearSession();
          setLocation(ADMIN_BASE_PATH);
          return;
        }
        const data = await r.json().catch(() => ({}));
        setMe({
          role: data.role ?? getRole(),
          displayName: data.displayName ?? getDisplayName(),
          username: data.username ?? getUsername(),
        });
        setChecked(true);
      } catch {
        setChecked(true);
      }
    };
    void verify();
    const pollNotifs = async () => {
      try {
        const r = await adminFetch("/api/admin/service-requests");
        if (r.ok) {
          const d = await r.json();
          const newCount = (d.requests as Array<{ status: string }>).filter(
            (x) => x.status === "new",
          ).length;
          setPendingNew(newCount);
        }
      } catch {
        /* ignore */
      }
    };
    void pollNotifs();
    const interval = setInterval(pollNotifs, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [setLocation]);

  const handleLogout = () => {
    clearSession();
    setLocation(ADMIN_BASE_PATH);
  };

  const role = me.role;
  const allowed = !allow || (role && allow.includes(role));
  const visibleNav = NAV.filter((n) => !role || n.roles.includes(role));
  const notifCount = notifications ?? pendingNew;

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground flex">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen w-64 sm:w-72 bg-card border-l border-border z-40 transform transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        } flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 sm:px-6 h-16 border-b border-border shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm">HyperSoft</div>
            <div className="text-[11px] text-muted-foreground">لوحة التحكم</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-1 hover:bg-accent rounded"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="px-2 sm:px-3 py-4 space-y-0.5 overflow-y-auto flex-1">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active =
              location === item.path ||
              (item.path === "/dashboard" && location === "/dashboard");
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 sm:p-4 border-t border-border bg-card shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 h-16">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden p-2 hover:bg-accent rounded"
              aria-label="القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-black truncate">{title}</h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate hidden sm:block">{subtitle}</p>
              )}
            </div>
            <div className="relative">
              <Link
                href="/dashboard/orders"
                className="p-2 hover:bg-accent rounded-lg block"
                aria-label="الإشعارات"
              >
                <Bell className="w-5 h-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notifCount}
                  </span>
                )}
              </Link>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-card border border-border rounded-lg max-w-[160px] lg:max-w-none">
              <div className="text-right min-w-0">
                <div className="text-xs font-bold leading-tight truncate">
                  {me.displayName ?? me.username ?? "—"}
                </div>
                {role && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] mt-0.5 ${ROLE_BADGE_CLASS[role]}`}
                  >
                    {ROLE_LABELS[role]}
                  </Badge>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                {(me.displayName ?? me.username ?? "?")[0]?.toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {!checked ? (
              <div className="text-center text-muted-foreground py-20">
                جاري التحقق من الصلاحيات...
              </div>
            ) : !allowed ? (
              <div className="text-center py-20">
                <div className="text-2xl font-bold mb-2">🚫 غير مصرح</div>
                <p className="text-muted-foreground mb-4">
                  ليس لديك صلاحية للوصول إلى هذه الصفحة.
                </p>
                <Button asChild>
                  <Link href="/dashboard/home">العودة للرئيسية</Link>
                </Button>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
