import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  fullHeight?: boolean;
  className?: string;
  spinnerClassName?: string;
  textClassName?: string;
}

const SIZE_CLASSES = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const SIZE_BORDER = {
  sm: 'border-2',
  md: 'border-2',
  lg: 'border-2', 
  xl: 'border-2',
};

/**
 * 로딩 스피너 컴포넌트
 * 다양한 크기와 스타일로 로딩 상태를 표시합니다.
 * 
 * @example
 * ```tsx
 * // 기본 스피너
 * <LoadingSpinner />
 * 
 * // 텍스트가 있는 스피너
 * <LoadingSpinner text="데이터를 불러오는 중..." />
 * 
 * // 전체 화면 로딩
 * <LoadingSpinner fullScreen text="페이지를 로드하는 중..." />
 * 
 * // 큰 스피너
 * <LoadingSpinner size="xl" text="학생 정보를 불러오는 중..." />
 * ```
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  fullScreen = false,
  fullHeight = false,
  className = '',
  spinnerClassName = '',
  textClassName = '',
}) => {
  const containerClasses = cn(
    'flex items-center justify-center',
    {
      'min-h-screen bg-gray-50': fullScreen,
      'h-64': fullHeight && !fullScreen,
      'p-8': fullScreen || fullHeight,
      'p-4': !fullScreen && !fullHeight,
    },
    className
  );

  const spinnerClasses = cn(
    'animate-spin rounded-full border-b-2',
    SIZE_CLASSES[size],
    SIZE_BORDER[size],
    'border-blue-600',
    text ? 'mx-auto mb-4' : '',
    spinnerClassName
  );

  const textClasses = cn(
    'text-gray-600',
    {
      'text-sm': size === 'sm',
      'text-base': size === 'md' || size === 'lg',
      'text-lg': size === 'xl',
    },
    textClassName
  );

  if (fullScreen || fullHeight) {
    return (
      <div className={containerClasses}>
        <div className="text-center">
          <div className={spinnerClasses}></div>
          {text && <p className={textClasses}>{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className={spinnerClasses}></div>
      {text && <span className={cn(textClasses, 'ml-2')}>{text}</span>}
    </div>
  );
};

/**
 * 인라인 로딩 스피너 (텍스트와 함께 한 줄에 표시)
 */
export const InlineLoadingSpinner: React.FC<Omit<LoadingSpinnerProps, 'fullScreen' | 'fullHeight'>> = (props) => {
  return <LoadingSpinner {...props} className={cn('inline-flex', props.className)} />;
};

/**
 * 페이지 로딩 스피너 (전체 높이)
 */
export const PageLoadingSpinner: React.FC<Pick<LoadingSpinnerProps, 'text' | 'size' | 'className'>> = (props) => {
  return <LoadingSpinner {...props} fullHeight />;
};

/**
 * 풀스크린 로딩 스피너
 */
export const FullScreenLoadingSpinner: React.FC<Pick<LoadingSpinnerProps, 'text' | 'size' | 'className'>> = (props) => {
  return <LoadingSpinner {...props} fullScreen />;
};

export default LoadingSpinner; 