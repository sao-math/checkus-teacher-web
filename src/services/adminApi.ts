import api from '@/lib/axios';
import { isAxiosError } from 'axios';
import { UserRoleResponse, ResponseBase, RoleName } from '@/types/admin';

export const adminApi = {
  // Get pending role requests for a specific role
  getRoleRequests: async (roleName: RoleName): Promise<UserRoleResponse[]> => {
    try {
      const response = await api.get<ResponseBase<UserRoleResponse[]>>('/admin/role-requests', {
        params: { roleName }
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

  // Approve a user's role (PENDING -> ACTIVE)
  approveRole: async (userId: number, roleName: RoleName): Promise<string> => {
    try {
      const response = await api.post<ResponseBase<string>>('/admin/approve-role', null, {
        params: { userId, roleName }
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

  // Suspend a user's role (ACTIVE -> SUSPENDED)
  suspendRole: async (userId: number, roleName: RoleName): Promise<string> => {
    try {
      const response = await api.post<ResponseBase<string>>('/admin/suspend-role', null, {
        params: { userId, roleName }
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

  // Assign a role directly to a user (directly ACTIVE)
  assignRole: async (userId: number, roleName: RoleName): Promise<string> => {
    try {
      const response = await api.post<ResponseBase<string>>('/admin/assign-role', null, {
        params: { userId, roleName }
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

  // Get all roles for a specific user
  getUserRoles: async (userId: number): Promise<UserRoleResponse[]> => {
    try {
      const response = await api.get<ResponseBase<UserRoleResponse[]>>(`/admin/user-roles/${userId}`);
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

export default adminApi; 