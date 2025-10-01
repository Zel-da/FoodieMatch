import { 
  type User, 
  type InsertUser, 
  type Course, 
  type InsertCourse,
  type UserProgress,
  type InsertUserProgress,
  type Assessment,
  type InsertAssessment,
  type UserAssessment,
  type InsertUserAssessment,
  type Certificate,
  type InsertCertificate,
  type Notice,
  type InsertNotice
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(email: string, password: string): Promise<User | null>;

  // Courses
  getAllCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // Notices
  getAllNotices(): Promise<Notice[]>;
  getNotice(id: string): Promise<Notice | undefined>;
  createNotice(notice: InsertNotice): Promise<Notice>;
  updateNotice(id: string, notice: Partial<InsertNotice>): Promise<Notice>;
  deleteNotice(id: string): Promise<void>;

  // User Progress
  getUserProgress(userId: string, courseId: string): Promise<UserProgress | undefined>;
  getUserAllProgress(userId: string): Promise<UserProgress[]>;
  updateUserProgress(userId: string, courseId: string, progress: Partial<InsertUserProgress>): Promise<UserProgress>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  
  // Assessments
  getCourseAssessments(courseId: string): Promise<Assessment[]>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  
  // User Assessments
  getUserAssessments(userId: string, courseId: string): Promise<UserAssessment[]>;
  createUserAssessment(userAssessment: InsertUserAssessment): Promise<UserAssessment>;
  
  // Certificates
  getUserCertificates(userId: string): Promise<Certificate[]>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private courses: Map<string, Course>;
  private notices: Map<string, Notice>;
  private userProgress: Map<string, UserProgress>;
  private assessments: Map<string, Assessment>;
  private userAssessments: Map<string, UserAssessment>;
  private certificates: Map<string, Certificate>;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.notices = new Map();
    this.userProgress = new Map();
    this.assessments = new Map();
    this.userAssessments = new Map();
    this.certificates = new Map();
    
    this.initializeData();
  }

  private async initializeData() {
    // Initialize admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser: User = {
      id: 'admin-user',
      username: '관리자',
      email: 'admin@example.com',
      password: adminPassword,
      department: 'IT',
      role: 'admin',
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Initialize courses
    const defaultCourses: Course[] = [
      {
        id: "course-1",
        title: "고소작업대 안전관리 교육",
        description: "고소작업대 사용 시 필수 안전 수칙과 비상 상황 대응 방법을 학습합니다.",
        type: "workplace-safety",
        duration: 7,
        videoUrl: "/videos/workplace-safety.mp4",
        documentUrl: "/documents/workplace-safety.pdf",
        color: "blue",
        isActive: true,
      },
      {
        id: "course-2",
        title: "굴착기 안전수칙 개정 및 사고 예방 교육",
        description: "개정된 산업안전보건법에 따른 굴착기 관련 최신 안전 수칙을 교육합니다.",
        type: "hazard-prevention",
        duration: 7,
        videoUrl: "/videos/hazard-prevention.mp4",
        documentUrl: "/documents/hazard-prevention.pdf",
        color: "orange",
        isActive: true,
      },
      {
        id: "course-3",
        title: "TBM 교육 프로그램",
        description: "효과적인 작업 전 안전점검회의(TBM)를 진행하는 방법과 리더십을 학습합니다.",
        type: "tbm",
        duration: 7,
        videoUrl: "/videos/tbm.mp4",
        documentUrl: "/documents/tbm.pdf",
        color: "green",
        isActive: true,
      },
    ];
    defaultCourses.forEach(course => { this.courses.set(course.id, course); });

    // Initialize notices
    const defaultNotices: InsertNotice[] = [
        { authorId: adminUser.id, title: "플랫폼 정식 오픈 안내", content: "안전관리 통합 교육 플랫폼이 정식으로 오픈했습니다. 많은 이용 바랍니다." },
        { authorId: adminUser.id, title: "TBM 기능 업데이트", content: "TBM 안전점검 기능이 개선되었습니다. 이제 모바일에서도 편리하게 사용하세요." },
    ];
    defaultNotices.forEach(notice => this.createNotice(notice));

    // Initialize sample assessments
    const sampleAssessments: Assessment[] = [
      {
        id: "assessment-1",
        courseId: "course-1",
        question: "고소작업대 사용 시 가장 중요한 안전수칙은 무엇입니까?",
        options: JSON.stringify([
          "안전벨트 착용",
          "작업시간 단축",
          "빠른 작업 완료",
          "장비 점검 생략"
        ]),
        correctAnswer: 0,
        difficulty: "medium",
      },
    ];
    sampleAssessments.forEach(assessment => { this.assessments.set(assessment.id, assessment); });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> { return this.users.get(id); }
  async getUserByEmail(email: string): Promise<User | undefined> { return Array.from(this.users.values()).find(user => user.email === email); }
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = { ...insertUser, id, password: hashedPassword, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid ? user : null;
  }

  // Courses
  async getAllCourses(): Promise<Course[]> { return Array.from(this.courses.values()).filter(course => course.isActive); }
  async getCourse(id: string): Promise<Course | undefined> { return this.courses.get(id); }
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = randomUUID();
    const course: Course = { ...insertCourse, id, color: insertCourse.color || "blue", videoUrl: insertCourse.videoUrl || null, documentUrl: insertCourse.documentUrl || null, isActive: insertCourse.isActive ?? true };
    this.courses.set(id, course);
    return course;
  }

  // Notices
  async getAllNotices(): Promise<Notice[]> { return Array.from(this.notices.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); }
  async getNotice(id: string): Promise<Notice | undefined> { 
    const notice = this.notices.get(id);
    if (notice) {
        notice.viewCount++;
        this.notices.set(id, notice);
    }
    return notice; 
  }
  async createNotice(insertNotice: InsertNotice): Promise<Notice> {
    const id = randomUUID();
    const notice: Notice = { ...insertNotice, id, createdAt: new Date(), viewCount: 0 };
    this.notices.set(id, notice);
    return notice;
  }
  async updateNotice(id: string, noticeUpdate: Partial<InsertNotice>): Promise<Notice> {
    const existing = this.notices.get(id);
    if (!existing) throw new Error("Notice not found");
    const updated: Notice = { ...existing, ...noticeUpdate };
    this.notices.set(id, updated);
    return updated;
  }
  async deleteNotice(id: string): Promise<void> { this.notices.delete(id); }

  // User Progress
  async getUserProgress(userId: string, courseId: string): Promise<UserProgress | undefined> { const key = `${userId}-${courseId}`; return this.userProgress.get(key); }
  async getUserAllProgress(userId: string): Promise<UserProgress[]> { return Array.from(this.userProgress.values()).filter(progress => progress.userId === userId); }
  async updateUserProgress(userId: string, courseId: string, progressUpdate: Partial<InsertUserProgress>): Promise<UserProgress> {
    const key = `${userId}-${courseId}`;
    const existing = this.userProgress.get(key);
    if (!existing) throw new Error("Progress not found");
    const updated: UserProgress = { ...existing, ...progressUpdate, lastAccessed: new Date() };
    this.userProgress.set(key, updated);
    return updated;
  }
  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = randomUUID();
    const key = `${insertProgress.userId}-${insertProgress.courseId}`;
    const progress: UserProgress = { ...insertProgress, id, progress: insertProgress.progress || 0, completed: insertProgress.completed || false, currentStep: insertProgress.currentStep || 1, timeSpent: insertProgress.timeSpent || 0, lastAccessed: new Date() };
    this.userProgress.set(key, progress);
    return progress;
  }

  // Assessments
  async getCourseAssessments(courseId: string): Promise<Assessment[]> { return Array.from(this.assessments.values()).filter(assessment => assessment.courseId === courseId); }
  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = randomUUID();
    const assessment: Assessment = { ...insertAssessment, id, difficulty: insertAssessment.difficulty || "medium" };
    this.assessments.set(id, assessment);
    return assessment;
  }

  // User Assessments
  async getUserAssessments(userId: string, courseId: string): Promise<UserAssessment[]> { return Array.from(this.userAssessments.values()).filter(ua => ua.userId === userId && ua.courseId === courseId); }
  async createUserAssessment(insertUserAssessment: InsertUserAssessment): Promise<UserAssessment> {
    const id = randomUUID();
    const userAssessment: UserAssessment = { ...insertUserAssessment, id, attemptNumber: insertUserAssessment.attemptNumber || 1, completedAt: new Date() };
    this.userAssessments.set(id, userAssessment);
    return userAssessment;
  }

  // Certificates
  async getUserCertificates(userId: string): Promise<Certificate[]> { return Array.from(this.certificates.values()).filter(cert => cert.userId === userId); }
  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const id = randomUUID();
    const certificate: Certificate = { ...insertCertificate, id, issuedAt: new Date() };
    this.certificates.set(id, certificate);
    return certificate;
  }
}

export const storage = new MemStorage();
