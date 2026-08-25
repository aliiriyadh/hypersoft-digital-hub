import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Loader2,
  Plus,
  Trash2,
  LogOut,
  ShieldCheck,
  Pencil,
  FolderPlus,
  ListPlus,
  Eye,
  Download,
  ExternalLink,
} from "lucide-react";
import {
  ADMIN_BASE_PATH,
  adminFetch,
  clearSession,
  getToken,
} from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin-shell";
import type { Project, Category } from "@/lib/project-types";

type RequestStatus = "new" | "accepted" | "in-progress" | "completed" | "rejected";

interface ServiceRequest {
  id: string;
  name: string;
  serviceType: string;
  description: string;
  budget: string;
  contactMethod: string;
  contactValue: string;
  status: RequestStatus;
  createdAt: number;
}

const STATUS_LABELS: Record<RequestStatus, string> = {
  new: "جديد",
  accepted: "مقبول",
  "in-progress": "قيد التنفيذ",
  completed: "مكتمل",
  rejected: "مرفوض",
};

const STATUS_COLORS: Record<RequestStatus, string> = {
  new: "bg-blue-500",
  accepted: "bg-purple-500",
  "in-progress": "bg-yellow-500 text-black",
  completed: "bg-green-500",
  rejected: "bg-red-500",
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filter, setFilter] = useState<string>("_all");
  const [pendingDeleteProject, setPendingDeleteProject] =
    useState<Project | null>(null);
  const [pendingDeleteCategory, setPendingDeleteCategory] =
    useState<Category | null>(null);
  const [pendingDeleteRequest, setPendingDeleteRequest] =
    useState<ServiceRequest | null>(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setLocation(ADMIN_BASE_PATH);
      return;
    }
    void loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const meRes = await adminFetch("/api/admin/me");
      if (meRes.status === 401) {
        clearSession();
        setLocation(ADMIN_BASE_PATH);
        return;
      }
      const [pRes, cRes, rRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/categories"),
        adminFetch("/api/admin/service-requests"),
      ]);
      const pData = await pRes.json();
      const cData = await cRes.json();
      const rData = rRes.ok ? await rRes.json() : { requests: [] };
      setProjects(pData.projects ?? []);
      setCategories(cData.categories ?? []);
      setRequests(rData.requests ?? []);
    } catch {
      toast({
        title: "خطأ في التحميل",
        description: "تعذّر تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (project: Project) => {
    try {
      const res = await adminFetch(`/api/admin/projects/${project.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      toast({ title: "تم الحذف", description: `تم حذف "${project.title}"` });
      await loadAll();
    } catch (err) {
      toast({
        title: "فشل الحذف",
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      });
    } finally {
      setPendingDeleteProject(null);
    }
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setSavingCategory(true);
    try {
      const res = await adminFetch("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "فشل الإضافة");
      setNewCategoryName("");
      toast({ title: "تمت الإضافة", description: `تم إنشاء "${name}"` });
      await loadAll();
    } catch (err) {
      toast({
        title: "فشل",
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      });
    } finally {
      setSavingCategory(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    const name = editingCategoryName.trim();
    if (!name) return;
    setSavingCategory(true);
    try {
      const res = await adminFetch(
        `/api/admin/categories/${editingCategory.id}`,
        { method: "PATCH", body: JSON.stringify({ name }) },
      );
      if (!res.ok) throw new Error("فشل التحديث");
      setEditingCategory(null);
      setEditingCategoryName("");
      await loadAll();
      toast({ title: "تم التحديث" });
    } catch (err) {
      toast({
        title: "فشل",
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      });
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    try {
      const res = await adminFetch(`/api/admin/categories/${cat.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      toast({ title: "تم الحذف" });
      await loadAll();
    } catch (err) {
      toast({
        title: "فشل",
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      });
    } finally {
      setPendingDeleteCategory(null);
    }
  };

  const handleLogout = () => {
    clearSession();
    setLocation(ADMIN_BASE_PATH);
  };

  const handleUpdateRequestStatus = async (
    id: string,
    status: RequestStatus,
  ) => {
    try {
      const res = await adminFetch(`/api/admin/service-requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("فشل التحديث");
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
      toast({ title: "تم تحديث حالة الطلب" });
    } catch (err) {
      toast({
        title: "فشل",
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRequest = async (req: ServiceRequest) => {
    try {
      const res = await adminFetch(`/api/admin/service-requests/${req.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      toast({ title: "تم حذف الطلب" });
    } catch (err) {
      toast({
        title: "فشل",
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      });
    } finally {
      setPendingDeleteRequest(null);
    }
  };

  const newCount = requests.filter((r) => r.status === "new").length;

  const getCategoryName = (id: string | null): string => {
    if (!id) return "بدون قائمة";
    return categories.find((c) => c.id === id)?.name ?? "بدون قائمة";
  };

  const filteredProjects =
    filter === "_all"
      ? projects
      : filter === "_none"
      ? projects.filter((p) => !p.categoryId)
      : projects.filter((p) => p.categoryId === filter);

  return (
    <AdminShell title="إدارة المحتوى" subtitle="المشاريع والتصنيفات والطلبات">
      <div>
        <Tabs defaultValue="projects" dir="rtl">
          <TabsList>
            <TabsTrigger value="projects">المشاريع</TabsTrigger>
            <TabsTrigger value="categories">القوائم (التصنيفات)</TabsTrigger>
            <TabsTrigger value="requests">
              طلبات الخدمات
              {newCount > 0 && (
                <span className="mr-2 inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {newCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black">
                  المشاريع{" "}
                  <span className="text-muted-foreground text-base font-normal">
                    ({filteredProjects.length})
                  </span>
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">جميع المشاريع</SelectItem>
                    <SelectItem value="_none">بدون قائمة</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Link href={`${ADMIN_BASE_PATH}/new`}>
                  <Button>
                    <Plus className="w-4 h-4 ml-2" />
                    مشروع جديد
                  </Button>
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
                لا توجد مشاريع. أضف أول مشروع.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    className="bg-card border border-border rounded-xl overflow-hidden flex flex-col"
                  >
                    <div className="aspect-video bg-muted overflow-hidden relative">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {p.comingSoon ? (
                          <Badge className="bg-yellow-500 text-black">
                            قريباً
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500 text-white">
                            منشور
                          </Badge>
                        )}
                        {p.actionType === "view" && !p.comingSoon && (
                          <Badge variant="outline" className="bg-background/90">
                            <Eye className="w-3 h-3" />
                          </Badge>
                        )}
                        {p.actionType === "download" && !p.comingSoon && (
                          <Badge variant="outline" className="bg-background/90">
                            <Download className="w-3 h-3" />
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col gap-2">
                      <h3 className="font-bold line-clamp-1">{p.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                        {p.description}
                      </p>
                      <div className="text-[11px] text-muted-foreground">
                        <span className="font-mono">
                          {getCategoryName(p.categoryId)}
                        </span>
                        {p.content.length > 0 && (
                          <span> • {p.content.length} عنصر</span>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Link
                          href={`${ADMIN_BASE_PATH}/edit/${p.id}`}
                          className="flex-1"
                        >
                          <Button variant="outline" size="sm" className="w-full">
                            <Pencil className="w-3 h-3 ml-2" />
                            تعديل
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setPendingDeleteProject(p)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className="mt-6 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FolderPlus className="w-5 h-5 text-primary" />
                <h3 className="font-bold">إنشاء قائمة جديدة</h3>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="اسم القائمة (مثل: تطبيقات الويب، تطبيقات موبايل...)"
                  maxLength={80}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleAddCategory();
                  }}
                />
                <Button
                  onClick={handleAddCategory}
                  disabled={savingCategory || !newCategoryName.trim()}
                >
                  <ListPlus className="w-4 h-4 ml-2" />
                  إنشاء
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">
                القوائم الحالية ({categories.length})
              </h3>
              {categories.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                  لا توجد قوائم بعد.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categories.map((c) => {
                    const count = projects.filter(
                      (p) => p.categoryId === c.id,
                    ).length;
                    const isEditing = editingCategory?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        className="bg-card border border-border rounded-xl p-4"
                      >
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Input
                              value={editingCategoryName}
                              onChange={(e) =>
                                setEditingCategoryName(e.target.value)
                              }
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={handleUpdateCategory}
                              disabled={savingCategory}
                            >
                              حفظ
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingCategory(null)}
                            >
                              إلغاء
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold">{c.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {count} مشروع
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setEditingCategory(c);
                                  setEditingCategoryName(c.name);
                                }}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setPendingDeleteCategory(c)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black">
                طلبات الخدمات{" "}
                <span className="text-muted-foreground text-base font-normal">
                  ({requests.length})
                </span>
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
                لا توجد طلبات بعد.
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((r) => (
                  <div
                    key={r.id}
                    className="bg-card border border-border rounded-xl p-5"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="font-bold text-lg">{r.name}</h3>
                          <Badge className={STATUS_COLORS[r.status]}>
                            {STATUS_LABELS[r.status]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(r.createdAt).toLocaleString("ar-IQ")}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">الخدمة: </span>
                            <span className="font-medium">{r.serviceType}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">الميزانية: </span>
                            <span className="font-medium">
                              {r.budget || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">التواصل: </span>
                            <span className="font-medium" dir="ltr">
                              {r.contactMethod} — {r.contactValue}
                            </span>
                          </div>
                        </div>
                        <div className="bg-muted/40 rounded-md p-3 text-sm whitespace-pre-wrap">
                          {r.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border">
                      <Select
                        value={r.status}
                        onValueChange={(v) =>
                          handleUpdateRequestStatus(r.id, v as RequestStatus)
                        }
                      >
                        <SelectTrigger className="w-44">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(STATUS_LABELS) as RequestStatus[]).map(
                            (s) => (
                              <SelectItem key={s} value={s}>
                                {STATUS_LABELS[s]}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setPendingDeleteRequest(r)}
                      >
                        <Trash2 className="w-3 h-3 ml-2" />
                        حذف
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <a
            href="/projects"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            معاينة صفحة المشاريع العامة
          </a>
        </div>
      </div>

      <AlertDialog
        open={!!pendingDeleteProject}
        onOpenChange={(open) => !open && setPendingDeleteProject(null)}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف المشروع</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف "{pendingDeleteProject?.title}"؟ لا يمكن
              التراجع.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                pendingDeleteProject && handleDeleteProject(pendingDeleteProject)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف نهائياً
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!pendingDeleteCategory}
        onOpenChange={(open) => !open && setPendingDeleteCategory(null)}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف القائمة</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف القائمة "{pendingDeleteCategory?.name}" والمشاريع
              المرتبطة بها ستصبح بدون قائمة. لا يمكن التراجع.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                pendingDeleteCategory && handleDeleteCategory(pendingDeleteCategory)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف نهائياً
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!pendingDeleteRequest}
        onOpenChange={(open) => !open && setPendingDeleteRequest(null)}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف الطلب</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف طلب "{pendingDeleteRequest?.name}"؟ لا يمكن
              التراجع.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                pendingDeleteRequest && handleDeleteRequest(pendingDeleteRequest)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف نهائياً
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Label htmlFor="hidden-form" className="hidden" />
    </AdminShell>
  );
}
