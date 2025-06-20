import React, { useRef, useEffect } from 'react';
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

  // Use auto-scroll hook for current time positioning
  useAutoScroll({ headerScrollRef, contentScrollRef });

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

  return (
    <div className={cn("relative", className)}>
      {/* Header Row */}
      <div className="flex w-full">
        {/* Fixed Student Name Header */}
        <div className="w-48 h-12 border-b border-gray-200 bg-gray-50 flex items-center px-3 flex-shrink-0 sticky left-0 z-30 border-r border-gray-200">
          <span className="text-sm font-medium text-gray-600">학생</span>
        </div>
        
        {/* Scrollable Timeline Header - Hide scrollbar */}
        <div 
          ref={headerScrollRef}
          className="flex-1 overflow-x-auto overflow-y-hidden border-b border-gray-200 scrollbar-hide"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none'
          }}
        >
          <div style={{ width: '1800px' }}>
            {header}
          </div>
        </div>
      </div>
      
      {/* Content Rows */}
      <div 
        ref={contentScrollRef}
        className="w-full overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        <div className="flex flex-col" style={{ width: 'calc(192px + 1800px)' }}>
          {children}
        </div>
      </div>
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