import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { adminFetch } from "@/lib/admin-auth";
import { Loader2, Star } from "lucide-react";

interface CaptainStat {
  id: string;
  displayName: string;
  username: string;
  avgRating: number;
  ratingsCount: number;
  completedOrders: number;
  activeOrders: number;
}

interface Stats {
  summary: {
    requestsTotal: number;
    completedOrders: number;
    activeOrders: number;
  };
  topServices: { name: string; count: number }[];
  statusCounts: Record<string, number>;
  captainStats: CaptainStat[];
}

const STATUS_LABELS: Record<string, string> = {
  new: "جديد",
  accepted: "مقبول",
  "in-progress": "قيد التنفيذ",
  completed: "مكتمل",
  rejected: "مرفوض",
};

const STATUS_COLORS: Record<string, string> = {
  new: "from-blue-500 to-blue-400",
  accepted: "from-purple-500 to-purple-400",
  "in-progress": "from-yellow-500 to-yellow-400",
  completed: "from-green-500 to-green-400",
  rejected: "from-red-500 to-red-400",
};

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    const r = await adminFetch("/api/admin/stats");
    if (r.ok) setStats(await r.json());
    setLoading(false);
  };

  return (
    <AdminShell title="الإحصائيات" subtitle="تحليلات مفصّلة عن أداء النظام" allow={["admin", "employee"]}>
      {loading || !stats ? (
        <div className="text-center py-20 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin inline ml-2" /> جاري التحميل...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status distribution */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-bold mb-4">توزيع الطلبات حسب الحالة</h3>
            <div className="space-y-3">
              {Object.entries(stats.statusCounts).map(([status, count]) => {
                const total = stats.summary.requestsTotal || 1;
                const pct = (count / total) * 100;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{STATUS_LABELS[status] ?? status}</span>
                      <span className="text-muted-foreground">
                        {count} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${STATUS_COLORS[status] ?? "from-primary to-primary/50"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top services */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-bold mb-4">أكثر الخدمات طلباً</h3>
            {stats.topServices.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد بيانات.</p>
            ) : (
              <div className="space-y-3">
                {stats.topServices.map((s, i) => {
                  const pct = (s.count / stats.topServices[0]!.count) * 100;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-muted-foreground">{s.count} طلب</span>
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

          {/* Captain performance */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-bold mb-4">أداء الكباتن</h3>
            {stats.captainStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا يوجد كباتن بعد.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-2 text-right">الكابتن</th>
                      <th className="p-2 text-right">المهام النشطة</th>
                      <th className="p-2 text-right">المكتملة</th>
                      <th className="p-2 text-right">متوسط التقييم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.captainStats.map((c) => (
                      <tr key={c.id} className="border-b border-border/50">
                        <td className="p-2 font-bold">{c.displayName}</td>
                        <td className="p-2">{c.activeOrders}</td>
                        <td className="p-2 text-green-400">{c.completedOrders}</td>
                        <td className="p-2">
                          {c.ratingsCount > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              {c.avgRating} ({c.ratingsCount})
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
