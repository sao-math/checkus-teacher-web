import api from '@/lib/axios';
import { isAxiosError } from 'axios';
import {
  StudyMonitoringResponse,
  NotificationRequest,
  NotificationResponse,
  BulkNotificationRequest,
  BulkNotificationResponse
} from '@/types/study-monitoring';
import { generateMockStudyMonitoringData, delay } from '@/data/mockStudyMonitoring';
import { format } from 'date-fns';

// Use mock data in development
const USE_MOCK_DATA = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_STUDY_MONITORING === 'true';

export const studyMonitoringApi = {
  // Get current study monitoring data
  getCurrentMonitoring: async (
    timeFilter: 'current' | 'today' = 'current',
    lastModified?: string
  ): Promise<StudyMonitoringResponse> => {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await delay(300 + Math.random() * 500);
      
      // Simulate 304 Not Modified occasionally
      if (lastModified && Math.random() < 0.3) {
        throw new Error('NOT_MODIFIED');
      }
      
      // Simulate network errors occasionally
      if (Math.random() < 0.05) {
        throw new Error('Network error');
      }
      
      const mockData = generateMockStudyMonitoringData(timeFilter);
      return {
        success: true,
        data: mockData
      };
    }

    try {
      const headers: Record<string, string> = {};
      if (lastModified) {
        headers['If-Modified-Since'] = lastModified;
      }

      const response = await api.get('/admin/study-monitoring/current', {
        params: { timeFilter },
        headers
      });
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        // Handle 304 Not Modified
        if (error.response?.status === 304) {
          throw new Error('NOT_MODIFIED');
        }
        console.error('Study Monitoring API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // Resend notification to individual student
  resendNotification: async (
    studentId: number,
    request: NotificationRequest
  ): Promise<NotificationResponse> => {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await delay(500 + Math.random() * 1000);
      
      // Simulate occasional failures
      if (Math.random() < 0.1) {
        throw new Error('Notification failed');
      }
      
      return {
        success: true,
        data: {
          studentId,
          studentName: `학생${studentId}`,
          message: request.message || '즉시 스터디룸에 입장해주세요!',
          sentChannels: request.channels || ['discord', 'sms'],
          failedChannels: [],
          sentAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
        }
      };
    }

    try {
      const response = await api.post(
        `/admin/study-monitoring/resend-notification/${studentId}`,
        request
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Notification API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // Send bulk notification to multiple students
  sendBulkNotification: async (
    request: BulkNotificationRequest
  ): Promise<BulkNotificationResponse> => {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await delay(1000 + Math.random() * 1500);
      
      const totalRequested = request.studentIds.length;
      const successCount = Math.floor(totalRequested * (0.8 + Math.random() * 0.2)); // 80-100% success rate
      
      const results = request.studentIds.map((studentId, index) => ({
        studentId,
        studentName: `학생${studentId}`,
        success: index < successCount,
        sentChannels: index < successCount ? (request.channels || ['discord']) : [],
        failedChannels: index >= successCount ? (request.channels || ['discord']) : [],
        error: index >= successCount ? '디스코드 ID가 등록되지 않음' : undefined
      }));
      
      return {
        success: true,
        data: {
          totalRequested,
          totalSent: successCount,
          results,
          sentAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
        }
      };
    }

    try {
      const response = await api.post(
        '/admin/study-monitoring/bulk-notification',
        request
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Bulk Notification API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  }
}; 