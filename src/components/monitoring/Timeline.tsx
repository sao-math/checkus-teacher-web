import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { AssignedStudyTime, ConnectedActualStudyTime, UnassignedActualStudyTime } from '@/types/monitoring';
import { formatKoreanTime, formatKoreanTimeRange } from '@/utils/dateUtils';
import { useSelectedDate } from './FixedLayout';

// Timeline layout constants (shared with FixedLayout)
const TIMELINE_CONSTANTS = {
  STUDENT_NAME_WIDTH: 140, // w-35 = 140px (기존 192px에서 줄임)
  TIMELINE_WIDTH: 2160, // 24시간 * 90px = 2160px (여유공간 제거)
  START_HOUR: 0, // 0시부터 시작
  END_HOUR: 24, // 24시까지 (다음날 0시)
  TOTAL_HOURS: 24 // 24시간
} as const;

interface TimelineProps {
  children: React.ReactNode;
  className?: string;
}

const Timeline: React.FC<TimelineProps> = ({ children, className }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update current time every 30 seconds (reduced frequency)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // Update every 30 seconds instead of every second

    return () => clearInterval(interval);
  }, []);

  // Detect user scrolling
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsUserScrolling(true);
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
      userScrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, 1000);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, []);

  // Auto-scroll to show current time at 30% from left (only when not user scrolling)
  useEffect(() => {
    if (isUserScrolling) return; // Don't auto-scroll while user is scrolling
    
    if (scrollRef.current) {
      const container = scrollRef.current;
      const containerWidth = container.clientWidth;
      
      // Wait for container to be fully rendered
      if (containerWidth === 0) return;
      
      const timelineWidth = TIMELINE_CONSTANTS.TIMELINE_WIDTH;
      
      // Calculate current time position (6:00 to 24:00 = 18 hours)
      const startHour = TIMELINE_CONSTANTS.START_HOUR;
      const endHour = TIMELINE_CONSTANTS.END_HOUR;
      const totalHours = TIMELINE_CONSTANTS.TOTAL_HOURS;
      const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
      
      // Calculate the pixel position of current time on the timeline
      let currentTimePixelPosition;
      
      if (currentHour < startHour) {
        // Before 6 AM - show beginning of timeline
        currentTimePixelPosition = 0;
      } else if (currentHour >= endHour) {
        // After 12 AM - show end of timeline
        currentTimePixelPosition = timelineWidth;
      } else {
        // Between 6 AM and 12 AM - calculate exact position
        const timeProgress = (currentHour - startHour) / totalHours;
        currentTimePixelPosition = timeProgress * timelineWidth;
      }
      
      // Calculate scroll position to put current time at 30% from left
      const targetLeftPosition = containerWidth * 0.3;
      const targetScrollLeft = currentTimePixelPosition - targetLeftPosition;
      
      // Ensure scroll position is within bounds
      const maxScrollLeft = timelineWidth - containerWidth;
      const finalScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));
      
      // Smooth scroll on first load, instant updates afterward
      if (!isInitialized) {
        container.scrollTo({
          left: finalScrollLeft,
          behavior: 'smooth'
        });
        setIsInitialized(true);
      } else {
        container.scrollLeft = finalScrollLeft;
      }
    }
  }, [currentTime, isInitialized, isUserScrolling]);

  // Initial scroll when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current && !isInitialized) {
        setCurrentTime(new Date()); // Trigger scroll calculation
      }
    }, 100); // Small delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, [isInitialized]);

  return (
    <div 
      ref={scrollRef}
      className={cn("overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100", className)}
    >
      <div className="relative min-w-max">
        {children}
      </div>
    </div>
  );
};

