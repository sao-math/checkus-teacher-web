import { StudyMonitoringData, StudyMonitoringStudent, StudentStatus } from '@/types/study-monitoring';
import { addMinutes, format } from 'date-fns';

// Mock student data generator
const generateMockStudent = (id: number, status: StudentStatus, activityName: string): StudyMonitoringStudent => {
  const now = new Date();
  const startTime = addMinutes(now, -30);
  const endTime = addMinutes(startTime, 120);
  
  let actualStartTime: string | null = null;
  let actualEndTime: string | null = null;
  
  if (status === 'PRESENT') {
    actualStartTime = format(addMinutes(startTime, Math.random() * 10), "yyyy-MM-dd'T'HH:mm:ss");
    if (Math.random() > 0.7) {
      actualEndTime = format(addMinutes(new Date(actualStartTime), 90 + Math.random() * 30), "yyyy-MM-dd'T'HH:mm:ss");
    }
  } else if (status === 'LATE') {
    actualStartTime = format(addMinutes(startTime, 15 + Math.random() * 15), "yyyy-MM-dd'T'HH:mm:ss");
  }

  const lastNotificationTime = status === 'ABSENT' ? 
    format(addMinutes(startTime, 10), "yyyy-MM-dd'T'HH:mm:ss") : null;

  return {
    studentId: id,
    studentName: `학생${id}`,
    studentPhone: `010-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
    guardianPhones: [
      `010-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
      `010-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`
    ],
    status,
    assignedStudyTime: {
      activityName,
      startTime: format(startTime, "yyyy-MM-dd'T'HH:mm:ss"),
      endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss")
    },
    actualStudyTime: {
      startTime: actualStartTime,
      endTime: actualEndTime
    },
    lastNotificationSent: lastNotificationTime,
    lastNotificationType: status === 'ABSENT' ? 'STUDY_START_REMINDER' : null
  };
};

export const generateMockStudyMonitoringData = (timeFilter: 'current' | 'today' = 'current'): StudyMonitoringData => {
  const now = new Date();
  
  // Generate mock students with different statuses
  const activities = ['수학', '영어', '과학', '국어', '사회'];
  const statuses: StudentStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'SCHEDULED'];
  
  const students: StudyMonitoringStudent[] = [];
  
  // Generate 15 students
  for (let i = 1; i <= 15; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const activity = activities[Math.floor(Math.random() * activities.length)];
    students.push(generateMockStudent(i, status, activity));
  }

  // Ensure we have at least some absent students for testing
  if (!students.some(s => s.status === 'ABSENT')) {
    students[0].status = 'ABSENT';
    students[0].lastNotificationSent = format(addMinutes(now, -20), "yyyy-MM-dd'T'HH:mm:ss");
    students[0].lastNotificationType = 'STUDY_START_REMINDER';
  }

  const presentCount = students.filter(s => s.status === 'PRESENT').length;
  const absentCount = students.filter(s => s.status === 'ABSENT').length;
  const lateCount = students.filter(s => s.status === 'LATE').length;
  const totalActive = students.length;
  const attendanceRate = totalActive > 0 ? ((presentCount + lateCount) / totalActive) * 100 : 0;

  return {
    currentTime: format(now, "yyyy-MM-dd'T'HH:mm:ss"),
    lastModified: format(now, "yyyy-MM-dd'T'HH:mm:ss"),
    timeFilter,
    summary: {
      totalActiveStudents: totalActive,
      presentStudents: presentCount,
      absentStudents: absentCount,
      lateStudents: lateCount,
      attendanceRate: Math.round(attendanceRate * 10) / 10
    },
    students
  };
};

// Mock API delay simulation
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms)); 