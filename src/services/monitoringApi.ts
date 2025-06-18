import api from '@/lib/axios';
import { isAxiosError } from 'axios';
import { MonitoringResponse } from '@/types/monitoring';

export const monitoringApi = {
  getStudyTimeMonitoring: async (date: string): Promise<MonitoringResponse> => {
    try {
      const response = await api.get(`/study-time/monitor/${date}`);
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
};

export default monitoringApi; 