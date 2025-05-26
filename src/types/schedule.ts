
import { Activity } from './activity';

export interface WeeklySchedule {
  id: number;
  studentId: number;
  activityId: number;
  dayOfWeek: number; // 0=일요일, 1=월요일, ...
  startTime: string;
  endTime: string;
  activity?: Activity;
}

export interface AssignedStudyTime {
  id: number;
  studentId: number;
  activityId: number;
  startTime: string; // timestamp
  endTime: string; // timestamp
  assignedBy: number;
  activity?: Activity;
}

export interface ActualStudyTime {
  id: number;
  studentId: number;
  assignedStudyTimeId: number;
  startTime: string; // timestamp
  endTime: string; // timestamp
  source: string;
  assignedStudyTime?: AssignedStudyTime;
}
