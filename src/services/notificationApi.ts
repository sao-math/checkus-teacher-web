import api from '@/lib/axios';
import { isAxiosError } from 'axios';

// Notification API 요청/응답 타입 정의
export interface SendNotificationRequest {
  studentId: number;
  deliveryMethod: 'alimtalk' | 'discord';
  templateId?: string;
  customMessage?: string;
}

export interface SendNotificationResponse {
  success: boolean;
  message: string;
  data: {
    deliveryMethod: string;
    recipient: string;
    sentMessage: string;  
    templateUsed: string | null;
  } | null;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  previewMessage: string;
  requiredVariables: string[];
}

export interface TemplateListResponse {
  success: boolean;
  message: string;
  data: NotificationTemplate[];
}

export const notificationApi = {
  // 직접 알림 발송
  sendNotification: async (request: SendNotificationRequest): Promise<SendNotificationResponse> => {
    try {
      const response = await api.post<SendNotificationResponse>('/notifications/send', request);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Send Notification API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // 템플릿 목록 조회
  getTemplates: async (): Promise<TemplateListResponse> => {
    try {
      const response = await api.get<TemplateListResponse>('/notifications/templates');
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Get Templates API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  // 여러 학생에게 동시 발송 (벌크 발송)
  sendBulkNotification: async (studentIds: number[], deliveryMethod: 'alimtalk' | 'discord', templateId?: string, customMessage?: string): Promise<{ success: number; failed: number; errors: string[] }> => {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // 각 학생에게 순차적으로 발송
    for (const studentId of studentIds) {
      try {
        await notificationApi.sendNotification({
          studentId,
          deliveryMethod,
          templateId,
          customMessage
        });
        results.success++;
      } catch (error) {
        results.failed++;
        const errorMessage = isAxiosError(error) && error.response?.data?.message 
          ? error.response.data.message 
          : '알 수 없는 오류가 발생했습니다.';
        results.errors.push(`학생 ID ${studentId}: ${errorMessage}`);
      }
    }

    return results;
  }
};

export default notificationApi; 