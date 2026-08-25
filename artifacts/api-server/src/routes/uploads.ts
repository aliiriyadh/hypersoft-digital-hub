import { Router, type IRouter } from "express";
import express from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { UPLOADS_DIR } from "../lib/storage";
import { verifyToken } from "../lib/auth";

const router: IRouter = Router();

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
    const safeExt = /^\.[a-z0-9]+$/i.test(ext) ? ext : "";
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${safeExt}`);
  },
});

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) cb(null, true);
    else cb(new Error("نوع الملف غير مدعوم"));
  },
});

router.post("/admin/upload", (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header || typeof header !== "string" || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "غير مصرح" });
  }
  const payload = verifyToken(header.slice(7).trim(), "session");
  if (!payload) return res.status(401).json({ error: "الجلسة منتهية" });
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .json({ error: err instanceof Error ? err.message : "خطأ في الرفع" });
    }
    if (!req.file) return res.status(400).json({ error: "لم يتم رفع ملف" });
    const url = `/api/uploads/${req.file.filename}`;
    const kind = req.file.mimetype.startsWith("video/") ? "video" : "image";
    return res.json({ url, kind, size: req.file.size });
  });
});

router.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    maxAge: "7d",
    fallthrough: false,
  }),
);

export default router;
