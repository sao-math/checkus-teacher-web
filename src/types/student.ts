export interface User {
  id: number;
  username: string;
  name: string;
  phoneNumber: string;
  discordId?: string;
  createdAt: string;
}

export interface Guardian {
  id: number;
  name: string;
  phoneNumber: string;
  relationship: string;
}

export interface Student {
  id: number;
  name: string;
  phoneNumber: string | null;
  studentPhoneNumber: string;
  school: string;
  grade: number;
  classes: string[];
  status: 'ENROLLED' | 'GRADUATED' | 'WITHDRAWN';
  guardians: Guardian[];
}

export interface StudentProfile {
  userId: number;
  status: 'active' | 'inactive' | 'graduated';
  schoolId: number;
  grade: number;
  gender: 'male' | 'female';
}

export interface School {
  id: number;
  name: string;
}

export interface WeeklySchedule {
  id: number;
  studentId: number;
  dayOfWeek: number; // 0=일요일, 1=월요일, ...
  startTime: string;
  endTime: string;
  activity: string;
}

export interface AssignedStudyTime {
  id: number;
  studentId: number;
  startTime: string;
  endTime: string;
  activity: string;
  assignedBy: number;
}

export interface ActualStudyTime {
  id: number;
  studentId: number;
  startTime: string;
  endTime: string;
  activity: string;
  source: string;
}
