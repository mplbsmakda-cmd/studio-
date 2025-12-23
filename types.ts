
export type UserRole = 'admin' | 'teacher' | 'student';

export interface UserProfile {
  uid: string;
  name: string;
  // Added email field
  email: string;
  role: UserRole;
  classroom?: string;
  department?: string;
  
  // Biometric Auth
  credentialId?: string; // ID unik dari hardware biometrik
  biometricActive: boolean;

  // Extended Fields
  nisn?: string;        
  nis?: string;         
  nip?: string;         
  birthDate?: string;
  gender?: 'L' | 'P';
  phone?: string;
  isApproved: boolean;  
  
  createdAt: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Exam {
  id?: string;
  title: string;
  courseId?: string;
  teacherId: string;
  classroom: string;
  duration: number;
  questions: Question[];
  createdAt: number;
}

export interface ExamSubmission {
  id?: string;
  examId: string;
  studentId: string;
  studentName: string;
  answers: number[];
  score: number;
  violations: number;
  submittedAt: number;
}

export interface Course {
  id?: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  classroom: string;
  subject: string;
  createdAt: number;
}

export interface Material {
  id?: string;
  courseId: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'link';
  fileUrl?: string;
  createdAt: number;
}

export interface Assignment {
  id?: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  classroom: string;
  deadline: number;
  createdAt: number;
}

export interface AssignmentSubmission {
  id?: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content: string;
  submittedAt: number;
  grade?: number;
  feedback?: string;
}
