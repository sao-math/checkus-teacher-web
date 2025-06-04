import axios from 'axios';
import { Student } from '@/types/student';
import authService from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

console.log('API Base URL:', API_BASE_URL);

export interface GetStudentsParams {
  classId?: number;
  grade?: number;
  status?: string;
  schoolId?: number;
}

export const studentApi = {
  getStudents: async (params?: GetStudentsParams) => {
    try {
      console.log('Making API request to:', `${API_BASE_URL}/students`);
      const token = authService.getAccessToken();
      console.log('Auth token present:', !!token);
      
      const response = await axios.get(`${API_BASE_URL}/students`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('API Response:', response);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
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
      console.log('Making API request to:', `${API_BASE_URL}/students/${studentId}`);
      const token = authService.getAccessToken();
      console.log('Auth token present:', !!token);
      
      const response = await axios.get(`${API_BASE_URL}/students/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('API Response:', response);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
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