export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'admin';
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  description: string;
  teacherIds: string[]; // Changed from teacherId to teacherIds array
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  classIds: string[];
  contactInfo: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  typeId: string;
  parentId: string | null;
  isLeaf: boolean;
  children: TodoItem[];
  materials: Array<{
    title: string;
    isVideo: boolean;
    completionCondition: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface StudentSchedule {
  id: string;
  studentId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
  notes: string;
}

export interface StudentTodo {
  id: string;
  studentId: string;
  todoId: string;
  classId: string;
  isCompleted: boolean;
  completedAt: string | null;
  dueDate: string;
  createdAt: string;
}

export interface CompletionRate {
  studentId: string;
  studentName: string;
  completedCount: number;
  totalCount: number;
  rate: number;
  dailyCompletions: StudentDailyCompletion[];
}

export interface StudentDailyCompletion {
  date: string;
  completedCount: number;
  totalCount: number;
  rate: number;
}