import React from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw, Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  fullHeight?: boolean;
  className?: string;
  spinnerClassName?: string;
  textClassName?: string;
  variant?: 'default' | 'button' | 'white' | 'colored';
  icon?: 'default' | 'refresh' | 'loader2';
  iconClassName?: string;
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

const VARIANT_COLORS = {
  default: 'border-blue-600',
  button: 'border-white',
  white: 'border-white',
  colored: 'border-orange-600',
};

/**
 * 통합 로딩 스피너 컴포넌트
 * 다양한 크기, 스타일, 아이콘으로 로딩 상태를 표시합니다.
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
 * // 버튼 내부 로딩 (흰색)
 * <LoadingSpinner size="sm" variant="button" text="저장 중..." />
 * 
 * // 리프레시 아이콘 스피너
 * <LoadingSpinner icon="refresh" text="새로고침" />
 * 
 * // Loader2 아이콘 스피너 (버튼용)
 * <LoadingSpinner icon="loader2" size="sm" />
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
  variant = 'default',
  icon = 'default',
  iconClassName = '',
}) => {
  const containerClasses = cn(
    'flex items-center justify-center',
    {
      'min-h-screen bg-gray-50': fullScreen,
      'h-64': fullHeight && !fullScreen,
      'p-8': fullScreen || fullHeight,
      'p-4': !fullScreen && !fullHeight && text,
      'inline-flex': !fullScreen && !fullHeight && !text,
    },
    className
  );

  const textClasses = cn(
    'text-gray-600',
    {
      'text-sm': size === 'sm',
      'text-base': size === 'md' || size === 'lg',
      'text-lg': size === 'xl',
      'text-white': variant === 'button' || variant === 'white',
      'ml-2': !fullScreen && !fullHeight && text,
      'mt-4': (fullScreen || fullHeight) && text,
    },
    textClassName
  );

  // Icon-based spinners
  if (icon === 'refresh') {
    const iconClasses = cn(
      'animate-spin',
      SIZE_CLASSES[size],
      {
        'text-blue-600': variant === 'default',
        'text-white': variant === 'button' || variant === 'white',
        'text-orange-600': variant === 'colored',
      },
      iconClassName,
      spinnerClassName
    );

    if (fullScreen || fullHeight) {
      return (
        <div className={containerClasses}>
          <div className="text-center">
            <RefreshCw className={cn(iconClasses, 'mx-auto')} />
            {text && <p className={textClasses}>{text}</p>}
          </div>
        </div>
      );
    }

    return (
      <div className={containerClasses}>
        <RefreshCw className={iconClasses} />
        {text && <span className={textClasses}>{text}</span>}
      </div>
    );
  }

  if (icon === 'loader2') {
    const iconClasses = cn(
      'animate-spin',
      SIZE_CLASSES[size],
      {
        'text-blue-600': variant === 'default',
        'text-white': variant === 'button' || variant === 'white',
        'text-orange-600': variant === 'colored',
      },
      iconClassName,
      spinnerClassName
    );

    if (fullScreen || fullHeight) {
      return (
        <div className={containerClasses}>
          <div className="text-center">
            <Loader2 className={cn(iconClasses, 'mx-auto')} />
            {text && <p className={textClasses}>{text}</p>}
          </div>
        </div>
      );
    }

    return (
      <div className={containerClasses}>
        <Loader2 className={iconClasses} />
        {text && <span className={textClasses}>{text}</span>}
      </div>
    );
  }

  // Default CSS spinner
  const spinnerClasses = cn(
    'animate-spin rounded-full border-b-2',
    SIZE_CLASSES[size],
    SIZE_BORDER[size],
    VARIANT_COLORS[variant],
    {
      'mx-auto': (fullScreen || fullHeight) && text,
    },
    spinnerClassName
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
      {text && <span className={textClasses}>{text}</span>}
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
export const PageLoadingSpinner: React.FC<Pick<LoadingSpinnerProps, 'text' | 'size' | 'className' | 'variant' | 'icon'>> = (props) => {
  return <LoadingSpinner {...props} fullHeight />;
};

/**
 * 풀스크린 로딩 스피너
 */
export const FullScreenLoadingSpinner: React.FC<Pick<LoadingSpinnerProps, 'text' | 'size' | 'className' | 'variant' | 'icon'>> = (props) => {
  return <LoadingSpinner {...props} fullScreen />;
};

/**
 * 버튼 로딩 스피너 (버튼 내부용, 흰색)
 */
export const ButtonLoadingSpinner: React.FC<Pick<LoadingSpinnerProps, 'text' | 'size' | 'className' | 'icon'>> = (props) => {
  return <LoadingSpinner {...props} variant="button" />;
};

/**
 * 리프레시 버튼 스피너
 */
export const RefreshLoadingSpinner: React.FC<Pick<LoadingSpinnerProps, 'text' | 'size' | 'className' | 'variant'>> = (props) => {
  return <LoadingSpinner {...props} icon="refresh" />;
};

export default LoadingSpinner; 