import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { adminFetch } from "@/lib/admin-auth";
import {
  ShoppingCart,
  Briefcase,
  Users,
  Wallet,
  TrendingUp,
  Activity,
  Loader2,
} from "lucide-react";

interface Stats {
  summary: {
    requestsToday: number;
    requestsTotal: number;
    activeOrders: number;
    completedOrders: number;
    projectsTotal: number;
    servicesTotal: number;
    usersTotal: number;
    captainsTotal: number;
    employeesTotal: number;
    totalSalaries: number;
  };
  days: { date: string; count: number }[];
  topServices: { name: string; count: number }[];
  statusCounts: Record<string, number>;
}

interface ServiceRequest {
  id: string;
  name: string;
  serviceType: string;
  status: string;
  createdAt: number;
}

const STATUS_LABELS: Record<string, string> = {
  new: "جديد",
  accepted: "مقبول",
  "in-progress": "قيد التنفيذ",
  completed: "مكتمل",
  rejected: "مرفوض",
};

export default function AdminHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([
        adminFetch("/api/admin/stats"),
        adminFetch("/api/admin/service-requests"),
      ]);
      if (s.ok) setStats(await s.json());
      if (r.ok) {
        const d = await r.json();
        setRecent(
          (d.requests as ServiceRequest[])
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 8),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const maxDay = Math.max(1, ...(stats?.days.map((d) => d.count) ?? [1]));

  return (
    <AdminShell title="الرئيسية" subtitle="لمحة عامة عن أداء HyperSoft">
      {loading || !stats ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin ml-2" /> جاري التحميل...
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="طلبات اليوم"
              value={stats.summary.requestsToday}
              icon={ShoppingCart}
              color="text-blue-400 bg-blue-500/15"
            />
            <KpiCard
              label="إجمالي الطلبات"
              value={stats.summary.requestsTotal}
              icon={TrendingUp}
              color="text-green-400 bg-green-500/15"
            />
            <KpiCard
              label="مشاريع جارية"
              value={stats.summary.activeOrders}
              icon={Activity}
              color="text-yellow-400 bg-yellow-500/15"
            />
            <KpiCard
              label="رواتب الفريق"
              value={`$${stats.summary.totalSalaries.toLocaleString()}`}
              icon={Wallet}
              color="text-purple-400 bg-purple-500/15"
            />
            <KpiCard
              label="إجمالي المشاريع"
              value={stats.summary.projectsTotal}
              icon={Briefcase}
              color="text-pink-400 bg-pink-500/15"
            />
            <KpiCard
              label="الخدمات"
              value={stats.summary.servicesTotal}
              icon={Briefcase}
              color="text-cyan-400 bg-cyan-500/15"
            />
            <KpiCard
              label="الفريق"
              value={stats.summary.captainsTotal + stats.summary.employeesTotal}
              icon={Users}
              color="text-orange-400 bg-orange-500/15"
            />
            <KpiCard
              label="مكتملة"
              value={stats.summary.completedOrders}
              icon={Activity}
              color="text-emerald-400 bg-emerald-500/15"
            />
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Daily requests bar chart */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-bold mb-4">الطلبات اليومية (آخر 14 يوم)</h3>
              <div className="flex items-end gap-1 h-44" dir="ltr">
                {stats.days.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end h-36">
                      <div
                        className="w-full bg-gradient-to-t from-primary to-primary/40 rounded-t transition-all"
                        style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? "4px" : "0" }}
                        title={`${d.date}: ${d.count}`}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top services */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-bold mb-4">أكثر الخدمات طلباً</h3>
              {stats.topServices.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا توجد بيانات بعد.</p>
              ) : (
                <div className="space-y-3">
                  {stats.topServices.map((s, i) => {
                    const pct = (s.count / stats.topServices[0]!.count) * 100;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{s.name}</span>
                          <span className="text-muted-foreground">{s.count}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary/50"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-bold mb-4">آخر النشاطات</h3>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد طلبات بعد.</p>
            ) : (
              <div className="space-y-2">
                {recent.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{r.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {r.serviceType}
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {new Date(r.createdAt).toLocaleDateString("ar-EG")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: typeof ShoppingCart;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
