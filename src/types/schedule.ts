import { Activity } from './activity';

export interface WeeklySchedule {
  id: number;
  studentId: number;
  studentName: string;
  activityId: number;
  activityName: string;
  dayOfWeek: number; // 1=월요일, 7=일요일
  dayOfWeekName: string;
  startTime: string; // "HH:mm:ss"
  endTime: string;   // "HH:mm:ss"
  activity?: Activity;
}

export interface WeeklySchedulePeriod {
  id: number;
  studentId: number;
  studentName: string;
  activityId: number;
  activityName: string;
  actualStartTime: string; // "2025-06-02T09:00:00"
  actualEndTime: string;   // "2025-06-02T10:30:00"
  dayOfWeek: number;
  dayOfWeekName: string;
}

export interface AssignedStudyTime {
  id: number;
  studentId: number;
  studentName: string;
  activityId: number;
  activityName: string;
  startTime: string; // "2025-06-01T10:00:00"
  endTime: string;   // "2025-06-01T12:00:00"
  assignedBy: number;
  assignedByName: string;
  activity?: Activity;
}

export interface ActualStudyTime {
  id: number;
  studentId: number;
  studentName: string;
  assignedStudyTimeId: number;
  startTime: string;
  endTime: string | null;
  source: string; // "discord"
}
