export interface UserRoleResponse {
  userId: number;
  username: string;
  name: string;
  roleId: number;
  roleName: string;
  status: string;
  statusDescription: string;
  schoolName?: string | null;
  grade?: number | null;
}

export interface ResponseBase<T> {
  success: boolean;
  message: string;
  data: T;
}

export type RoleName = 'STUDENT' | 'TEACHER' | 'GUARDIAN' | 'ADMIN';
export type RoleStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED'; 