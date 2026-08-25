import { Fragment, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { adminFetch, getRole, getUserId } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Trash2, UserPlus, MessageSquare } from "lucide-react";

type Status = "new" | "accepted" | "in-progress" | "completed" | "rejected";

interface Order {
  id: string;
  name: string;
  serviceType: string;
  description: string;
  budget: string;
  contactMethod: string;
  contactValue: string;
  status: Status;
  assignedCaptainId: string | null;
  createdAt: number;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  role: "admin" | "employee" | "captain" | "client";
}

const STATUS_LABELS: Record<Status, string> = {
  new: "جديد",
  accepted: "مقبول",
  "in-progress": "قيد التنفيذ",
  completed: "مكتمل",
  rejected: "مرفوض",
};

const STATUS_COLORS: Record<Status, string> = {
  new: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  accepted: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "in-progress": "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  completed: "bg-green-500/15 text-green-400 border-green-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Order | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const role = getRole();
  const myId = getUserId();
  const isCaptain = role === "captain";

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [oRes, uRes] = await Promise.all([
        adminFetch("/api/admin/service-requests"),
        adminFetch("/api/admin/users"),
      ]);
      if (oRes.ok) {
        const d = await oRes.json();
        setOrders(d.requests as Order[]);
      }
      if (uRes.ok) {
        const d = await uRes.json();
        setUsers(d.users as User[]);
      }
    } finally {
      setLoading(false);
    }
  };

  const captains = users.filter((u) => u.role === "captain");

  const filtered = useMemo(() => {
    let list = orders;
    if (isCaptain) list = list.filter((o) => o.assignedCaptainId === myId);
    if (filter !== "all") list = list.filter((o) => o.status === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.serviceType.toLowerCase().includes(q) ||
          o.contactValue.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => b.createdAt - a.createdAt);
  }, [orders, filter, search, isCaptain, myId]);

  const updateStatus = async (id: string, status: Status) => {
    const res = await adminFetch(`/api/admin/service-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast({ title: "تعذّر التحديث", description: d.error, variant: "destructive" });
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? d.request : o)));
    toast({ title: "تم تحديث الحالة" });
  };

  const assignCaptain = async (id: string, captainId: string | null) => {
    const res = await adminFetch(`/api/admin/service-requests/${id}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ captainId }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast({ title: "تعذّر التعيين", description: d.error, variant: "destructive" });
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? d.request : o)));
    toast({ title: "تم تعيين الكابتن" });
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const res = await adminFetch(`/api/admin/service-requests/${pendingDelete.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast({ title: "تعذّر الحذف", description: d.error, variant: "destructive" });
      return;
    }
    setOrders((prev) => prev.filter((o) => o.id !== pendingDelete.id));
    setPendingDelete(null);
    toast({ title: "تم حذف الطلب" });
  };

  const captainName = (id: string | null) => {
    if (!id) return "—";
    const c = captains.find((x) => x.id === id);
    return c?.displayName ?? c?.username ?? "—";
  };

  return (
    <AdminShell title="إدارة الطلبات" subtitle={`${filtered.length} طلب`}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث بالاسم، الخدمة، أو وسيلة التواصل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as Status | "all")}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin inline ml-2" /> جاري التحميل...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-card border border-border rounded-xl">
          لا توجد طلبات تطابق البحث.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase">
                <tr>
                  <th className="p-3 text-right">العميل</th>
                  <th className="p-3 text-right">الخدمة</th>
                  <th className="p-3 text-right">الحالة</th>
                  <th className="p-3 text-right">الكابتن</th>
                  <th className="p-3 text-right">التاريخ</th>
                  <th className="p-3 text-right">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <Fragment key={o.id}>
                    <tr
                      className="border-t border-border hover:bg-muted/20 cursor-pointer"
                      onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                    >
                      <td className="p-3 font-bold">{o.name}</td>
                      <td className="p-3">{o.serviceType}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={STATUS_COLORS[o.status]}>
                          {STATUS_LABELS[o.status]}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {captainName(o.assignedCaptainId)}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2 items-center">
                          <Select
                            value={o.status}
                            onValueChange={(v) => updateStatus(o.id, v as Status)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                                <SelectItem key={k} value={k}>{v}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {!isCaptain && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-500"
                              onClick={() => setPendingDelete(o)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expanded === o.id && (
                      <tr className="bg-muted/10">
                        <td colSpan={6} className="p-4">
                          <div className="grid sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground text-xs mb-1">الميزانية</div>
                              <div className="font-medium">{o.budget || "—"}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground text-xs mb-1">التواصل</div>
                              <div className="font-medium" dir="ltr">
                                {o.contactMethod}: {o.contactValue}
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <div className="text-muted-foreground text-xs mb-1">الوصف</div>
                              <div className="whitespace-pre-wrap bg-background/50 p-3 rounded border border-border">
                                {o.description || "—"}
                              </div>
                            </div>
                            {!isCaptain && (
                              <div className="sm:col-span-2">
                                <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                                  <UserPlus className="w-3 h-3" />
                                  تعيين كابتن
                                </div>
                                <Select
                                  value={o.assignedCaptainId ?? "_none"}
                                  onValueChange={(v) =>
                                    assignCaptain(o.id, v === "_none" ? null : v)
                                  }
                                >
                                  <SelectTrigger className="w-full sm:w-72">
                                    <SelectValue placeholder="اختر كابتن" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="_none">— غير معيّن —</SelectItem>
                                    {captains.map((c) => (
                                      <SelectItem key={c.id} value={c.id}>
                                        {c.displayName} ({c.username})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {captains.length === 0 && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    <MessageSquare className="w-3 h-3 inline ml-1" />
                                    لا يوجد كباتن مضافين بعد. أضف من تبويب "المستخدمين".
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الطلب؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيُحذف طلب "{pendingDelete?.name}" نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}
