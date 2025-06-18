export interface StudyMonitoringSummary {
  totalActiveStudents: number;
  presentStudents: number;
  absentStudents: number;
  lateStudents: number;
  attendanceRate: number;
}

export interface AssignedStudyTime {
  activityName: string;
  startTime: string;
  endTime: string;
}

export interface ActualStudyTime {
  startTime: string | null;
  endTime: string | null;
}

export type StudentStatus = 'SCHEDULED' | 'PRESENT' | 'ABSENT' | 'LATE';
export type NotificationType = 'STUDY_START_REMINDER' | 'ABSENCE_WARNING' | 'CUSTOM';
export type NotificationChannel = 'discord' | 'sms';

export interface StudyMonitoringStudent {
  studentId: number;
  studentName: string;
  studentPhone: string;
  guardianPhones: string[];
  status: StudentStatus;
  assignedStudyTime: AssignedStudyTime;
  actualStudyTime: ActualStudyTime;
  lastNotificationSent: string | null;
  lastNotificationType: NotificationType | null;
}

export interface StudyMonitoringData {
  currentTime: string;
  lastModified: string;
  timeFilter: 'current' | 'today';
  summary: StudyMonitoringSummary;
  students: StudyMonitoringStudent[];
}

export interface StudyMonitoringResponse {
  success: boolean;
  data: StudyMonitoringData;
}

export interface NotificationRequest {
  message?: string;
  channels?: NotificationChannel[];
}

export interface BulkNotificationRequest {
  studentIds: number[];
  message?: string;
  channels?: NotificationChannel[];
}

export interface NotificationResult {
  studentId: number;
  studentName: string;
  success: boolean;
  sentChannels: NotificationChannel[];
  failedChannels: NotificationChannel[];
  error?: string;
}

export interface NotificationResponse {
  success: boolean;
  data: {
    studentId: number;
    studentName: string;
    message: string;
    sentChannels: NotificationChannel[];
    failedChannels: NotificationChannel[];
    sentAt: string;
  };
}

export interface BulkNotificationResponse {
  success: boolean;
  data: {
    totalRequested: number;
    totalSent: number;
    results: NotificationResult[];
    sentAt: string;
  };
} 