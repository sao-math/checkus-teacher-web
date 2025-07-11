import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { toZonedTime } from 'date-fns-tz';

const KOREAN_TIMEZONE = 'Asia/Seoul';

// Timeline layout constants
const TIMELINE_CONSTANTS = {
  STUDENT_NAME_WIDTH: 140, // w-35 = 140px (기존 192px에서 줄임)
  TIMELINE_WIDTH: 2160, // 24시간 * 90px = 2160px (여유공간 제거)
  START_HOUR: 0, // 0시부터 시작
  END_HOUR: 24, // 24시까지 (다음날 0시)
  TOTAL_HOURS: 24 // 24시간
} as const;

// Context for selected date
const SelectedDateContext = createContext<string | undefined>(undefined);

export const useSelectedDate = () => {
  return useContext(SelectedDateContext);
};

interface FixedLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  selectedDate?: string; // YYYY-MM-DD format
}

export interface FixedLayoutRef {
  scrollToCurrentTime: () => void;
}

const FixedLayout = forwardRef<FixedLayoutRef, FixedLayoutProps>(({ header, children, className, selectedDate }, ref) => {
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollSyncingRef = useRef(false);
  const isProgrammaticScrollRef = useRef(false); // 프로그래매틱 스크롤 플래그 추가

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

  // Throttled scroll synchronization - improved for fast scrolling
  const handleScroll = useCallback((sourceRef: React.RefObject<HTMLDivElement>, targetRef: React.RefObject<HTMLDivElement>) => {
    if (isScrollSyncingRef.current) return;
    
    isScrollSyncingRef.current = true;
    
    if (sourceRef.current && targetRef.current) {
      // Immediate synchronization for better responsiveness
      targetRef.current.scrollLeft = sourceRef.current.scrollLeft;
    }
    
    // Use shorter timeout for faster synchronization reset
    setTimeout(() => {
      isScrollSyncingRef.current = false;
    }, 16); // ~1 frame at 60fps
  }, []);

  // Optimized scroll handlers with immediate sync
  const handleHeaderScroll = useCallback(() => {
    // 프로그래매틱 스크롤이면 사용자 스크롤로 간주하지 않음
    if (!isProgrammaticScrollRef.current) {
      setIsUserScrolling(true);
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
      userScrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, 10000); // Increased from 500ms to 10000ms (10 seconds)
    }
    
    // Remove header scroll limit to allow full synchronization with content
    // The content scroll handler will manage the overall scroll limits
    
    handleScroll(headerScrollRef, contentScrollRef);
    
    // Force immediate re-sync after a frame to handle fast scrolling
    requestAnimationFrame(() => {
      if (headerScrollRef.current && contentScrollRef.current) {
        contentScrollRef.current.scrollLeft = headerScrollRef.current.scrollLeft;
      }
    });
  }, [handleScroll]);

  const handleContentScroll = useCallback(() => {
    // 프로그래매틱 스크롤이면 사용자 스크롤로 간주하지 않음
    if (!isProgrammaticScrollRef.current) {
      setIsUserScrolling(true);
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
      userScrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, 10000); // Increased from 500ms to 10000ms (10 seconds)
    }
    
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
    
    // Force immediate re-sync after a frame to handle fast scrolling
    requestAnimationFrame(() => {
      if (contentScrollRef.current && headerScrollRef.current) {
        headerScrollRef.current.scrollLeft = contentScrollRef.current.scrollLeft;
      }
    });
  }, [handleScroll]);

  useEffect(() => {
    const headerElement = headerScrollRef.current;
    const contentElement = contentScrollRef.current;

    if (headerElement && contentElement) {
      // Use passive: false for better control over scroll synchronization
      headerElement.addEventListener('scroll', handleHeaderScroll, { passive: false });
      contentElement.addEventListener('scroll', handleContentScroll, { passive: false });

      // Additional safety mechanism for fast scrolling
      const syncInterval = setInterval(() => {
        if (!isScrollSyncingRef.current && headerElement && contentElement) {
          // Check if sync is needed and apply if there's a significant difference
          const diff = Math.abs(headerElement.scrollLeft - contentElement.scrollLeft);
          if (diff > 1) { // Allow 1px tolerance
            headerElement.scrollLeft = contentElement.scrollLeft;
          }
        }
      }, 16); // ~60fps

      return () => {
        headerElement.removeEventListener('scroll', handleHeaderScroll);
        contentElement.removeEventListener('scroll', handleContentScroll);
        clearInterval(syncInterval);
      };
    }
  }, [handleHeaderScroll, handleContentScroll]);

  // Calculate current time position (memoized)
  const getCurrentTimePosition = useCallback(() => {
    // Get current time in Korean timezone
    const now = new Date();
    const koreanNow = toZonedTime(now, KOREAN_TIMEZONE);
    
    // Use selectedDate prop or fall back to today's Korean date
    let targetDate = selectedDate;
    if (!targetDate) {
      const year = koreanNow.getFullYear();
      const month = String(koreanNow.getMonth() + 1).padStart(2, '0');
      const day = String(koreanNow.getDate()).padStart(2, '0');
      targetDate = `${year}-${month}-${day}`;
    }
    
    // Parse target date and create timeline start/end in Korean timezone
    const [year, month, day] = targetDate.split('-').map(Number);
    
    // Create timeline start as Korean time (00:00 of target date)
    const timelineStartKorean = new Date(year, month - 1, day, 0, 0, 0);
    const timelineEndKorean = new Date(year, month - 1, day + 1, 0, 0, 0); // Next day 00:00
    
    // Debug logging
    console.log('🕐 Current Time Position Debug:', {
      now: now.toISOString(),
      koreanNow: koreanNow.toISOString(),
      selectedDate: targetDate,
      timelineStartKorean: timelineStartKorean.toISOString(),
      timelineEndKorean: timelineEndKorean.toISOString(),
      koreanNowTime: `${koreanNow.getHours()}:${koreanNow.getMinutes().toString().padStart(2, '0')}`
    });
    
    // Convert Korean times to same format for comparison
    const koreanNowAsLocal = new Date(
      koreanNow.getFullYear(),
      koreanNow.getMonth(), 
      koreanNow.getDate(),
      koreanNow.getHours(),
      koreanNow.getMinutes(),
      koreanNow.getSeconds()
    );
    
    // Check if current Korean time is within the timeline range
    if (koreanNowAsLocal < timelineStartKorean || koreanNowAsLocal >= timelineEndKorean) {
      console.log('❌ Current time is outside timeline range');
      return null; // Current time is outside the timeline
    }
    
    // Calculate hours difference from timeline start (in Korean timezone)
    const hoursDiff = (koreanNowAsLocal.getTime() - timelineStartKorean.getTime()) / (60 * 60 * 1000);
    
    // Calculate percentage position within 24-hour timeline
    const percentage = (hoursDiff / 24) * 100;
    
    console.log('✅ Current time position calculated:', {
      hoursDiff: hoursDiff.toFixed(2),
      percentage: percentage.toFixed(2),
      koreanNowAsLocal: koreanNowAsLocal.toISOString()
    });
    
    return Math.max(0, Math.min(100, percentage));
  }, [currentTime, selectedDate]);

  // 현재 시간으로 스크롤 이동하는 함수
  const scrollToCurrentTime = useCallback(() => {
    console.log('🎯 scrollToCurrentTime called');
    const currentTimePosition = getCurrentTimePosition();
    console.log('📍 Current time position:', currentTimePosition);

    // currentTimePosition이 null인 경우 처리
    if (currentTimePosition === null) {
      console.log('❌ Cannot scroll: currentTimePosition is null');
      return;
    }

    const contentElement = contentScrollRef.current;
    const headerElement = headerScrollRef.current;
    
    if (!contentElement || !headerElement) {
      console.log('❌ Cannot scroll: elements not found', { contentElement: !!contentElement, headerElement: !!headerElement });
      return;
    }
    
    console.log('✅ Elements found, calculating scroll position');
    
    // 현재 시간의 픽셀 위치 계산
    const currentTimePixelPosition = (currentTimePosition / 100) * TIMELINE_CONSTANTS.TIMELINE_WIDTH;
    
    // 학생 이름 열 너비 + 약간의 여백(50px)을 고려하여 목표 위치 설정
    const targetScrollLeft = Math.max(0, currentTimePixelPosition - 50);
    
    console.log('📊 Scroll calculation:', {
      currentTimePosition,
      currentTimePixelPosition,
      targetScrollLeft,
      timelineWidth: TIMELINE_CONSTANTS.TIMELINE_WIDTH
    });
    
    // 프로그래매틱 스크롤 시작 표시
    isProgrammaticScrollRef.current = true;
    console.log('🔒 Programmatic scroll flag set to true');
    
    // 스크롤 동기화를 일시적으로 비활성화
    isScrollSyncingRef.current = true;
    
    // 유저 스크롤 타이머를 클리어하여 간섭 방지
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }
    
    // 즉시 스크롤 (smooth 대신 auto 사용)
    contentElement.scrollLeft = targetScrollLeft;
    headerElement.scrollLeft = targetScrollLeft;
    
    console.log('✅ Scroll completed instantly');
    
    // 다음 프레임에서 플래그들 리셋
    requestAnimationFrame(() => {
      // 스크롤 동기화 재활성화
      isScrollSyncingRef.current = false;
      console.log('🔄 Scroll syncing re-enabled');
      
      // 프로그래매틱 스크롤 플래그 리셋
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
        console.log('🔓 Programmatic scroll flag reset to false');
      }, 100); // 100ms 후에 리셋하여 스크롤 이벤트가 완전히 처리될 때까지 기다림
    });
  }, [getCurrentTimePosition]);

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

  useImperativeHandle(ref, () => ({
    scrollToCurrentTime: scrollToCurrentTime
  }));

  return (
    <SelectedDateContext.Provider value={selectedDate}>
      <div className="relative h-full flex flex-col">
        {/* Sticky Header */}
        <div 
          ref={headerScrollRef}
          className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative"
        >
          <div className="flex min-w-max">
            {/* Student name column header - Fixed position */}
          <div 
              className="flex-shrink-0 bg-gray-50 border-r border-gray-200 flex items-center justify-center font-medium text-gray-700 h-12 sticky left-0 z-40"
            style={{ width: `${TIMELINE_CONSTANTS.STUDENT_NAME_WIDTH}px` }}
          >
              학생
            </div>
            {/* Timeline header */}
            <div className="flex-shrink-0">
              {header}
            </div>
          </div>
          
          {/* Current time indicator line in header - moves with header scroll */}
              {currentTimePosition !== null && (
                <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-50 pointer-events-none"
                  style={{ 
                left: `${TIMELINE_CONSTANTS.STUDENT_NAME_WIDTH + (currentTimePosition / 100) * TIMELINE_CONSTANTS.TIMELINE_WIDTH}px`
                  }}
                >
              <div className="absolute top-2 -left-8 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {currentTime.getHours().toString().padStart(2, '0')}:{currentTime.getMinutes().toString().padStart(2, '0')}
                  </div>
                </div>
              )}
        </div>
        
        {/* Scrollable Content */}
          <div 
            ref={contentScrollRef}
          className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 relative"
          >
          <div className="min-w-max relative">
              {children}
              
            {/* Current time indicator line in content - moves with content scroll */}
            {currentTimePosition !== null && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-40 pointer-events-none"
                style={{ 
                  left: `${TIMELINE_CONSTANTS.STUDENT_NAME_WIDTH + (currentTimePosition / 100) * TIMELINE_CONSTANTS.TIMELINE_WIDTH}px`
                }}
              />
            )}
          </div>
        </div>
      </div>
    </SelectedDateContext.Provider>
  );
});

interface FixedRowProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  className?: string;
}

const FixedRow: React.FC<FixedRowProps> = ({ leftContent, rightContent, className }) => {
  return (
    <div className={cn("flex w-full border-b border-gray-200 hover:bg-gray-50 relative", className)}>
      {/* Fixed Student Info - Higher z-index to stay on top */}
      <div 
        className="p-3 bg-white flex-shrink-0 sticky left-0 z-20 border-r border-gray-200 relative"
        style={{ width: `${TIMELINE_CONSTANTS.STUDENT_NAME_WIDTH}px` }}
      >
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