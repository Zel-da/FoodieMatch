import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertUserProgressSchema, insertUserAssessmentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Create or get user
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.json(existingUser);
      }

      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Get user progress for all courses
  app.get("/api/users/:userId/progress", async (req, res) => {
    try {
      const progress = await storage.getUserAllProgress(req.params.userId);
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
      const progressData = req.body;
      
      // Check if progress exists, create if not
      const existing = await storage.getUserProgress(req.params.userId, req.params.courseId);
      
      if (!existing) {
        const newProgress = await storage.createUserProgress({
          userId: req.params.userId,
          courseId: req.params.courseId,
          ...progressData,
        });
        return res.json(newProgress);
      }

      const updated = await storage.updateUserProgress(
        req.params.userId,
        req.params.courseId,
        progressData
      );
      res.json(updated);
    } catch (error) {
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
