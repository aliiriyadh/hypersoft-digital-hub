import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { adminFetch, getRole } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: string;
  createdAt: number;
}

export default function AdminServices() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Service | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price: "0", icon: "category" });
  const [saving, setSaving] = useState(false);
  const role = getRole();
  const isAdmin = role === "admin";

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    const r = await adminFetch("/api/admin/services");
    if (r.ok) {
      const d = await r.json();
      setServices(d.services as Service[]);
    }
    setLoading(false);
  };

  const startCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", price: "0", icon: "category" });
    setOpen(true);
  };

  const startEdit = (s: Service) => {
    setEditing(s);
    setForm({ title: s.title, description: s.description, price: String(s.price), icon: s.icon });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      icon: form.icon.trim() || "category",
    };
    if (!payload.title || !payload.description) {
      toast({ title: "العنوان والوصف مطلوبان", variant: "destructive" });
      setSaving(false);
      return;
    }
    const url = editing ? `/api/admin/services/${editing.id}` : "/api/admin/services";
    const method = editing ? "PATCH" : "POST";
    const res = await adminFetch(url, { method, body: JSON.stringify(payload) });
    const d = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      toast({ title: "تعذّر الحفظ", description: d.error, variant: "destructive" });
      return;
    }
    toast({ title: editing ? "تم التحديث" : "تم إضافة الخدمة" });
    setOpen(false);
    void load();
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const res = await adminFetch(`/api/admin/services/${pendingDelete.id}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast({ title: "تعذّر الحذف", description: d.error, variant: "destructive" });
      return;
    }
    toast({ title: "تم الحذف" });
    setPendingDelete(null);
    void load();
  };

  return (
    <AdminShell title="إدارة الخدمات" subtitle={`${services.length} خدمة`} allow={["admin", "employee"]}>
      <div className="flex justify-end mb-4">
        <Button onClick={startCreate}>
          <Plus className="w-4 h-4 ml-1" />
          خدمة جديدة
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin inline ml-2" /> جاري التحميل...
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl text-muted-foreground">
          لا توجد خدمات بعد.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">{s.icon}</span>
                </div>
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">يبدأ من</div>
                  <div className="font-black text-primary" dir="ltr">${s.price}</div>
                </div>
              </div>
              <h3 className="font-bold mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3.75rem]">{s.description}</p>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => startEdit(s)} className="flex-1">
                  <Pencil className="w-3.5 h-3.5 ml-1" />
                  تعديل
                </Button>
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPendingDelete(s)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل خدمة" : "خدمة جديدة"}</DialogTitle>
            <DialogDescription>أدخل بيانات الخدمة لعرضها للعملاء.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>العنوان</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>الوصف</Label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>السعر (USD)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div>
                <Label>الأيقونة (Material Symbols)</Label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="language, smartphone, smart_toy..."
                />
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
            <AlertDialogTitle>حذف الخدمة؟</AlertDialogTitle>
            <AlertDialogDescription>
              ستُحذف "{pendingDelete?.title}" نهائياً.
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
