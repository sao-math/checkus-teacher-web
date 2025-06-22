import api from '@/lib/axios';
import { isAxiosError } from 'axios';

export interface School {
  id: number;
  name: string;
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
}; 