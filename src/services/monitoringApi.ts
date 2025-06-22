import api from '@/lib/axios';
import { isAxiosError } from 'axios';
import { MonitoringResponse } from '@/types/monitoring';

export const monitoringApi = {
  /**
   * 시간 범위 기반 학생 모니터링 정보 조회 (NEW)
   * @param startTime 시작 시간 (ISO string)
   * @param endTime 종료 시간 (ISO string)
   */
  getStudyTimeMonitoringByRange: async (startTime: string, endTime: string): Promise<MonitoringResponse> => {
    try {
      const response = await api.get('/study-time/monitor', {
        params: {
          startTime,
          endTime
        }
      });
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

  /**
   * 날짜 기반 학생 모니터링 정보 조회 (기존 API, 내부적으로 시간 범위로 변환)
   * @param date 날짜 (YYYY-MM-DD)
   */
  getStudyTimeMonitoring: async (date: string): Promise<MonitoringResponse> => {
    try {
      // 날짜를 시간 범위로 변환 (0시부터 다음날 6시까지)
      const startTime = `${date}T00:00:00`;
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const endTime = `${nextDay.toISOString().split('T')[0]}T06:00:00`;
      
      // 새로운 시간 범위 API 사용
      return await monitoringApi.getStudyTimeMonitoringByRange(startTime, endTime);
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

  /**
   * 무한스크롤을 위한 과거 데이터 로드
   * @param beforeTime 기준 시간 이전의 데이터
   * @param hours 로드할 시간 범위 (기본 30시간)
   */
  loadPreviousTimeRange: async (beforeTime: string, hours: number = 30): Promise<MonitoringResponse> => {
    const endTime = beforeTime;
    const startTime = new Date(new Date(beforeTime).getTime() - (hours * 60 * 60 * 1000)).toISOString().slice(0, 19);
    
    return await monitoringApi.getStudyTimeMonitoringByRange(startTime, endTime);
  },

  /**
   * 무한스크롤을 위한 미래 데이터 로드
   * @param afterTime 기준 시간 이후의 데이터
   * @param hours 로드할 시간 범위 (기본 30시간)
   */
  loadNextTimeRange: async (afterTime: string, hours: number = 30): Promise<MonitoringResponse> => {
    const startTime = afterTime;
    const endTime = new Date(new Date(afterTime).getTime() + (hours * 60 * 60 * 1000)).toISOString().slice(0, 19);
    
    return await monitoringApi.getStudyTimeMonitoringByRange(startTime, endTime);
  }
};

export default monitoringApi; 