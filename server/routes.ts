import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { insertUserSchema, insertUserProgressSchema, insertUserAssessmentSchema } from "@shared/schema";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    user: { id: string; username: string; role: string };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {

  app.use(session({
    secret: 'a-very-secret-key-that-should-be-in-env-vars',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 } // Use secure: true in production with HTTPS
  }));

  // AUTH ROUTES
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }
      const user = await storage.createUser(userData);
      // Exclude password from the returned user object
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.validateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      req.session.user = { id: user.id, username: user.username, role: user.role };
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid'); // The default session cookie name
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.session.user) {
      res.json(req.session.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Get all courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get specific course
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // NOTICE ROUTES
  app.get("/api/notices", async (req, res) => {
    try {
      const notices = await storage.getAllNotices();
      res.json(notices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notices" });
    }
  });

  app.get("/api/notices/:id", async (req, res) => {
    try {
      const notice = await storage.getNotice(req.params.id);
      if (!notice) {
        return res.status(404).json({ message: "Notice not found" });
      }
      res.json(notice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notice" });
    }
  });

  // Middleware to check for admin role
  const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: "Forbidden: Admins only" });
    }
  };

  app.post("/api/notices", isAdmin, async (req, res) => {
    try {
      const noticeData = insertNoticeSchema.parse({
        ...req.body,
        authorId: req.session.user.id,
      });
      const newNotice = await storage.createNotice(noticeData);
      res.status(201).json(newNotice);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid notice data", errors: error.errors });
        }
        res.status(500).json({ message: "Failed to create notice" });
    }
  });

  app.put("/api/notices/:id", isAdmin, async (req, res) => {
    try {
        const noticeData = insertNoticeSchema.partial().parse(req.body);
        const updatedNotice = await storage.updateNotice(req.params.id, noticeData);
        res.json(updatedNotice);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid notice data", errors: error.errors });
        }
        res.status(500).json({ message: "Failed to update notice" });
    }
  });

  app.delete("/api/notices/:id", isAdmin, async (req, res) => {
    try {
        await storage.deleteNotice(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Failed to delete notice" });
    }
  });


  // Get user progress for all courses
  app.get("/api/users/:userId/progress", async (req, res) => {
    try {
      const progress = await storage.getUserAllProgress(req.params.userId);
      console.log(`[API] Get progress for user ${req.params.userId}:`, progress);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  // Get user progress for specific course
  app.get("/api/users/:userId/progress/:courseId", async (req, res) => {
    try {
      const progress = await storage.getUserProgress(req.params.userId, req.params.courseId);
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Update user progress
  app.put("/api/users/:userId/progress/:courseId", async (req, res) => {
    try {
      console.log(`[API] Update progress for user ${req.params.userId}, course ${req.params.courseId}:`, req.body);
      
      const progressUpdateSchema = insertUserProgressSchema.partial().extend({
        progress: z.number().min(0).max(100).optional(),
        currentStep: z.number().min(1).max(3).optional(),
        timeSpent: z.number().min(0).optional(),
        completed: z.boolean().optional(),
      });
      
      const progressData = progressUpdateSchema.parse(req.body);
      
      // Check if progress exists, create if not
      const existing = await storage.getUserProgress(req.params.userId, req.params.courseId);
      console.log(`[API] Existing progress:`, existing);
      
      if (!existing) {
        const newProgress = await storage.createUserProgress({
          userId: req.params.userId,
          courseId: req.params.courseId,
          progress: progressData.progress || 0,
          currentStep: progressData.currentStep || 1,
          timeSpent: progressData.timeSpent || 0,
          completed: progressData.completed || false,
        });
        console.log(`[API] Created new progress:`, newProgress);
        return res.json(newProgress);
      }

      const updated = await storage.updateUserProgress(
        req.params.userId,
        req.params.courseId,
        progressData
      );
      console.log(`[API] Updated progress:`, updated);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Get course assessments
  app.get("/api/courses/:courseId/assessments", async (req, res) => {
    try {
      const assessments = await storage.getCourseAssessments(req.params.courseId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  // Submit assessment
  app.post("/api/users/:userId/assessments/:courseId", async (req, res) => {
    try {
      const assessmentData = insertUserAssessmentSchema.parse({
        userId: req.params.userId,
        courseId: req.params.courseId,
        ...req.body,
      });

      const result = await storage.createUserAssessment(assessmentData);
      
      // If passed, create certificate
      if (result.passed) {
        await storage.createCertificate({
          userId: req.params.userId,
          courseId: req.params.courseId,
          certificateUrl: `/certificates/${result.id}.pdf`,
        });
      }

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assessment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit assessment" });
    }
  });

  // Get user certificates
  app.get("/api/users/:userId/certificates", async (req, res) => {
    try {
      const certificates = await storage.getUserCertificates(req.params.userId);
      res.json(certificates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