// Timeline header showing hours (original version for legacy compatibility)
const TimelineHeader: React.FC = () => {
  const hours = Array.from({ length: TIMELINE_CONSTANTS.TOTAL_HOURS }, (_, i) => TIMELINE_CONSTANTS.START_HOUR + i); // 6:00 to 23:00
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute instead of every second

    return () => clearInterval(interval);
  }, []);

  const getCurrentTimePosition = useCallback(() => {
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
    const { START_HOUR, END_HOUR } = TIMELINE_CONSTANTS;
    
    if (currentHour < START_HOUR || currentHour >= END_HOUR) return null;
    
    const progress = (currentHour - START_HOUR) / (END_HOUR - START_HOUR);
    return progress * 100;
  }, [currentTime]);

  const currentTimePosition = getCurrentTimePosition();

  return (
    <div className="relative h-12 border-b border-gray-200 bg-gray-50">
      <div className="flex h-full" style={{ width: `${TIMELINE_CONSTANTS.TIMELINE_WIDTH}px` }}>
        {hours.map((hour, index) => (
          <div 
            key={hour} 
            className="flex-1 flex items-center justify-center border-r border-gray-200 text-sm font-medium text-gray-600"
          >
            {hour}:00
          </div>
        ))}
        <div className="flex-1 flex items-center justify-center text-sm font-medium text-gray-600">
          {TIMELINE_CONSTANTS.END_HOUR}:00
        </div>
      </div>
      
      {/* Current time indicator */}
      {currentTimePosition !== null && (
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-50"
          style={{ left: `${currentTimePosition}%` }}
        >
          <div className="absolute -top-2 -left-8 bg-red-500 text-white text-xs px-2 py-1 rounded z-50">
            {currentTime.getHours().toString().padStart(2, '0')}:{currentTime.getMinutes().toString().padStart(2, '0')}
          </div>
        </div>
      )}
    </div>
  );
};

