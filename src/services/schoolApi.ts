import api from '@/lib/axios';
import { isAxiosError } from 'axios';

export interface School {
  id: number;
  name: string;
  studentCount?: number;
}

export interface CreateSchoolRequest {
  name: string;
}

export const schoolApi = {
  getSchools: async (): Promise<School[]> => {
    try {
      const response = await api.get('/schools');
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

  createSchool: async (schoolData: CreateSchoolRequest): Promise<School> => {
    try {
      const response = await api.post('/schools', schoolData);
      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Create School API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  deleteSchool: async (schoolId: number): Promise<void> => {
    try {
      const response = await api.delete(`/schools/${schoolId}`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Delete School API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        // 학생이 연결되어 있으면 에러 메시지 포함
        if (error.response?.status === 400) {
          throw new Error('연결된 학생이 있어 학교를 삭제할 수 없습니다.');
        }
        if (error.response?.status === 404) {
          throw new Error('학교를 찾을 수 없습니다.');
        }
      }
      throw error;
    }
  },
}; 