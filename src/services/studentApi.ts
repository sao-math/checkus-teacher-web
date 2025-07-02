import api from '@/lib/axios';
import { isAxiosError } from 'axios';
import { Student, StudentUpdateRequest } from '@/types/student';
import { WeeklySchedule, AssignedStudyTime, ActualStudyTime } from '@/types/schedule';
import { Activity } from '@/types/activity';
import authService from './auth';

export interface GetStudentsParams {
  classId?: number;
  grade?: number;
  status?: string;
  schoolId?: number;
}

export interface WeeklyScheduleRequest {
  studentId: number;
  title: string;
  activityId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface StudyTimeRequest {
  studentId: number;
  title: string;
  activityId: number;
  startTime: string;
  endTime: string;
}

export const studentApi = {
  // Student Management
  getStudents: async (params?: GetStudentsParams) => {
    try {
      const response = await api.get('/students', { params });
      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  getStudentDetail: async (studentId: number) => {
    try {
      const response = await api.get(`/students/${studentId}`);
      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  updateStudent: async (studentId: number, data: StudentUpdateRequest) => {
    try {
      const response = await api.put(`/students/${studentId}`, data);
      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  deleteStudent: async (studentId: number) => {
    try {
      const response = await api.delete(`/students/${studentId}`);
      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // Weekly Schedule Management
  getWeeklySchedule: async (studentId: number) => {
    try {
      const response = await api.get(`/weekly-schedule/student/${studentId}`);
      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  createWeeklySchedule: async (data: WeeklyScheduleRequest) => {
    try {
      const response = await api.post('/weekly-schedule', data);
      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  updateWeeklySchedule: async (scheduleId: number, data: WeeklyScheduleRequest) => {
    try {
      const response = await api.put(`/weekly-schedule/${scheduleId}`, data);
      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  deleteWeeklySchedule: async (scheduleId: number) => {
    try {
      const response = await api.delete(`/weekly-schedule/${scheduleId}`);
      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // Get all activities for weekly schedule
  getAllActivities: async () => {
    try {
      const response = await api.get('/weekly-schedule/activities');
      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // Study Time Management
  getAssignedStudyTimes: async (studentId: number, startDate: string, endDate: string) => {
    try {
      const response = await api.get(`/study-time/assigned/student/${studentId}`, {
        params: { startDate, endDate }
      });
      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  getActualStudyTimes: async (studentId: number, startDate: string, endDate: string) => {
    try {
      const response = await api.get(`/study-time/actual/student/${studentId}`, {
        params: { startDate, endDate }
      });
      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  assignStudyTime: async (data: StudyTimeRequest) => {
    try {
      const response = await api.post('/study-time/assign', data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  updateStudyTime: async (studyTimeId: number, data: Partial<StudyTimeRequest>) => {
    try {
      const response = await api.put(`/study-time/${studyTimeId}`, data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  deleteStudyTime: async (studyTimeId: number) => {
    try {
      const response = await api.delete(`/study-time/${studyTimeId}`);
      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // Activities
  getActivities: async () => {
    try {
      const response = await api.get('/study-time/activities');
      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // Get actual study times by assigned study time ID
  getActualStudyTimesByAssigned: async (assignedId: number) => {
    try {
      const response = await api.get(`/study-time/actual/assigned/${assignedId}`);
      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },
}; 