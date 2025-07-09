export interface TeacherClassInfo {
  id: number;
  name: string;
}

export interface TeacherClassDetailInfo extends TeacherClassInfo {
  studentCount: number;
}

export interface TeacherListResponse {
  id: number;
  username: string;
  name: string;
  phoneNumber: string;
  discordId?: string;
  createdAt: string;
  status: 'ACTIVE' | 'SUSPENDED';
  classes: TeacherClassInfo[];
}

export interface TeacherDetailResponse {
  id: number;
  username: string;
  name: string;
  phoneNumber: string;
  discordId?: string;
  createdAt: string;
  status: 'ACTIVE' | 'SUSPENDED';
  classes: TeacherClassDetailInfo[];
}

export interface TeacherUpdateRequest {
  name?: string;
  phoneNumber?: string;
  discordId?: string;
  classIds?: number[];
}

export interface GetTeachersParams {
  status?: 'ACTIVE' | 'SUSPENDED';
} 