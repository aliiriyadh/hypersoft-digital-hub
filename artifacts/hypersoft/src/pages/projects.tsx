import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Eye,
  Download,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  type Project,
  type Category,
  ASPECT_CLASS,
} from "@/lib/project-types";

const PAGE_SIZE = 7;

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activeCat, setActiveCat] = useState<string>("_all");

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([p, c]) => {
        setProjects(p.projects ?? []);
        setCategories(c.categories ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeCat]);

  const filtered = useMemo(() => {
    if (activeCat === "_all") return projects;
    if (activeCat === "_none") return projects.filter((p) => !p.categoryId);
    return projects.filter((p) => p.categoryId === activeCat);
  }, [projects, activeCat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () =>
      filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  return (
    <Layout>
      <div className="py-10 sm:py-16 pb-16 sm:pb-24">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6">
              المشاريع <span className="text-primary">والتطبيقات</span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground">
              نفتخر في HyperSoft بتقديم مجموعة متنوعة من الحلول البرمجية التي
              ساعدت عملاءنا على تحقيق أهدافهم ونمو أعمالهم.
            </p>
          </motion.div>

          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-10">
              <button
                onClick={() => setActiveCat("_all")}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeCat === "_all"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "bg-card border border-border hover:border-primary/50"
                }`}
              >
                الكل
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                    activeCat === c.id
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                      : "bg-card border border-border hover:border-primary/50"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              لا توجد مشاريع لعرضها في هذا التصنيف.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                {paginated.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all group relative flex flex-col"
                  >
                    <Link href={`/projects/${project.id}`}>
                      <div
                        className={`${ASPECT_CLASS[project.coverAspect] || "aspect-[16/9]"} overflow-hidden relative cursor-pointer`}
                      >
                        {project.comingSoon && (
                          <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-2">
                            <div className="flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/30">
                              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="text-base sm:text-lg">قريباً</span>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-primary/10 group-hover:opacity-0 transition-opacity z-10" />
                        <img
                          src={project.image}
                          alt={project.title}
                          className={`w-full h-full ${
                            project.coverFit === "contain"
                              ? "object-contain"
                              : "object-cover"
                          } group-hover:scale-105 transition-transform duration-500`}
                        />
                      </div>
                    </Link>
                    <div className="p-4 sm:p-6 flex flex-col flex-1">
                      <Link href={`/projects/${project.id}`}>
                        <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 hover:text-primary transition-colors cursor-pointer">
                          {project.title}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground mb-4 sm:mb-6 line-clamp-3 flex-1 text-sm sm:text-base">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                        {project.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-secondary/10 text-secondary hover:bg-secondary/20 font-mono text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {!project.comingSoon &&
                      project.actionType !== "none" &&
                      project.actionUrl ? (
                        <a
                          href={project.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={project.actionType === "download"}
                          className="block"
                        >
                          <Button className="w-full font-bold text-sm sm:text-base">
                            {project.actionType === "download" ? (
                              <>
                                <Download className="w-4 h-4 ml-2" />
                                تحميل
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 ml-2" />
                                عرض
                              </>
                            )}
                          </Button>
                        </a>
                      ) : !project.comingSoon ? (
                        <Link href={`/projects/${project.id}`}>
                          <Button variant="outline" className="w-full text-sm sm:text-base">
                            <ArrowLeft className="w-4 h-4 ml-2" />
                            اقرأ المزيد
                          </Button>
                        </Link>
                      ) : null}
                    </div>
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center flex-wrap gap-2 mt-10 sm:mt-12">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="السابق"
                    className="w-9 h-9 sm:w-10 sm:h-10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <Button
                        key={n}
                        variant={n === currentPage ? "default" : "outline"}
                        size="icon"
                        onClick={() => setPage(n)}
                        className="w-9 h-9 sm:w-10 sm:h-10 font-bold text-sm"
                      >
                        {n}
                      </Button>
                    ),
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    aria-label="التالي"
                    className="w-9 h-9 sm:w-10 sm:h-10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <p className="text-center text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6">
                صفحة {currentPage} من {totalPages} • المجموع: {filtered.length}{" "}
                مشروع
              </p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
