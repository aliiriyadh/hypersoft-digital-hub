export type CoverAspect = "video" | "square" | "wide" | "portrait" | "auto";
export type CoverFit = "cover" | "contain";
export type ActionType = "none" | "view" | "download";

export type ContentBlock =
  | { id: string; type: "h1" | "h2" | "text"; text: string; color: string | null }
  | {
      id: string;
      type: "image";
      url: string;
      width: number | null;
      height: number | null;
      alt: string;
    }
  | { id: string; type: "video"; url: string };

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  coverAspect: CoverAspect;
  coverFit: CoverFit;
  tags: string[];
  comingSoon: boolean;
  categoryId: string | null;
  actionType: ActionType;
  actionUrl: string;
  useTheme: boolean;
  content: ContentBlock[];
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  createdAt: number;
}

export const ASPECT_CLASS: Record<CoverAspect, string> = {
  video: "aspect-[16/9]",
  square: "aspect-square",
  wide: "aspect-[21/9]",
  portrait: "aspect-[3/4]",
  auto: "",
};

export const ASPECT_LABEL: Record<CoverAspect, string> = {
  video: "16:9 (افتراضي)",
  square: "1:1 (مربع)",
  wide: "21:9 (عريض)",
  portrait: "3:4 (طولي)",
  auto: "تلقائي (الحجم الأصلي)",
};
