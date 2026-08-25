import { useEffect, useRef, useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Save,
  ArrowRight,
  Heading1,
  Heading2,
  Type,
  Image as ImageIcon,
  Video,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Eye,
  Download,
  Palette,
  ShieldCheck,
} from "lucide-react";
import {
  ADMIN_BASE_PATH,
  adminFetch,
  clearSession,
  getToken,
} from "@/lib/admin-auth";
import {
  type Project,
  type Category,
  type ContentBlock,
  type CoverAspect,
  type CoverFit,
  type ActionType,
  ASPECT_CLASS,
  ASPECT_LABEL,
} from "@/lib/project-types";

const DEFAULT_IMAGES = [
  "/images/project-erp.png",
  "/images/project-mobile.png",
  "/images/project-ecommerce.png",
  "/images/project-ai.png",
];

const PRESET_COLORS = [
  { name: "افتراضي", value: "" },
  { name: "أساسي", value: "var(--primary)" },
  { name: "ثانوي", value: "var(--secondary)" },
  { name: "أبيض", value: "#ffffff" },
  { name: "رمادي", value: "#94a3b8" },
  { name: "أحمر", value: "#ef4444" },
  { name: "أخضر", value: "#22c55e" },
  { name: "أصفر", value: "#eab308" },
  { name: "أزرق", value: "#3b82f6" },
];

function newId(): string {
  return `b-${Math.random().toString(36).slice(2, 10)}`;
}

function emptyProject(): Project {
  return {
    id: "",
    title: "",
    description: "",
    image: DEFAULT_IMAGES[0]!,
    coverAspect: "video",
    coverFit: "cover",
    tags: [],
    comingSoon: true,
    categoryId: null,
    actionType: "none",
    actionUrl: "",
    useTheme: true,
    content: [],
    createdAt: 0,
  };
}

