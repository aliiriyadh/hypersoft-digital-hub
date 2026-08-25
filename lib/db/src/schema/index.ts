import { pgTable, text, boolean, integer, bigint, real, jsonb } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  image: text("image").notNull().default(""),
  coverAspect: text("cover_aspect").notNull().default("video"),
  coverFit: text("cover_fit").notNull().default("cover"),
  tags: jsonb("tags").notNull().default([]).$type<string[]>(),
  comingSoon: boolean("coming_soon").notNull().default(false),
  categoryId: text("category_id"),
  actionType: text("action_type").notNull().default("none"),
  actionUrl: text("action_url").notNull().default(""),
  useTheme: boolean("use_theme").notNull().default(true),
  content: jsonb("content").notNull().default([]).$type<unknown[]>(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const serviceRequests = pgTable("service_requests", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default(""),
  serviceType: text("service_type").notNull().default(""),
  description: text("description").notNull().default(""),
  budget: text("budget").notNull().default(""),
  contactMethod: text("contact_method").notNull().default(""),
  contactValue: text("contact_value").notNull().default(""),
  status: text("status").notNull().default("new"),
  assignedCaptainId: text("assigned_captain_id"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  role: text("role").notNull().default("client"),
  salary: real("salary").notNull().default(0),
  skills: jsonb("skills").notNull().default([]).$type<string[]>(),
  resetTokenHash: text("reset_token_hash"),
  resetTokenExpiresAt: bigint("reset_token_expires_at", { mode: "number" }),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const services = pgTable("services", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  price: real("price").notNull().default(0),
  icon: text("icon").notNull().default("category"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const ratings = pgTable("ratings", {
  id: text("id").primaryKey(),
  targetUserId: text("target_user_id").notNull(),
  raterUserId: text("rater_user_id").notNull(),
  stars: integer("stars").notNull().default(5),
  comment: text("comment").notNull().default(""),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});
