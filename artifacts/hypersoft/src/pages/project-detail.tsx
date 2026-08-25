import { Layout } from "@/components/layout";
import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Loader2, ArrowRight, Eye, Download, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type Project,
  type ContentBlock,
  ASPECT_CLASS,
} from "@/lib/project-types";
import { motion } from "framer-motion";

function renderBlock(block: ContentBlock, useTheme: boolean): React.ReactNode {
  if (block.type === "h1") {
    return (
      <h2
        key={block.id}
        className="text-2xl sm:text-3xl md:text-4xl font-black mt-8 sm:mt-10 mb-3 sm:mb-4"
        style={!useTheme && block.color ? { color: block.color } : undefined}
      >
        {block.text}
      </h2>
    );
  }
  if (block.type === "h2") {
    return (
      <h3
        key={block.id}
        className="text-xl sm:text-2xl font-bold mt-6 sm:mt-8 mb-2 sm:mb-3"
        style={!useTheme && block.color ? { color: block.color } : undefined}
      >
        {block.text}
      </h3>
    );
  }
  if (block.type === "text") {
    return (
      <p
        key={block.id}
        className="text-base sm:text-lg leading-loose mb-4 text-foreground/90 whitespace-pre-wrap"
        style={!useTheme && block.color ? { color: block.color } : undefined}
      >
        {block.text}
      </p>
    );
  }
  if (block.type === "image") {
    return (
      <figure key={block.id} className="my-6 sm:my-8 text-center">
        <img
          src={block.url}
          alt={block.alt}
          className={`mx-auto rounded-xl w-full ${
            useTheme ? "border border-border shadow-lg shadow-primary/5" : ""
          }`}
          style={{
            maxWidth: block.width ? `min(${block.width}px, 100%)` : "100%",
            height: "auto",
          }}
        />
        {block.alt && (
          <figcaption className="text-xs sm:text-sm text-muted-foreground mt-2">
            {block.alt}
          </figcaption>
        )}
      </figure>
    );
  }
  if (block.type === "video") {
    return (
      <div key={block.id} className="my-6 sm:my-8">
        <video
          src={block.url}
          controls
          className={`w-full rounded-xl ${
            useTheme ? "border border-border shadow-lg shadow-primary/5" : ""
          }`}
        />
      </div>
    );
  }
  return null;
}

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        const found = (data.projects as Project[]).find(
          (p) => p.id === params.id,
        );
        setProject(found ?? null);
      })
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) {
    return (
      <Layout>
        <div className="pt-32 pb-24 flex justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="pt-32 pb-24 text-center container mx-auto px-4">
          <h1 className="text-3xl font-black mb-4">المشروع غير موجود</h1>
          <Link href="/projects">
            <Button>
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للمشاريع
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const ActionButton = ({ size = "default" as "default" | "lg", className = "" }) => {
    if (project.comingSoon || project.actionType === "none" || !project.actionUrl)
      return null;
    return (
      <a
        href={project.actionUrl}
        target="_blank"
        rel="noopener noreferrer"
        download={project.actionType === "download"}
        className={className}
      >
        <Button size={size} className="font-bold w-full sm:w-auto">
          {project.actionType === "download" ? (
            <>
              <Download className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              تحميل المشروع
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              عرض المشروع
            </>
          )}
        </Button>
      </a>
    );
  };

  return (
    <Layout>
      <article className="py-8 sm:py-16">
        <div className="container mx-auto max-w-4xl">
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="mb-4 sm:mb-6">
              <ArrowRight className="w-4 h-4 ml-2" />
              كل المشاريع
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${
              ASPECT_CLASS[project.coverAspect] || "aspect-video"
            } rounded-2xl overflow-hidden mb-6 sm:mb-8 border border-border bg-muted relative`}
          >
            <img
              src={project.image}
              alt={project.title}
              className={`w-full h-full ${
                project.coverFit === "contain" ? "object-contain" : "object-cover"
              }`}
            />
            {project.comingSoon && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                <div className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/30">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-lg sm:text-xl">قريباً</span>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4">
              {project.title}
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground mb-5 sm:mb-6 leading-relaxed">
              {project.description}
            </p>
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8">
                {project.tags.map((t) => (
                  <Badge
                    key={t}
                    variant="secondary"
                    className="bg-secondary/10 text-secondary font-mono text-xs sm:text-sm"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            )}

            <ActionButton size="lg" className="mb-6 sm:mb-8 block" />
          </motion.div>

          {project.content.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="prose prose-invert max-w-none border-t border-border pt-6 sm:pt-8"
            >
              {project.content.map((b) => renderBlock(b, project.useTheme))}
            </motion.div>
          )}

          {!project.comingSoon &&
            project.actionType !== "none" &&
            project.actionUrl &&
            project.content.length > 0 && (
              <div className="text-center mt-10 sm:mt-12">
                <ActionButton size="lg" />
              </div>
            )}
        </div>
      </article>
    </Layout>
  );
}