export default function AdminEditor() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute(`${ADMIN_BASE_PATH}/edit/:id`);
  const [, isNew] = useRoute(`${ADMIN_BASE_PATH}/new`);
  const { toast } = useToast();

  const editingId = params?.id ?? null;
  const [loading, setLoading] = useState(!!editingId);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<Project>(emptyProject());
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const coverFileRef = useRef<HTMLInputElement>(null);
  const blockFileRef = useRef<HTMLInputElement>(null);
  const blockFileTypeRef = useRef<"image" | "video">("image");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setLocation(ADMIN_BASE_PATH);
      return;
    }
    void loadCategories();
    if (editingId) void loadProject(editingId);
  }, [editingId]);

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch {
      // ignore
    }
  };

  const loadProject = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      const found = (data.projects as Project[]).find((p) => p.id === id);
      if (!found) {
        toast({ title: "المشروع غير موجود", variant: "destructive" });
        setLocation(`${ADMIN_BASE_PATH}/dashboard`);
        return;
      }
      setProject(found);
      setTagsInput(found.tags.join(", "));
    } catch {
      toast({ title: "تعذّر تحميل المشروع", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const update = <K extends keyof Project>(key: K, value: Project[K]) => {
    setProject((p) => ({ ...p, [key]: value }));
  };

  const updateBlock = (id: string, patch: Partial<ContentBlock>) => {
    setProject((p) => ({
      ...p,
      content: p.content.map((b) =>
        b.id === id ? ({ ...b, ...patch } as ContentBlock) : b,
      ),
    }));
  };

  const addBlock = (type: ContentBlock["type"]) => {
    const id = newId();
    let block: ContentBlock;
    if (type === "image") {
      block = { id, type, url: "", width: null, height: null, alt: "" };
    } else if (type === "video") {
      block = { id, type, url: "" };
    } else {
      block = { id, type, text: "", color: null };
    }
    setProject((p) => ({ ...p, content: [...p.content, block] }));
  };

  const removeBlock = (id: string) => {
    setProject((p) => ({ ...p, content: p.content.filter((b) => b.id !== id) }));
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    setProject((p) => {
      const arr = [...p.content];
      const idx = arr.findIndex((b) => b.id === id);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= arr.length) return p;
      [arr[idx], arr[next]] = [arr[next]!, arr[idx]!];
      return { ...p, content: arr };
    });
  };

  const uploadFile = async (
    file: File,
  ): Promise<{ url: string; kind: "image" | "video" } | null> => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const token = getToken();
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "فشل الرفع");
      return { url: data.url, kind: data.kind };
    } catch (err) {
      toast({
        title: "فشل رفع الملف",
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const r = await uploadFile(file);
    if (r) update("image", r.url);
  };

  const handleBlockUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const r = await uploadFile(file);
    if (!r) return;
    const id = newId();
    const block: ContentBlock =
      blockFileTypeRef.current === "video"
        ? { id, type: "video", url: r.url }
        : { id, type: "image", url: r.url, width: null, height: null, alt: "" };
    setProject((p) => ({ ...p, content: [...p.content, block] }));
  };

  const triggerBlockUpload = (kind: "image" | "video") => {
    blockFileTypeRef.current = kind;
    blockFileRef.current?.setAttribute(
      "accept",
      kind === "video" ? "video/*" : "image/*",
    );
    blockFileRef.current?.click();
  };

  const handleSave = async () => {
    if (!project.title.trim() || !project.description.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "العنوان والوصف مطلوبان",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const payload = { ...project, tags };
      const url = editingId
        ? `/api/admin/projects/${editingId}`
        : "/api/admin/projects";
      const method = editingId ? "PATCH" : "POST";
      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        clearSession();
        setLocation(ADMIN_BASE_PATH);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "فشل الحفظ");
      toast({
        title: editingId ? "تم التحديث" : "تم الحفظ",
        description: "تم حفظ المشروع بنجاح.",
      });
      setLocation(`${ADMIN_BASE_PATH}/dashboard`);
    } catch (err) {
      toast({
        title: "فشل الحفظ",
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <input
        ref={coverFileRef}
        type="file"
        accept="image/*"
        onChange={handleCoverUpload}
        className="hidden"
      />
      <input
        ref={blockFileRef}
        type="file"
        onChange={handleBlockUpload}
        className="hidden"
      />

      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href={`${ADMIN_BASE_PATH}/dashboard`}>
              <Button variant="outline" size="sm">
                <ArrowRight className="w-4 h-4 ml-2" />
                رجوع
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h1 className="font-bold">
                {editingId ? "تعديل مشروع" : "مشروع جديد"}
              </h1>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                حفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Basic info */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold">المعلومات الأساسية</h2>
          <div className="space-y-2">
            <Label htmlFor="title">عنوان المشروع</Label>
            <Input
              id="title"
              value={project.title}
              onChange={(e) => update("title", e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">وصف مختصر</Label>
            <Textarea
              id="description"
              value={project.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>
          <div className="space-y-2">
            <Label>التقنيات (مفصولة بفاصلة)</Label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="React, Node.js, PostgreSQL"
            />
          </div>
          <div className="space-y-2">
            <Label>القائمة (التصنيف)</Label>
            <Select
              value={project.categoryId ?? "_none"}
              onValueChange={(v) =>
                update("categoryId", v === "_none" ? null : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر قائمة..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">بدون قائمة</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {categories.length === 0 && (
              <p className="text-xs text-muted-foreground">
                لإنشاء قوائم جديدة، ارجع للوحة التحكم.
              </p>
            )}
          </div>
        </section>

        {/* Cover image */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold">صورة الغلاف</h2>
          <div
            className={`${ASPECT_CLASS[project.coverAspect] || "min-h-[200px]"} rounded-lg overflow-hidden bg-muted border border-border`}
          >
            {project.image ? (
              <img
                src={project.image}
                alt=""
                className={`w-full h-full ${
                  project.coverFit === "contain" ? "object-contain" : "object-cover"
                }`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                لا توجد صورة
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {DEFAULT_IMAGES.map((img) => (
              <button
                key={img}
                type="button"
                onClick={() => update("image", img)}
                className={`aspect-video rounded-lg overflow-hidden border-2 ${
                  project.image === img
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => coverFileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 ml-2" />
              )}
              رفع صورة من جهازك
            </Button>
            <Input
              value={project.image}
              onChange={(e) => update("image", e.target.value)}
              placeholder="أو الصق رابط صورة"
              className="flex-1"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>أبعاد الصورة (نسبة العرض إلى الارتفاع)</Label>
              <Select
                value={project.coverAspect}
                onValueChange={(v) =>
                  update("coverAspect", v as CoverAspect)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ASPECT_LABEL) as CoverAspect[]).map((a) => (
                    <SelectItem key={a} value={a}>
                      {ASPECT_LABEL[a]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>طريقة العرض</Label>
              <Select
                value={project.coverFit}
                onValueChange={(v) => update("coverFit", v as CoverFit)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">ملء الإطار (cover)</SelectItem>
                  <SelectItem value="contain">احتواء كامل (contain)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Publishing & action button */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold">النشر والزر</h2>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label className="cursor-pointer">حالة المشروع</Label>
              <p className="text-xs text-muted-foreground mt-1">
                {project.comingSoon
                  ? "وضع “قريباً” — يظهر للزوار كقادم"
                  : "نشر مباشر — منشور بالكامل"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">قريباً</span>
              <Switch
                checked={!project.comingSoon}
                onCheckedChange={(v) => update("comingSoon", !v)}
              />
              <span className="text-sm">نشر</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>زر الإجراء (يظهر فقط إذا كان المشروع منشوراً)</Label>
            <Select
              value={project.actionType}
              onValueChange={(v) => update("actionType", v as ActionType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">بدون زر</SelectItem>
                <SelectItem value="view">زر عرض</SelectItem>
                <SelectItem value="download">زر تحميل</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {project.actionType !== "none" && (
            <div className="space-y-2">
              <Label>
                رابط {project.actionType === "download" ? "التحميل" : "العرض"}
              </Label>
              <Input
                value={project.actionUrl}
                onChange={(e) => update("actionUrl", e.target.value)}
                placeholder="https://..."
                dir="ltr"
              />
            </div>
          )}
        </section>

        {/* Theme styling */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <div>
                <Label className="cursor-pointer">
                  استخدام تنسيق الموقع تلقائياً
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  عند التفعيل، تُتجاهل الألوان المخصصة ويُستخدم تنسيق وألوان
                  الموقع الموحدة.
                </p>
              </div>
            </div>
            <Switch
              checked={project.useTheme}
              onCheckedChange={(v) => update("useTheme", v)}
            />
          </div>
        </section>

        {/* Article content */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">محتوى المقال</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock("h1")}
            >
              <Heading1 className="w-4 h-4 ml-2" />
              عنوان رئيسي
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock("h2")}
            >
              <Heading2 className="w-4 h-4 ml-2" />
              عنوان فرعي
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock("text")}
            >
              <Type className="w-4 h-4 ml-2" />
              فقرة نصية
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => triggerBlockUpload("image")}
              disabled={uploading}
            >
              <ImageIcon className="w-4 h-4 ml-2" />
              صورة
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => triggerBlockUpload("video")}
              disabled={uploading}
            >
              <Video className="w-4 h-4 ml-2" />
              فيديو
            </Button>
          </div>

          {project.content.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
              لا يوجد محتوى بعد. أضف عناصر من الأزرار أعلاه.
            </div>
          )}

          <div className="space-y-3">
            {project.content.map((block, idx) => (
              <div
                key={block.id}
                className="border border-border rounded-lg p-4 space-y-3 bg-background/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">
                    {block.type === "h1" && "عنوان رئيسي"}
                    {block.type === "h2" && "عنوان فرعي"}
                    {block.type === "text" && "فقرة"}
                    {block.type === "image" && "صورة"}
                    {block.type === "video" && "فيديو"}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveBlock(block.id, -1)}
                      disabled={idx === 0}
                      className="h-7 w-7"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveBlock(block.id, 1)}
                      disabled={idx === project.content.length - 1}
                      className="h-7 w-7"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBlock(block.id)}
                      className="h-7 w-7 text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {(block.type === "h1" ||
                  block.type === "h2" ||
                  block.type === "text") && (
                  <>
                    {block.type === "text" ? (
                      <Textarea
                        value={block.text}
                        onChange={(e) =>
                          updateBlock(block.id, { text: e.target.value })
                        }
                        rows={4}
                        placeholder="اكتب الفقرة هنا..."
                      />
                    ) : (
                      <Input
                        value={block.text}
                        onChange={(e) =>
                          updateBlock(block.id, { text: e.target.value })
                        }
                        placeholder={
                          block.type === "h1" ? "عنوان رئيسي" : "عنوان فرعي"
                        }
                        className={
                          block.type === "h1"
                            ? "text-2xl font-black"
                            : "text-lg font-bold"
                        }
                      />
                    )}
                    {!project.useTheme && (
                      <div className="space-y-2">
                        <Label className="text-xs">اللون</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_COLORS.map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() =>
                                updateBlock(block.id, {
                                  color: c.value || null,
                                })
                              }
                              className={`px-2 py-1 rounded text-xs border ${
                                (block.color ?? "") === c.value
                                  ? "border-primary ring-1 ring-primary"
                                  : "border-border"
                              }`}
                              style={{
                                color: c.value || undefined,
                              }}
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {block.type === "image" && (
                  <>
                    {block.url && (
                      <img
                        src={block.url}
                        alt={block.alt}
                        className="rounded border border-border max-h-64 object-contain mx-auto"
                        style={{
                          width: block.width ? `${block.width}px` : undefined,
                          height: block.height ? `${block.height}px` : undefined,
                          maxWidth: "100%",
                        }}
                      />
                    )}
                    <Input
                      value={block.url}
                      onChange={(e) =>
                        updateBlock(block.id, { url: e.target.value })
                      }
                      placeholder="رابط الصورة"
                      dir="ltr"
                    />
                    <Input
                      value={block.alt}
                      onChange={(e) =>
                        updateBlock(block.id, { alt: e.target.value })
                      }
                      placeholder="وصف الصورة (alt)"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">العرض (px)</Label>
                        <Input
                          type="number"
                          value={block.width ?? ""}
                          onChange={(e) =>
                            updateBlock(block.id, {
                              width: e.target.value
                                ? Number(e.target.value)
                                : null,
                            })
                          }
                          placeholder="auto"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">الارتفاع (px)</Label>
                        <Input
                          type="number"
                          value={block.height ?? ""}
                          onChange={(e) =>
                            updateBlock(block.id, {
                              height: e.target.value
                                ? Number(e.target.value)
                                : null,
                            })
                          }
                          placeholder="auto"
                        />
                      </div>
                    </div>
                  </>
                )}

                {block.type === "video" && (
                  <>
                    {block.url && (
                      <video
                        src={block.url}
                        controls
                        className="rounded border border-border max-h-64 mx-auto"
                      />
                    )}
                    <Input
                      value={block.url}
                      onChange={(e) =>
                        updateBlock(block.id, { url: e.target.value })
                      }
                      placeholder="رابط الفيديو"
                      dir="ltr"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Preview action button */}
        {!project.comingSoon && project.actionType !== "none" && (
          <div className="flex justify-center">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-sm text-center">
              معاينة الزر:{" "}
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold">
                {project.actionType === "download" ? (
                  <>
                    <Download className="w-4 h-4" />
                    تحميل
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    عرض
                  </>
                )}
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
