import api from '@/lib/axios';
import { isAxiosError } from 'axios';
import { 
  TeacherListResponse, 
  TeacherDetailResponse, 
  TeacherUpdateRequest, 
  GetTeachersParams 
} from '@/types/teacher';

export const teacherApi = {
  // Teacher Management
  getTeachers: async (params?: GetTeachersParams) => {
    try {
      const response = await api.get('/teachers', { params });
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

  getTeacherDetail: async (teacherId: number): Promise<TeacherDetailResponse> => {
    try {
      const response = await api.get(`/teachers/${teacherId}`);
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

  updateTeacher: async (teacherId: number, data: TeacherUpdateRequest): Promise<TeacherDetailResponse> => {
    try {
      const response = await api.put(`/teachers/${teacherId}`, data);
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

  deleteTeacher: async (teacherId: number): Promise<string> => {
    try {
      const response = await api.delete(`/teachers/${teacherId}`);
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
  }
}; 