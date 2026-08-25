import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { adminFetch, getRole, getUserId, ROLE_BADGE_CLASS, ROLE_LABELS, type AdminRole } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2, Plus, Pencil, Trash2, Wallet, Star } from "lucide-react";

interface User {
  id: string;
  username: string;
  displayName: string;
  role: AdminRole;
  salary: number;
  skills: string[];
  createdAt: number;
}

interface Rating {
  targetUserId: string;
  stars: number;
}

const SKILL_OPTIONS = ["مواقع", "تطبيقات موبايل", "بوتات تيليجرام", "أنظمة Dashboard", "تصميم UI/UX", "Backend", "DevOps"];

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    username: "",
    displayName: "",
    password: "",
    role: "captain" as AdminRole,
    salary: "0",
    skills: [] as string[],
  });
  const [filter, setFilter] = useState<AdminRole | "all">("all");

  const myRole = getRole();
  const myId = getUserId();
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
    if (u.ok) {
      const d = await u.json();
      setUsers(d.users as User[]);
    }
    if (r.ok) {
      const d = await r.json();
      setRatings(d.ratings as Rating[]);
    }
    setLoading(false);
  };

  const avgRatingFor = (uid: string): { avg: number; count: number } => {
    const list = ratings.filter((r) => r.targetUserId === uid);
    if (list.length === 0) return { avg: 0, count: 0 };
    return {
      avg: Math.round((list.reduce((s, r) => s + r.stars, 0) / list.length) * 10) / 10,
      count: list.length,
    };
  };

  const startCreate = () => {
    setEditing(null);
    setForm({
      username: "",
      displayName: "",
      password: "",
      role: isAdmin ? "captain" : "captain",
      salary: "0",
      skills: [],
    });
    setOpen(true);
  };

  const startEdit = (u: User) => {
    setEditing(u);
    setForm({
      username: u.username,
      displayName: u.displayName,
      password: "",
      role: u.role,
      salary: String(u.salary),
      skills: u.skills,
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) {
        const payload: Record<string, unknown> = {
          displayName: form.displayName.trim() || form.username,
          skills: form.skills,
        };
        if (form.password) payload["password"] = form.password;
        if (isAdmin) {
          payload["role"] = form.role;
          payload["salary"] = Number(form.salary) || 0;
        }
        const r = await adminFetch(`/api/admin/users/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error ?? "تعذّر التحديث");
        toast({ title: "تم تحديث المستخدم" });
      } else {
        const payload = {
          username: form.username.trim(),
          displayName: form.displayName.trim() || form.username.trim(),
          password: form.password,
          role: form.role,
          salary: Number(form.salary) || 0,
          skills: form.skills,
        };
        const r = await adminFetch("/api/admin/users", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error ?? "تعذّرت الإضافة");
        toast({ title: "تم إنشاء المستخدم" });
      }
      setOpen(false);
      void load();
    } catch (err) {
      toast({
        title: "خطأ",
        description: err instanceof Error ? err.message : "حدث خطأ",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const r = await adminFetch(`/api/admin/users/${pendingDelete.id}`, { method: "DELETE" });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      toast({ title: "تعذّر الحذف", description: d.error, variant: "destructive" });
      return;
    }
    toast({ title: "تم الحذف" });
    setPendingDelete(null);
    void load();
  };

  const filtered = useMemo(() => {
    if (filter === "all") return users;
    return users.filter((u) => u.role === filter);
  }, [users, filter]);

  const toggleSkill = (s: string) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(s) ? f.skills.filter((x) => x !== s) : [...f.skills, s],
    }));
  };

  return (
    <AdminShell title="إدارة المستخدمين" subtitle={`${users.length} مستخدم`} allow={["admin", "employee"]}>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Select value={filter} onValueChange={(v) => setFilter(v as AdminRole | "all")}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الرتب</SelectItem>
            <SelectItem value="admin">مدراء</SelectItem>
            <SelectItem value="employee">موظفون</SelectItem>
            <SelectItem value="captain">كباتن</SelectItem>
            <SelectItem value="client">عملاء</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button onClick={startCreate}>
          <Plus className="w-4 h-4 ml-1" /> مستخدم جديد
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin inline ml-2" /> جاري التحميل...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl text-muted-foreground">
          لا يوجد مستخدمون.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u) => {
            const r = avgRatingFor(u.id);
            const isMe = u.id === myId;
            return (
              <div key={u.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-lg">
                    {(u.displayName || u.username)[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-bold truncate">{u.displayName}</div>
                      {isMe && <span className="text-[10px] text-primary">(أنا)</span>}
                    </div>
                    <div className="text-xs text-muted-foreground" dir="ltr">@{u.username}</div>
                  </div>
                  <Badge variant="outline" className={ROLE_BADGE_CLASS[u.role]}>
                    {ROLE_LABELS[u.role]}
                  </Badge>
                </div>

                {u.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {u.skills.map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 bg-muted rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm border-t border-border pt-3">
                  {isAdmin && u.role !== "client" && (
                    <div>
                      <div className="text-muted-foreground text-xs flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        الراتب
                      </div>
                      <div className="font-bold" dir="ltr">${u.salary.toLocaleString()}</div>
                    </div>
                  )}
                  {(u.role === "captain" || u.role === "employee") && (
                    <div>
                      <div className="text-muted-foreground text-xs flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        التقييم
                      </div>
                      <div className="font-bold">
                        {r.count > 0 ? `${r.avg} / 5` : "—"}
                        {r.count > 0 && (
                          <span className="text-xs text-muted-foreground"> ({r.count})</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => startEdit(u)} className="flex-1">
                    <Pencil className="w-3.5 h-3.5 ml-1" /> تعديل
                  </Button>
                  {isAdmin && !isMe && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPendingDelete(u)}
                      className="text-red-400 hover:text-red-500"
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل مستخدم" : "مستخدم جديد"}</DialogTitle>
            <DialogDescription>
              {isAdmin
                ? "بإمكانك إنشاء أي رتبة وتحديد الراتب."
                : "كموظف، تستطيع إضافة كباتن فقط."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>اسم المستخدم</Label>
                <Input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  disabled={!!editing}
                  dir="ltr"
                />
              </div>
              <div>
                <Label>الاسم الكامل</Label>
                <Input
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>كلمة المرور {editing && "(اتركها فارغة للإبقاء)"}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>الرتبة</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v as AdminRole })}
                  disabled={!isAdmin && !editing}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {isAdmin && <SelectItem value="admin">مدير</SelectItem>}
                    {isAdmin && <SelectItem value="employee">موظف</SelectItem>}
                    <SelectItem value="captain">كابتن</SelectItem>
                    {isAdmin && <SelectItem value="client">عميل</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              {isAdmin && (
                <div>
                  <Label>الراتب (USD)</Label>
                  <Input
                    type="number"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  />
                </div>
              )}
            </div>
            <div>
              <Label>المهارات</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {SKILL_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSkill(s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      form.skills.includes(s)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-border hover:bg-accent"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>إلغاء</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المستخدم؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيُحذف "{pendingDelete?.displayName}" نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}