// Timeline header showing hours (for fixed layout - without scroll control)
const FixedTimelineHeader: React.FC = () => {
  return (
    <div className="relative h-12 bg-gray-50 border-b border-gray-200" style={{ width: `${TIMELINE_CONSTANTS.TIMELINE_WIDTH}px` }}>
      {/* Grid lines for each hour */}
      <div className="relative h-full" style={{ width: `${TIMELINE_CONSTANTS.TIMELINE_WIDTH}px` }}>
        {/* Hour divider lines (25개: 0시부터 24시까지) */}
        {Array.from({ length: TIMELINE_CONSTANTS.TOTAL_HOURS + 1 }, (_, i) => {
          const hour = TIMELINE_CONSTANTS.START_HOUR + i;
          const position = (i / TIMELINE_CONSTANTS.TOTAL_HOURS) * TIMELINE_CONSTANTS.TIMELINE_WIDTH;
          
          return (
            <div
              key={`line-${hour}`}
              className="absolute top-0 bottom-0 border-r border-gray-200"
              style={{ left: `${position}px` }}
            />
          );
        })}
        
        {/* Hour labels (24개: 0:00부터 23:00까지만, 24:00 레이블 제외) */}
        {Array.from({ length: TIMELINE_CONSTANTS.TOTAL_HOURS }, (_, i) => {
          const hour = TIMELINE_CONSTANTS.START_HOUR + i;
          const displayHour = hour;
          const position = (i / TIMELINE_CONSTANTS.TOTAL_HOURS) * TIMELINE_CONSTANTS.TIMELINE_WIDTH;
          
          return (
            <div 
              key={`label-${hour}`} 
              className="absolute flex flex-col items-center justify-center text-sm font-medium text-gray-600"
              style={{ 
                left: `${position}px`,
                top: '0',
                height: '100%',
                transform: 'translateX(-50%)' // 모든 레이블 중앙 정렬
              }}
            >
              <span>
                {displayHour.toString().padStart(2, '0')}:00
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Simplified hook for auto-scroll functionality (removed to prevent conflicts)
interface UseAutoScrollOptions {
  headerScrollRef: React.RefObject<HTMLDivElement>;
  contentScrollRef: React.RefObject<HTMLDivElement>;
}

const useAutoScroll = ({ headerScrollRef, contentScrollRef }: UseAutoScrollOptions) => {
  // Simplified - no longer implements auto-scroll to prevent conflicts
  // Auto-scroll is now handled directly in FixedLayout component
};

// Study time bar component
interface StudyTimeBarProps {
  assignedTimes: AssignedStudyTime[];
  actualTimes: ConnectedActualStudyTime[];
  unassignedTimes: UnassignedActualStudyTime[];
  className?: string;
}

const StudyTimeBar: React.FC<StudyTimeBarProps> = React.memo(({ 
  assignedTimes, 
  actualTimes, 
  unassignedTimes, 
  className
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const selectedDate = useSelectedDate(); // Use context instead of prop
  
  // Check if there are any ongoing sessions
  const hasOngoingSessions = actualTimes.some(actual => !actual.endTime) || 
                            unassignedTimes.some(unassigned => !unassigned.endTime);
  
  // Debug logging for ongoing sessions
  useEffect(() => {
    console.log('📊 StudyTimeBar render data:', {
      hasOngoingSessions,
      selectedDate,
      actualTimes: actualTimes.map(actual => ({
        id: actual.actualStudyTimeId,
        startTime: actual.startTime,
        endTime: actual.endTime,
        isOngoing: !actual.endTime
      })),
      unassignedTimes: unassignedTimes.map(unassigned => ({
        id: unassigned.actualStudyTimeId,
        startTime: unassigned.startTime,
        endTime: unassigned.endTime,
        isOngoing: !unassigned.endTime
      }))
    });
  }, [hasOngoingSessions, actualTimes, unassignedTimes, selectedDate]);
  
  // Update current time - frequent for ongoing sessions, slower otherwise
  useEffect(() => {
    const updateInterval = hasOngoingSessions ? 5000 : 30000; // 5s for ongoing for precise tracking, 30s otherwise
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);
    
    return () => clearInterval(interval);
  }, [hasOngoingSessions]); // Re-create interval when ongoing session status changes

  const getTimePosition = useCallback((timeStr: string) => {
    // Parse UTC time and convert to Korean time
    const utcTime = new Date(timeStr);
    const koreanTime = new Date(utcTime.getTime() + (9 * 60 * 60 * 1000));
    
    // Get hour in Korean timezone
    let hour = koreanTime.getUTCHours() + koreanTime.getUTCMinutes() / 60 + koreanTime.getUTCSeconds() / 3600;
    
    // Handle the 24-hour timeline (00:00 - 24:00)
    const startHour = TIMELINE_CONSTANTS.START_HOUR; // 0
    const endHour = TIMELINE_CONSTANTS.END_HOUR; // 24
    
    // Use selectedDate if provided, otherwise fall back to today
    let baseDate: string;
    if (selectedDate) {
      baseDate = selectedDate;
    } else {
      const today = new Date();
      const koreanToday = new Date(today.getTime() + (9 * 60 * 60 * 1000));
      baseDate = koreanToday.toISOString().split('T')[0];
    }
    
    const timeKoreanDateStr = koreanTime.toISOString().split('T')[0];
    
    // If the time is not on the selected date, don't show it
    if (timeKoreanDateStr !== baseDate) {
      return -1; // Return -1 to indicate out of range
    }
    
    if (hour < startHour) return 0;
    if (hour >= endHour) return 100;
    
    const percentage = ((hour - startHour) / (endHour - startHour)) * 100;
    return percentage;
  }, [selectedDate]);

  const getTimeDuration = useCallback((startStr: string, endStr: string | null) => {
    // Parse times ensuring proper timezone handling
    const startUtc = new Date(startStr);
    const startKorean = new Date(startUtc.getTime() + (9 * 60 * 60 * 1000));
    
    const endUtc = endStr ? new Date(endStr) : new Date();
    const endKorean = new Date(endUtc.getTime() + (9 * 60 * 60 * 1000));
    
    // Use selectedDate if provided, otherwise fall back to today
    let baseDate: string;
    if (selectedDate) {
      baseDate = selectedDate;
    } else {
      const today = new Date();
      const koreanToday = new Date(today.getTime() + (9 * 60 * 60 * 1000));
      baseDate = koreanToday.toISOString().split('T')[0];
    }
    
    // Calculate positions using the same logic as getTimePosition
    const startPosition = (() => {
      let hour = startKorean.getUTCHours() + startKorean.getUTCMinutes() / 60 + startKorean.getUTCSeconds() / 3600;
      const startDateStr = startKorean.toISOString().split('T')[0];
      
      // If start time is not on the selected date, return -1
      if (startDateStr !== baseDate) {
        return -1;
      }
      
      return hour;
    })();
    
    const endPosition = (() => {
      let hour = endKorean.getUTCHours() + endKorean.getUTCMinutes() / 60 + endKorean.getUTCSeconds() / 3600;
      const endDateStr = endKorean.toISOString().split('T')[0];
      
      // If end time is not on the selected date, clamp to end of day
      if (endDateStr !== baseDate) {
        return 24; // End of the selected day
      }
      
      return hour;
    })();
    
    // If start position is out of range, don't show this item
    if (startPosition < 0) {
      return 0;
    }
    
    const startHour = TIMELINE_CONSTANTS.START_HOUR;
    const totalHours = TIMELINE_CONSTANTS.TOTAL_HOURS;
    
    let duration = Math.max(0, (endPosition - startPosition) / totalHours) * 100;
    
    // For ongoing sessions, ensure minimum width
    if (!endStr) {
      duration = Math.max(duration, 0.2); // Minimum 0.2% width for visibility
    }
    
    return Math.min(duration, 100);
  }, [selectedDate, currentTime]);

  return (
    <div className={cn("relative h-8 my-3", className)} style={{ width: `${TIMELINE_CONSTANTS.TIMELINE_WIDTH}px` }}>
      {/* Assigned study times (light blue background) */}
      {assignedTimes.map((assigned) => {
        const position = getTimePosition(assigned.startTime);
        const duration = getTimeDuration(assigned.startTime, assigned.endTime);
        
        // Don't render if position is out of range
        if (position < 0 || duration <= 0) return null;
        
        return (
          <div
            key={assigned.assignedStudyTimeId}
            className="absolute h-full bg-gray-200 border border-gray-300 rounded"
            style={{
              left: `${(position / 100) * TIMELINE_CONSTANTS.TIMELINE_WIDTH}px`,
              width: `${(duration / 100) * TIMELINE_CONSTANTS.TIMELINE_WIDTH}px`,
            }}
            title={`${assigned.title}: ${formatKoreanTime(assigned.startTime, 'HH:mm')} - ${formatKoreanTime(assigned.endTime, 'HH:mm')}`}
          />
        );
      })}
      
      {/* Connected actual study times (dark blue) */}
      {actualTimes.map((actual) => {
        const position = getTimePosition(actual.startTime);
        const duration = getTimeDuration(actual.startTime, actual.endTime);
        
        // Don't render if position is out of range
        if (position < 0 || duration <= 0) return null;
        
        return (
          <div
            key={actual.actualStudyTimeId}
            className="absolute h-full bg-green-500 rounded z-10"
            style={{
              left: `${(position / 100) * TIMELINE_CONSTANTS.TIMELINE_WIDTH}px`,
              width: `${(duration / 100) * TIMELINE_CONSTANTS.TIMELINE_WIDTH}px`,
            }}
            title={`실제 접속: ${formatKoreanTime(actual.startTime, 'HH:mm')} - ${formatKoreanTime(actual.endTime, 'HH:mm')}`}
          />
        );
      })}
      
      {/* Unassigned actual study times (orange) */}
      {unassignedTimes.map((unassigned) => {
        const position = getTimePosition(unassigned.startTime);
        const duration = getTimeDuration(unassigned.startTime, unassigned.endTime);
        
        // Don't render if position is out of range
        if (position < 0 || duration <= 0) return null;
        
        return (
          <div
            key={unassigned.actualStudyTimeId}
            className="absolute h-full bg-green-200 rounded z-10"
            style={{
              left: `${(position / 100) * TIMELINE_CONSTANTS.TIMELINE_WIDTH}px`,
              width: `${(duration / 100) * TIMELINE_CONSTANTS.TIMELINE_WIDTH}px`,
            }}
            title={`미할당 시간 추가 접속: ${formatKoreanTime(unassigned.startTime, 'HH:mm')} - ${formatKoreanTime(unassigned.endTime, 'HH:mm')}`}
          />
        );
      })}
    </div>
  );
});

StudyTimeBar.displayName = 'StudyTimeBar';

export { Timeline, TimelineHeader, StudyTimeBar, FixedTimelineHeader, useAutoScroll }; 