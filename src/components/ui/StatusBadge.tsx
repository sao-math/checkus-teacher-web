import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface StatusConfig {
  label: string;
  className: string;
}

export type StatusType = 'student' | 'teacher' | 'class' | 'custom';

// 상태별 설정 맵
const STATUS_CONFIGS: Record<StatusType, Record<string, StatusConfig>> = {
  student: {
    INQUIRY: { label: '문의', className: 'bg-yellow-100 text-yellow-800' },
    COUNSELING_SCHEDULED: { label: '상담', className: 'bg-orange-100 text-orange-800' },
    ENROLLED: { label: '재원', className: 'bg-green-100 text-green-800' },
    WAITING: { label: '대기', className: 'bg-purple-100 text-purple-800' },
    WITHDRAWN: { label: '퇴원', className: 'bg-red-100 text-red-800' },
    UNREGISTERED: { label: '미등록', className: 'bg-gray-100 text-gray-800' },
  },
  teacher: {
    ACTIVE: { label: '활성화됨', className: 'bg-green-100 text-green-800' },
    PENDING: { label: '승인 대기', className: 'bg-yellow-100 text-yellow-800' },
    SUSPENDED: { label: '일시정지', className: 'bg-red-100 text-red-800' },
    RESIGNED: { label: '퇴직', className: 'bg-red-100 text-red-800' },
  },
  class: {
    ACTIVE: { label: '활성', className: 'bg-green-100 text-green-800' },
    INACTIVE: { label: '비활성', className: 'bg-gray-100 text-gray-800' },
    ARCHIVED: { label: '보관됨', className: 'bg-blue-100 text-blue-800' },
  },
  custom: {}, // 사용자 정의 상태
};

export interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  customConfig?: Record<string, StatusConfig>;
  className?: string;
}

/**
 * 상태를 자동으로 색깔과 라벨로 표시하는 Badge 컴포넌트
 * 
 * @example
 * ```tsx
 * // 학생 상태
 * <StatusBadge status="ENROLLED" type="student" />
 * 
 * // 교사 상태  
 * <StatusBadge status="ACTIVE" type="teacher" />
 * 
 * // 사용자 정의 상태
 * <StatusBadge 
 *   status="CUSTOM_STATUS" 
 *   type="custom"
 *   customConfig={{
 *     CUSTOM_STATUS: { label: '커스텀', className: 'bg-purple-100 text-purple-800' }
 *   }}
 * />
 * ```
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'custom',
  customConfig = {},
  className,
}) => {
  // 설정 가져오기
  const configs = type === 'custom' ? customConfig : STATUS_CONFIGS[type];
  const config = configs[status];

  // 설정이 없으면 기본값 사용
  const finalConfig: StatusConfig = config || {
    label: status,
    className: 'bg-gray-100 text-gray-800',
  };

  return (
    <Badge className={cn(finalConfig.className, className)}>
      {finalConfig.label}
    </Badge>
  );
};

/**
 * 상태 설정을 가져오는 유틸리티 함수들
 */
export const getStatusConfig = (status: string, type: StatusType): StatusConfig => {
  const configs = STATUS_CONFIGS[type];
  return configs[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
};

export const getStatusLabel = (status: string, type: StatusType): string => {
  return getStatusConfig(status, type).label;
};

export const getStatusClassName = (status: string, type: StatusType): string => {
  return getStatusConfig(status, type).className;
};

export default StatusBadge; 