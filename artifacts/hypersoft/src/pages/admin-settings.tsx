import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { adminFetch, getDisplayName, getRole, getUserId, getUsername, ROLE_BADGE_CLASS, ROLE_LABELS } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AdminSettings() {
  const { toast } = useToast();
  const role = getRole();
  const username = getUsername();
  const displayName = getDisplayName();
  const uid = getUserId();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const changePassword = async () => {
    if (password.length < 6) {
      toast({ title: "كلمة المرور قصيرة جداً", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "كلمتا المرور غير متطابقتين", variant: "destructive" });
      return;
    }
    if (!uid) return;
    setSaving(true);
    const r = await adminFetch(`/api/admin/users/${uid}`, {
      method: "PATCH",
      body: JSON.stringify({ password }),
    });
    const d = await r.json().catch(() => ({}));
    setSaving(false);
    if (!r.ok) {
      toast({ title: "تعذّر التغيير", description: d.error, variant: "destructive" });
      return;
    }
    toast({ title: "تم تحديث كلمة المرور" });
    setPassword("");
    setConfirm("");
  };

  return (
    <AdminShell title="الإعدادات" subtitle="بيانات حسابك">
      <div className="max-w-xl space-y-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold mb-4">معلومات الحساب</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground text-xs mb-1">اسم المستخدم</div>
              <div className="font-medium" dir="ltr">{username}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs mb-1">الاسم الكامل</div>
              <div className="font-medium">{displayName}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs mb-1">الرتبة</div>
              {role && (
                <Badge variant="outline" className={ROLE_BADGE_CLASS[role]}>
                  {ROLE_LABELS[role]}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold mb-4">تغيير كلمة المرور</h3>
          <div className="space-y-3">
            <div>
              <Label>كلمة المرور الجديدة</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Label>تأكيد كلمة المرور</Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <Button onClick={changePassword} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "تحديث كلمة المرور"}
            </Button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
