import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { adminFetch } from "@/lib/admin-auth";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Mail, Phone, MessageCircle } from "lucide-react";

interface Order {
  id: string;
  name: string;
  serviceType: string;
  status: string;
  contactMethod: string;
  contactValue: string;
  createdAt: number;
}

interface Customer {
  key: string;
  name: string;
  contactMethod: string;
  contactValue: string;
  orderCount: number;
  lastOrderAt: number;
  services: string[];
}

const ICONS: Record<string, typeof Mail> = {
  whatsapp: MessageCircle,
  telegram: MessageCircle,
  email: Mail,
  phone: Phone,
};

export default function AdminCustomers() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    const r = await adminFetch("/api/admin/service-requests");
    if (r.ok) {
      const d = await r.json();
      setOrders(d.requests as Order[]);
    }
    setLoading(false);
  };

  const customers = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();
    for (const o of orders) {
      const key = `${o.contactMethod}:${o.contactValue}`.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.orderCount++;
        existing.lastOrderAt = Math.max(existing.lastOrderAt, o.createdAt);
        if (!existing.services.includes(o.serviceType)) existing.services.push(o.serviceType);
      } else {
        map.set(key, {
          key,
          name: o.name,
          contactMethod: o.contactMethod,
          contactValue: o.contactValue,
          orderCount: 1,
          lastOrderAt: o.createdAt,
          services: [o.serviceType],
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.lastOrderAt - a.lastOrderAt);
  }, [orders]);

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return c.name.toLowerCase().includes(q) || c.contactValue.toLowerCase().includes(q);
  });

  return (
    <AdminShell title="العملاء" subtitle={`${customers.length} عميل`} allow={["admin", "employee"]}>
      <div className="relative mb-4 max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="ابحث عن عميل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin inline ml-2" /> جاري التحميل...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl text-muted-foreground">
          لا يوجد عملاء بعد.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const Icon = ICONS[c.contactMethod.toLowerCase()] ?? Mail;
            return (
              <div key={c.key} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-lg">
                    {c.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground" dir="ltr">
                      <Icon className="w-3 h-3 inline ml-1" />
                      {c.contactValue}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-3">
                  <div>
                    <div className="text-muted-foreground text-xs">عدد الطلبات</div>
                    <div className="font-bold text-primary">{c.orderCount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">آخر طلب</div>
                    <div className="font-medium text-xs">
                      {new Date(c.lastOrderAt).toLocaleDateString("ar-EG")}
                    </div>
                  </div>
                </div>
                {c.services.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {c.services.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
