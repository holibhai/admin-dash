export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';

export type AccountStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'INACTIVE';

export type AttendanceMode = 'ONLINE' | 'PHYSICAL' | 'HYBRID' | 'IN_PERSON';

export interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
}

export interface BaseUser {
  id: string; // backend UUID / ID
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  status: AccountStatus;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  avatarUrl?: string;
  address?: Address;
}

export interface StudentProfileData {
  dateOfBirth: string;
  guardianName: string;
  guardianPhone: string;
  attendanceMode: AttendanceMode;
  grade: string; // numeric string e.g. "10", "11", "12"
}

export interface StudentUser extends BaseUser {
  role: 'STUDENT';
  studentId: string; // Generated e.g. STU-2026-0842
  studentProfile: StudentProfileData;
  enrolledCourseCount?: number;
  averageGrade?: string;
}

export interface TeacherProfileData {
  dateOfBirth: string;
  nic?: string;
  specializations: string[];
  hireDate?: string;
}

export interface TeacherUser extends BaseUser {
  role: 'TEACHER';
  teacherCode: string; // Generated e.g. TCH-9104
  teacherProfile: TeacherProfileData;
  assignedCourseCount?: number;
  activeStudentsCount?: number;
}

export interface AdminProfileData {
  dateOfBirth?: string;
  nic?: string;
  department?: string;
}

export interface AdministratorUser extends BaseUser {
  role: 'ADMIN' | 'SUPER_ADMIN';
  adminCode: string; // Generated e.g. ADM-1049
  adminProfile: AdminProfileData;
  permissions?: string[];
}

// ----------------------------------------------------
// GRADE CONTRACT (GET, POST, PUT, DELETE /api/v1/course/grades)
// ----------------------------------------------------
export interface Grade {
  id: string; // UUID
  name: string; // e.g. "Grade 10" (Required, Max 100)
  description?: string; // Optional, Max 1000
  monthlyFee: number; // Required decimal > 0.01 (Backend: monthlyFee owned by Grade)
  currencyCode: string; // 3-letter currency code (default "LKR")
  active: boolean;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt: string;
  updatedAt: string;
  courseCount?: number; // related courses count
}

export interface CreateGradeRequest {
  name: string; // Required, Max 100
  description?: string; // Optional, Max 1000
  monthlyFee: number; // Required, > 0.01, max 2 decimal places
  currencyCode?: string; // Optional 3-letter code, defaults to "LKR"
}

export interface UpdateGradeRequest {
  name: string;
  description?: string;
  monthlyFee?: number;
  currencyCode?: string;
  active?: boolean;
}

// ----------------------------------------------------
// COURSE CONTRACT (GET, POST, PUT, DELETE /api/v1/course)
// Note: Pricing is owned by Grade; courseFeeMonthly is @JsonIgnore in backend CourseRequest
// ----------------------------------------------------
export interface CreateCourseRequest {
  courseName: string; // Required, Max 150
  courseDescription: string; // Required, Max 2000
  courseThumbnail?: string; // Optional URL string
  gradeId: string; // Required Grade UUID
  assignedTeacherId: string; // Required Teacher UUID
  subject: string; // Required, Max 100
  isOnline?: boolean;
  isVisible?: boolean;
  isPublished?: boolean;
  courseEnrollmentId?: string | null;
  // Legacy backward-compatibility if referenced:
  courseFeeMonthly?: number;
  discountOfferPercent?: number;
}

export interface UpdateCourseRequest {
  courseName?: string;
  courseDescription?: string;
  courseThumbnail?: string;
  gradeId?: string;
  assignedTeacherId?: string;
  subject?: string;
  isOnline?: boolean;
  isVisible?: boolean;
  isPublished?: boolean;
  courseEnrollmentId?: string | null;
}

export interface Course {
  id: string; // courseId UUID
  courseName: string;
  courseDescription: string;
  courseThumbnail?: string;
  gradeId: string;
  assignedTeacherId: string;
  subject: string;
  isOnline: boolean;
  online?: boolean; // backend variance alias
  isVisible: boolean;
  visible?: boolean; // backend variance alias
  isPublished: boolean;
  courseEnrollmentId?: string | null;
  studentCount: number;
  numberOfStudents?: number;
  modulesCount?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  publishedDate?: string | null;
  courseStatus?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

  // Inherited Grade Monthly Fee & Currency from backend CourseResponse:
  gradeMonthlyFee: number;
  gradeCurrencyCode: string;

  // Legacy/compatibility properties:
  courseFeeMonthly?: number;
  discountOfferPercent?: number;

  // Human-readable resolved values & UI convenience:
  gradeName?: string;
  teacherName?: string;
  teacherCode?: string;
  // Aliases for component compatibility:
  code?: string;
  title?: string;
  grade?: string;
  teacherId?: string;
  category?: string;
  description?: string;
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'PUBLISHED';
  enrollmentCount?: number;
  maxCapacity?: number;
  startDate?: string;
  endDate?: string;
}

