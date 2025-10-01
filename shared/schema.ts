import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  department: text("department").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'workplace-safety', 'hazard-prevention', 'tbm'
  duration: integer("duration").notNull(), // in minutes
  videoUrl: text("video_url"),
  documentUrl: text("document_url"),
  color: text("color").notNull().default("blue"),
  icon: text("icon").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  progress: integer("progress").notNull().default(0), // 0-100
  completed: boolean("completed").notNull().default(false),
  currentStep: integer("current_step").notNull().default(1),
  timeSpent: integer("time_spent").notNull().default(0), // in seconds
  lastAccessed: timestamp("last_accessed").notNull().defaultNow(),
});

export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  question: text("question").notNull(),
  options: text("options").notNull(), // JSON string array
  correctAnswer: integer("correct_answer").notNull(),
  difficulty: text("difficulty").notNull().default("medium"),
});

export const userAssessments = pgTable("user_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  passed: boolean("passed").notNull(),
  attemptNumber: integer("attempt_number").notNull().default(1),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  certificateUrl: text("certificate_url").notNull(),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  department: z.string(),
  role: z.enum(['admin', 'user']).default('user'),
});

export const userSchema = insertUserSchema.extend({
  id: z.string(),
  createdAt: z.date(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  lastAccessed: true,
}).extend({
  progress: z.number().min(0).max(100).default(0),
  currentStep: z.number().min(1).max(3).default(1),
  timeSpent: z.number().min(0).default(0),
  completed: z.boolean().default(false),
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
});

export const insertUserAssessmentSchema = createInsertSchema(userAssessments).omit({
  id: true,
  completedAt: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  issuedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;

export type UserAssessment = typeof userAssessments.$inferSelect;
export type InsertUserAssessment = z.infer<typeof insertUserAssessmentSchema>;

export type Certificate = typeof certificates.$inferSelect;
  id: z.string(),
  issuedAt: z.date(),
});

// Notice Board Schemas
export const insertNoticeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  authorId: z.string(),
});

export const noticeSchema = insertNoticeSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  viewCount: z.number().default(0),
});

export type Notice = z.infer<typeof noticeSchema>;
export type InsertNotice = z.infer<typeof insertNoticeSchema>;
