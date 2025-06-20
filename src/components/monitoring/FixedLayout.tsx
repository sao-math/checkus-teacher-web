import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAutoScroll } from './Timeline';

interface FixedLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const FixedLayout: React.FC<FixedLayoutProps> = ({ header, children, className }) => {
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Use auto-scroll hook for current time positioning
  useAutoScroll({ headerScrollRef, contentScrollRef });

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Synchronize scroll between header and content
  const handleHeaderScroll = () => {
    if (headerScrollRef.current && contentScrollRef.current) {
      contentScrollRef.current.scrollLeft = headerScrollRef.current.scrollLeft;
    }
  };

  const handleContentScroll = () => {
    if (headerScrollRef.current && contentScrollRef.current) {
      headerScrollRef.current.scrollLeft = contentScrollRef.current.scrollLeft;
    }
  };

  useEffect(() => {
    const headerElement = headerScrollRef.current;
    const contentElement = contentScrollRef.current;

    if (headerElement && contentElement) {
      headerElement.addEventListener('scroll', handleHeaderScroll);
      contentElement.addEventListener('scroll', handleContentScroll);

      return () => {
        headerElement.removeEventListener('scroll', handleHeaderScroll);
        contentElement.removeEventListener('scroll', handleContentScroll);
      };
    }
  }, []);

  // Calculate current time position
  const getCurrentTimePosition = () => {
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
    const startHour = 6;
    const endHour = 24;
    
    if (currentHour < startHour || currentHour >= endHour) return null;
    
    const progress = (currentHour - startHour) / (endHour - startHour);
    return progress * 100;
  };

  const currentTimePosition = getCurrentTimePosition();

  return (
    <div className={cn("relative", className)}>
      {/* Header Row */}
      <div className="flex w-full">
        {/* Fixed Student Name Header */}
        <div className="w-48 h-12 border-b border-r border-gray-200 bg-gray-50 flex items-center px-3 flex-shrink-0 z-30">
          <span className="text-sm font-medium text-gray-600">학생</span>
        </div>
        
        {/* Scrollable Timeline Header - Show scrollbar here */}
        <div 
          ref={headerScrollRef}
          className="flex-1 overflow-x-auto overflow-y-hidden border-b border-gray-200 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          <div style={{ width: '1800px' }}>
            {header}
          </div>
        </div>
      </div>
      
      {/* Content Rows */}
      <div className="w-full">
        <div 
          ref={contentScrollRef}
          className="w-full overflow-x-auto overflow-y-visible scrollbar-hide"
        >
          <div className="flex flex-col" style={{ width: 'calc(192px + 1800px)' }}>
            {children}
          </div>
        </div>
      </div>

      {/* Current Time Indicator - At the top level */}
      {currentTimePosition !== null && (
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none"
          style={{ 
            left: `calc(192px + ${(currentTimePosition / 100) * 1800}px)`,
            zIndex: 99999 // 최상위 z-index
          }}
        >
          <div 
            className="absolute bg-red-500 text-white text-xs px-2 py-1 rounded"
            style={{
              left: '50%',
              transform: 'translateX(-50%)', // 막대 중앙에 정렬
              top: '-28px', // 헤더 영역으로 올리기
              zIndex: 99999
            }}
          >
            {currentTime.getHours().toString().padStart(2, '0')}:{currentTime.getMinutes().toString().padStart(2, '0')}
          </div>
        </div>
      )}
    </div>
  );
};

interface FixedRowProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  className?: string;
}

const FixedRow: React.FC<FixedRowProps> = ({ leftContent, rightContent, className }) => {
  return (
    <div className={cn("flex w-full border-b border-gray-200 hover:bg-gray-50 relative", className)}>
      {/* Fixed Student Info - Higher z-index to stay on top */}
      <div className="w-48 p-3 bg-white flex-shrink-0 sticky left-0 z-20 border-r border-gray-200 relative">
        {leftContent}
      </div>
      
      {/* Timeline Content - Lower z-index */}
      <div className="flex-shrink-0 relative z-10" style={{ width: '1800px' }}>
        <div className="p-3">
          {rightContent}
        </div>
      </div>
    </div>
  );
};

export { FixedLayout, FixedRow }; 