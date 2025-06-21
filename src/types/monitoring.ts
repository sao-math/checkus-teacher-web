export interface Guardian {
  guardianId: number;
  guardianPhone: string;
  relationship: string;
}

export interface ConnectedActualStudyTime {
  actualStudyTimeId: number;
  startTime: string;
  endTime: string | null;
}

export interface AssignedStudyTime {
  assignedStudyTimeId: number;
  title: string;
  startTime: string;
  endTime: string;
  connectedActualStudyTimes: ConnectedActualStudyTime[];
}

export interface UnassignedActualStudyTime {
  actualStudyTimeId: number;
  startTime: string;
  endTime: string | null;
}

export type StudentStatus = 'ATTENDING' | 'ABSENT' | 'NO_ASSIGNED_TIME';

export interface MonitoringStudent {
  studentId: number;
  studentName: string;
  studentPhone: string;
  status: StudentStatus;
  guardians: Guardian[];
  assignedStudyTimes: AssignedStudyTime[];
  unassignedActualStudyTimes: UnassignedActualStudyTime[];
}

export interface MonitoringData {
  date: string;
  students: MonitoringStudent[];
}

export interface MonitoringResponse {
  success: boolean;
  message: string;
  data: MonitoringData;
} 