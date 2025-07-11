import api from '@/lib/axios';
import { isAxiosError } from 'axios';
import { MonitoringResponse } from '@/types/monitoring';
import { fromZonedTime } from 'date-fns-tz';

const KOREAN_TIMEZONE = 'Asia/Seoul';

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
      // 선택된 날짜를 파싱
      const [year, month, day] = date.split('-').map(Number);
      
      // 한국시간 기준으로 선택된 날짜 24시간만 조회 (00:00 ~ 24:00)
      const koreanStartTime = new Date(year, month - 1, day, 0, 0, 0); // 한국시간 00:00
      const koreanEndTime = new Date(year, month - 1, day, 23, 59, 59); // 한국시간 23:59:59
      
      // 한국시간을 UTC로 변환
      const utcStartTime = fromZonedTime(koreanStartTime, KOREAN_TIMEZONE);
      const utcEndTime = fromZonedTime(koreanEndTime, KOREAN_TIMEZONE);
      
      // UTC 시간을 ISO 문자열로 변환 (Z 접미사 포함)
      const startTimeStr = utcStartTime.toISOString();
      const endTimeStr = utcEndTime.toISOString();
      
      console.log('📅 Monitoring API 요청 범위 (24시간):', {
        selectedDate: date,
        koreanRange: {
          start: `${date}T00:00:00 (KST)`,
          end: `${date}T23:59:59 (KST)`
        },
        utcRange: {
          start: startTimeStr,
          end: endTimeStr
        }
      });
      
      // 새로운 시간 범위 API 사용
      return await monitoringApi.getStudyTimeMonitoringByRange(startTimeStr, endTimeStr);
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