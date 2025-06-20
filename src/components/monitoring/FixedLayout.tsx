import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Timeline layout constants
const TIMELINE_CONSTANTS = {
  STUDENT_NAME_WIDTH: 192, // w-48 = 192px
  TIMELINE_WIDTH: 1800,
  START_HOUR: 6,
  END_HOUR: 24,
  TOTAL_HOURS: 18
} as const;

interface FixedLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const FixedLayout: React.FC<FixedLayoutProps> = ({ header, children, className }) => {
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollSyncingRef = useRef(false);

  // Update current time every 5 seconds for better synchronization
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000); // Update every 5 seconds to match StudyTimeBar ongoing sessions

    return () => clearInterval(interval);
  }, []);

  // Handle resize events (for sidebar toggle responsiveness)
  useEffect(() => {
    const handleResize = () => {
      // Only update if not currently scrolling
      if (!isUserScrolling) {
        setCurrentTime(new Date());
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    
    if (contentScrollRef.current) {
      resizeObserver.observe(contentScrollRef.current);
    }

    // Also listen for sidebar state changes via CSS transition end
    const handleTransitionEnd = () => {
      if (!isUserScrolling) {
        setTimeout(() => {
          setCurrentTime(new Date());
        }, 50);
      }
    };

    document.addEventListener('transitionend', handleTransitionEnd);

    return () => {
      resizeObserver.disconnect();
      document.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, [isUserScrolling]);

  // Throttled scroll synchronization
  const handleScroll = useCallback((sourceRef: React.RefObject<HTMLDivElement>, targetRef: React.RefObject<HTMLDivElement>) => {
    if (isScrollSyncingRef.current) return;
    
    isScrollSyncingRef.current = true;
    
    if (sourceRef.current && targetRef.current) {
      targetRef.current.scrollLeft = sourceRef.current.scrollLeft;
    }
    
    // Reset flag after a frame
    requestAnimationFrame(() => {
      isScrollSyncingRef.current = false;
    });
  }, []);

  // Optimized scroll handlers
  const handleHeaderScroll = useCallback(() => {
    setIsUserScrolling(true);
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }
    userScrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 10000); // Increased from 500ms to 10000ms (10 seconds)
    
    // Limit scroll to not exceed 24:00 (end of timeline) with some buffer
    const headerElement = headerScrollRef.current;
    if (headerElement) {
      const maxScrollLeft = Math.max(0, TIMELINE_CONSTANTS.TIMELINE_WIDTH - headerElement.clientWidth);
      if (headerElement.scrollLeft > maxScrollLeft) {
        headerElement.scrollLeft = maxScrollLeft;
        return;
      }
    }
    
    handleScroll(headerScrollRef, contentScrollRef);
  }, [handleScroll]);

  const handleContentScroll = useCallback(() => {
    setIsUserScrolling(true);
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }
    userScrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 10000); // Increased from 500ms to 10000ms (10 seconds)
    
    // Limit scroll to not exceed 24:00 (end of timeline) with some buffer
    const contentElement = contentScrollRef.current;
    if (contentElement) {
      const totalContentWidth = TIMELINE_CONSTANTS.STUDENT_NAME_WIDTH + TIMELINE_CONSTANTS.TIMELINE_WIDTH;
      const maxScrollLeft = Math.max(0, totalContentWidth - contentElement.clientWidth);
      if (contentElement.scrollLeft > maxScrollLeft) {
        contentElement.scrollLeft = maxScrollLeft;
        return;
      }
    }
    
    handleScroll(contentScrollRef, headerScrollRef);
  }, [handleScroll]);

  useEffect(() => {
    const headerElement = headerScrollRef.current;
    const contentElement = contentScrollRef.current;

    if (headerElement && contentElement) {
      headerElement.addEventListener('scroll', handleHeaderScroll, { passive: true });
      contentElement.addEventListener('scroll', handleContentScroll, { passive: true });

      return () => {
        headerElement.removeEventListener('scroll', handleHeaderScroll);
        contentElement.removeEventListener('scroll', handleContentScroll);
      };
    }
  }, [handleHeaderScroll, handleContentScroll]);

  // Calculate current time position (memoized)
  const getCurrentTimePosition = useCallback(() => {
    const now = currentTime;
    const currentHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    const { START_HOUR, END_HOUR } = TIMELINE_CONSTANTS;
    
    if (currentHour < START_HOUR || currentHour >= END_HOUR) {
      return null;
    }
    
    const progress = (currentHour - START_HOUR) / (END_HOUR - START_HOUR);
    const percentage = progress * 100;
    
    return percentage;
  }, [currentTime]);

  // Disabled auto-scroll logic to allow free browsing
  /*
  useEffect(() => {
    if (isUserScrolling) return; // Don't auto-scroll while user is scrolling
    
    const container = contentScrollRef.current;
    if (container) {
      const containerWidth = container.clientWidth;
      
      if (containerWidth === 0) return;
      
      const timelineWidth = 1800;
      const currentTimePosition = getCurrentTimePosition();
      
      if (currentTimePosition === null) return;
      
      const currentTimePixelPosition = (currentTimePosition / 100) * timelineWidth;
      const targetLeftPosition = containerWidth * 0.3;
      const targetScrollLeft = currentTimePixelPosition - targetLeftPosition;
      const maxScrollLeft = timelineWidth - containerWidth;
      const finalScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));
      
      // Smooth scroll to new position
      container.scrollTo({
        left: finalScrollLeft,
        behavior: 'smooth'
      });
    }
  }, [currentTime, isUserScrolling, getCurrentTimePosition]);
  */

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
          <div className="relative" style={{ width: `${TIMELINE_CONSTANTS.TIMELINE_WIDTH}px` }}>
            {header}
            
            {/* Current Time Indicator in Header - Higher z-index */}
            {currentTimePosition !== null && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none"
                style={{ 
                  left: `${(currentTimePosition / 100) * TIMELINE_CONSTANTS.TIMELINE_WIDTH}px`,
                  zIndex: 50
                }}
              >
                {/* Current Time Box - Positioned at the top of the timeline */}
                <div 
                  className="absolute bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg font-medium"
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: '1px',
                    zIndex: 60,
                    whiteSpace: 'nowrap',
                    textAlign: 'center'
                  }}
                >
                  {currentTime.getHours().toString().padStart(2, '0')}:{currentTime.getMinutes().toString().padStart(2, '0')}
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
          <div className="flex flex-col relative" style={{ width: `calc(${TIMELINE_CONSTANTS.STUDENT_NAME_WIDTH}px + ${TIMELINE_CONSTANTS.TIMELINE_WIDTH}px)` }}>
            {children}
            
            {/* Current Time Indicator - Inside scrollable content - Extends through all rows */}
            {currentTimePosition !== null && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none"
                style={{ 
                  left: `calc(${TIMELINE_CONSTANTS.STUDENT_NAME_WIDTH}px + ${(currentTimePosition / 100) * TIMELINE_CONSTANTS.TIMELINE_WIDTH}px)`,
                  zIndex: 100
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
      <div className="flex-shrink-0 relative z-10" style={{ width: `${TIMELINE_CONSTANTS.TIMELINE_WIDTH}px` }}>
        <div className="h-full">
          {rightContent}
        </div>
      </div>
    </div>
  );
};

export { FixedLayout, FixedRow }; 