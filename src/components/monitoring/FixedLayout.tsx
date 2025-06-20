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

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle resize events (for sidebar toggle responsiveness)
  useEffect(() => {
    const handleResize = () => {
      // Force recalculation by updating current time
      setCurrentTime(new Date());
    };

    const resizeObserver = new ResizeObserver(handleResize);
    
    if (contentScrollRef.current) {
      resizeObserver.observe(contentScrollRef.current);
    }

    // Also listen for sidebar state changes via CSS transition end
    const handleTransitionEnd = () => {
      setTimeout(() => {
        setCurrentTime(new Date());
      }, 50); // Small delay to ensure layout is complete
    };

    document.addEventListener('transitionend', handleTransitionEnd);

    return () => {
      resizeObserver.disconnect();
      document.removeEventListener('transitionend', handleTransitionEnd);
    };
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
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    const startHour = 6;
    const endHour = 24;
    
    console.log('Current time:', now.toLocaleTimeString(), 'Hour:', currentHour, 'Range:', startHour, '-', endHour);
    
    if (currentHour < startHour || currentHour >= endHour) {
      console.log('Outside range, returning null');
      return null;
    }
    
    const progress = (currentHour - startHour) / (endHour - startHour);
    const position = progress * 100;
    
    console.log('Position calculated:', position + '%');
    
    return position;
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
          className="flex-1 overflow-x-auto overflow-y-visible border-b border-gray-200 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 relative"
        >
          <div className="relative" style={{ width: '1800px' }}>
            {header}
            
            {/* Current Time Indicator in Header - Higher z-index */}
            {currentTimePosition !== null && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none"
                style={{ 
                  left: `${(currentTimePosition / 100) * 1800}px`,
                  zIndex: 50 // Higher than time labels (z-index 10)
                }}
              >
                {/* Current Time Box - Positioned at the top of the timeline */}
                <div 
                  className="absolute bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg font-medium"
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)', // Center horizontally
                    top: '1px', // Position just inside the timeline header
                    zIndex: 60,
                    whiteSpace: 'nowrap',
                    textAlign: 'center'
                  }}
                >
                  {currentTime.getHours().toString().padStart(2, '0')}:{currentTime.getMinutes().toString().padStart(2, '0')}:{currentTime.getSeconds().toString().padStart(2, '0')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Content Rows */}
      <div className="w-full">
        <div 
          ref={contentScrollRef}
          className="w-full overflow-x-auto overflow-y-visible scrollbar-hide"
        >
          <div className="flex flex-col relative" style={{ width: 'calc(192px + 1800px)' }}>
            {children}
            
            {/* Current Time Indicator - Inside scrollable content - Extends through all rows */}
            {currentTimePosition !== null && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none"
                style={{ 
                  left: `calc(192px + ${(currentTimePosition / 100) * 1800}px)`,
                  zIndex: 100 // Highest z-index to appear above all content
                }}
              />
            )}
          </div>
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