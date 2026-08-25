import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { adminFetch, getRole, ROLE_BADGE_CLASS, ROLE_LABELS, type AdminRole } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Star, Trash2 } from "lucide-react";

interface User {
  id: string;
  username: string;
  displayName: string;
  role: AdminRole;
}

interface Rating {
  id: string;
  targetUserId: string;
  raterUserId: string;
  stars: number;
  comment: string;
  createdAt: number;
}

export default function AdminRatings() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ targetUserId: "", stars: 5, comment: "" });
  const myRole = getRole();
  const canRate = myRole === "admin" || myRole === "employee";
  const isAdmin = myRole === "admin";

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    const [u, r] = await Promise.all([
      adminFetch("/api/admin/users"),
      adminFetch("/api/admin/ratings"),
    ]);
    if (u.ok) setUsers(((await u.json()).users as User[]));
    if (r.ok) setRatings(((await r.json()).ratings as Rating[]));
    setLoading(false);
  };

  const ratableUsers = users.filter((u) => u.role === "captain" || u.role === "employee");
  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const submit = async () => {
    if (!form.targetUserId) {
      toast({ title: "اختر مستخدماً للتقييم", variant: "destructive" });
      return;
    }
    setSaving(true);
    const r = await adminFetch("/api/admin/ratings", {
      method: "POST",
      body: JSON.stringify(form),
    });
    const d = await r.json().catch(() => ({}));
    setSaving(false);
    if (!r.ok) {
      toast({ title: "تعذّر الحفظ", description: d.error, variant: "destructive" });
      return;
    }
    toast({ title: "تم إضافة التقييم" });
    setOpen(false);
    setForm({ targetUserId: "", stars: 5, comment: "" });
    void load();
  };

  const remove = async (id: string) => {
    const r = await adminFetch(`/api/admin/ratings/${id}`, { method: "DELETE" });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      toast({ title: "تعذّر الحذف", description: d.error, variant: "destructive" });
      return;
    }
    toast({ title: "تم الحذف" });
    void load();
  };

  // Aggregate per user
  const summary = ratableUsers.map((u) => {
    const list = ratings.filter((r) => r.targetUserId === u.id);
    const avg = list.length ? list.reduce((s, r) => s + r.stars, 0) / list.length : 0;
    return { user: u, count: list.length, avg };
  }).sort((a, b) => b.avg - a.avg);

  return (
    <AdminShell title="التقييمات" subtitle={`${ratings.length} تقييم`}>
      {canRate && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 ml-1" /> إضافة تقييم
          </Button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin inline ml-2" /> جاري التحميل...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div>
            <h3 className="font-bold mb-3">متوسط تقييم الفريق</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {summary.length === 0 ? (
                <p className="text-sm text-muted-foreground col-span-full">
                  لا يوجد كباتن أو موظفين بعد.
                </p>
              ) : (
                summary.map(({ user, count, avg }) => (
                  <div key={user.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold">
                        {user.displayName[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate">{user.displayName}</div>
                        <Badge variant="outline" className={`text-[10px] ${ROLE_BADGE_CLASS[user.role]}`}>
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`w-4 h-4 ${
                              n <= Math.round(avg)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm">
                        <span className="font-bold">
                          {count > 0 ? avg.toFixed(1) : "—"}
                        </span>
                        <span className="text-xs text-muted-foreground"> ({count})</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* All ratings list */}
          <div>
            <h3 className="font-bold mb-3">سجل التقييمات</h3>
            {ratings.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-xl text-muted-foreground">
                لا توجد تقييمات بعد.
              </div>
            ) : (
              <div className="space-y-2">
                {ratings.map((r) => {
                  const target = userMap.get(r.targetUserId);
                  const rater = userMap.get(r.raterUserId);
                  return (
                    <div key={r.id} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold">{target?.displayName ?? "—"}</span>
                            {target && (
                              <Badge variant="outline" className={`text-[10px] ${ROLE_BADGE_CLASS[target.role]}`}>
                                {ROLE_LABELS[target.role]}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">— من —</span>
                            <span className="text-sm">{rater?.displayName ?? "—"}</span>
                            {rater && (
                              <Badge variant="outline" className={`text-[10px] ${ROLE_BADGE_CLASS[rater.role]}`}>
                                {ROLE_LABELS[rater.role]}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                className={`w-3.5 h-3.5 ${
                                  n <= r.stars
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                            <span className="text-xs text-muted-foreground mr-2">
                              {new Date(r.createdAt).toLocaleDateString("ar-EG")}
                            </span>
                          </div>
                          {r.comment && (
                            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                              "{r.comment}"
                            </p>
                          )}
                        </div>
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => remove(r.id)}
                            className="text-red-400 hover:text-red-500 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة تقييم</DialogTitle>
            <DialogDescription>قيّم أداء أحد الكباتن أو الموظفين.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>المستخدم</Label>
              <Select
                value={form.targetUserId}
                onValueChange={(v) => setForm({ ...form, targetUserId: v })}
              >
                <SelectTrigger><SelectValue placeholder="اختر مستخدماً" /></SelectTrigger>
                <SelectContent>
                  {ratableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.displayName} — {ROLE_LABELS[u.role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>التقييم (نجوم)</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, stars: n })}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        n <= form.stars
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30 hover:text-yellow-400/50"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>تعليق (اختياري)</Label>
              <Textarea
                rows={3}
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>إلغاء</Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