export type StudentProfile = StudentUser & {
  phone?: string;
  grade?: string;
  schoolName?: string;
  guardianName?: string;
  guardianPhone?: string;
  attendanceMode?: AttendanceMode;
  dob?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  postalCode?: string;
};

export type TeacherProfile = TeacherUser & {
  phone?: string;
  specializations?: string[];
  hireDate?: string;
  dob?: string;
  nic?: string;
  addressLine1?: string;
  city?: string;
  district?: string;
  postalCode?: string;
};

export type AdministratorProfile = AdministratorUser & {
  phone?: string;
  department?: string;
  nic?: string;
  dateOfBirth?: string;
  dob?: string;
  addressLine1?: string;
  city?: string;
  district?: string;
  postalCode?: string;
};

// ----------------------------------------------------
// USER REGISTRATION REQUESTS (/api/v1/admin/users/register)
// ----------------------------------------------------
export interface RegisterStudentRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'STUDENT';
  studentProfile: {
    dateOfBirth: string;
    guardianName: string;
    guardianPhone: string;
    attendanceMode: AttendanceMode;
    grade: string; // numeric string e.g. "10", "11", "12"
  };
  address: Address;
}

export interface RegisterTeacherRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'TEACHER';
  teacherProfile: {
    dateOfBirth: string;
    nic?: string;
    specializations: string[];
    hireDate?: string;
  };
  address: Address;
}

export interface RegisterAdminRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  adminProfile: {
    dateOfBirth?: string;
    nic?: string;
  };
  address: Address;
}

export interface UpdateUserStatusRequest {
  active: boolean;
}

// ----------------------------------------------------
// OTHER ACADEMIC & PLATFORM DOMAIN MODELS
// ----------------------------------------------------
export interface EnrollmentRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  courseCode?: string;
  enrolledDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PENDING_APPROVAL' | 'DROPPED';
  grade?: string;
  progressPercentage: number;
}

export interface CurriculumModule {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: {
    id: string;
    title: string;
    durationMinutes: number;
    hasQuiz: boolean;
    materialCount: number;
    status: 'PUBLISHED' | 'DRAFT';
  }[];
}

export interface Assignment {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  teacherName: string;
  title: string;
  dueDate: string;
  totalSubmissions: number;
  gradedSubmissions: number;
  maxPoints: number;
  status: 'PUBLISHED' | 'DRAFT' | 'CLOSED';
}

export interface Quiz {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  teacherName: string;
  title: string;
  questionCount: number;
  durationMinutes: number;
  attemptsCount: number;
  averageScore: number;
  passingRate: number;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
}

export interface Examination {
  id: string;
  code: string;
  title: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  examDate: string;
  startTime: string;
  endTime: string;
  hallOrPlatform: string;
  candidateCount: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'RESULTS_PUBLISHED';
}

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseCode: string;
  assessmentType: 'ASSIGNMENT' | 'QUIZ' | 'MIDTERM' | 'FINAL_EXAM';
  assessmentTitle: string;
  score: number;
  maxScore: number;
  letterGrade: string;
  feedback?: string;
  gradedDate: string;
}

export interface AttendanceSession {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  date: string;
  timeSlot: string;
  mode: AttendanceMode;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  markedBy: string;
}

export interface LearningMaterial {
  id: string;
  title: string;
  courseId: string;
  courseCode: string;
  fileType: 'PDF' | 'VIDEO' | 'SLIDES' | 'DOCUMENT' | 'AUDIO';
  s3Key: string;
  fileSizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
  status: 'READY' | 'PROCESSING' | 'RESTRICTED';
}

export type EventVisibility = 'PUBLIC_STUDENTS' | 'FACULTY_ONLY' | 'ADMIN_RESTRICTED';

export interface AcademicEvent {
  id: string;
  title: string;
  type: 'CLASS' | 'EXAM' | 'QUIZ' | 'DEADLINE' | 'SESSION';
  date: string;
  time: string;
  location: string;
  courseCode?: string;
  courseTitle?: string;
  instructorName?: string;
  instructorEmail?: string;
  description?: string;
  visibility?: EventVisibility;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'REGISTRATION' | 'ACADEMIC' | 'SECURITY' | 'SYSTEM';
  timestamp: string;
  read: boolean;
  linkAction?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  category: 'KEYCLOAK_AUTH' | 'USER_REGISTRATION' | 'MATERIAL_SERVICE' | 'AI_SERVICE' | 'COURSE_MANAGEMENT';
  action: string;
  details: string;
  ipAddress: string;
  payloadJson?: string;
}

export interface PlatformKPIs {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalGrades: number;
  activeEnrollments: number;
  pendingInvitations: number;
  activeUsers: number;
  upcomingExams: number;
  pendingAdminActions: number;
}
