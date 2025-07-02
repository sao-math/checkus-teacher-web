import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export interface PageHeaderAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  onBack?: () => void;
  backLabel?: string;
  actions?: PageHeaderAction[];
  sticky?: boolean;
  className?: string;
}

/**
 * 페이지 헤더 컴포넌트
 * Detail 페이지들의 공통 헤더 패턴을 통합하여 일관성 있는 UI를 제공합니다.
 * 
 * @example
 * ```tsx
 * <PageHeader
 *   title="학생 정보"
 *   description="김학생의 정보를 확인하고 관리할 수 있습니다"
 *   onBack={() => navigate('/students')}
 *   actions={[
 *     {
 *       label: '편집',
 *       onClick: () => navigate('/edit'),
 *       icon: <Edit className="h-4 w-4" />
 *     },
 *     {
 *       label: '삭제',
 *       onClick: handleDelete,
 *       variant: 'destructive',
 *       icon: <Trash2 className="h-4 w-4" />
 *     }
 *   ]}
 * />
 * ```
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  onBack,
  backLabel,
  actions = [],
  sticky = true,
  className = '',
}) => {
  const baseClasses = `bg-white border-b ${sticky ? 'sticky top-0 z-10' : ''}`;
  
  return (
    <div className={`${baseClasses} ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 왼쪽: 뒤로가기 버튼과 제목 */}
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
                {backLabel && <span className="ml-2">{backLabel}</span>}
              </Button>
            )}
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-gray-500">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* 오른쪽: 액션 버튼들 */}
          {actions.length > 0 && (
            <div className="flex gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'default'}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={action.className}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader; 