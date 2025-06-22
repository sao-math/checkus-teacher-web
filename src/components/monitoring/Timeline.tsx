import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { AssignedStudyTime, ConnectedActualStudyTime, UnassignedActualStudyTime } from '@/types/monitoring';
import { formatKoreanTime, formatKoreanTimeRange } from '@/utils/dateUtils';

// Timeline layout constants (shared with FixedLayout)
const TIMELINE_CONSTANTS = {
  STUDENT_NAME_WIDTH: 140, // w-35 = 140px (기존 192px에서 줄임)
  TIMELINE_WIDTH: 2400, // 30시간 * 80px = 2400px (기존 1800px에서 확장)
  START_HOUR: 0, // 0시부터 시작 (기존 6시)
  END_HOUR: 30, // 30시까지 (다음날 6시)
  TOTAL_HOURS: 30 // 30시간
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
    <div className="relative h-12 bg-gray-50" style={{ width: `${TIMELINE_CONSTANTS.TIMELINE_WIDTH}px` }}>
      {/* Grid lines for each hour */}
      <div className="flex h-full">
        {Array.from({ length: TIMELINE_CONSTANTS.TOTAL_HOURS }, (_, i) => {
          const hour = TIMELINE_CONSTANTS.START_HOUR + i;
          const displayHour = hour >= 24 ? hour - 24 : hour; // 24시 이후는 다음날로 표시
          const isNextDay = hour >= 24;
          
          return (
            <div 
              key={hour} 
              className="flex-1 flex flex-col items-center justify-center border-r border-gray-200 text-sm font-medium text-gray-600 min-w-[80px]"
            >
              <span className={isNextDay ? 'text-blue-600' : ''}>
                {displayHour.toString().padStart(2, '0')}:00
              </span>
              {isNextDay && (
                <span className="text-xs text-blue-500">+1일</span>
              )}
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
  
  // Check if there are any ongoing sessions
  const hasOngoingSessions = actualTimes.some(actual => !actual.endTime) || 
                            unassignedTimes.some(unassigned => !unassigned.endTime);
  
  // Debug logging for ongoing sessions
  useEffect(() => {
    console.log('📊 StudyTimeBar render data:', {
      hasOngoingSessions,
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
  }, [hasOngoingSessions, actualTimes, unassignedTimes]);
  
  // Update current time - frequent for ongoing sessions, slower otherwise
  useEffect(() => {
    const updateInterval = hasOngoingSessions ? 5000 : 30000; // 5s for ongoing for precise tracking, 30s otherwise
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);
    
    return () => clearInterval(interval);
  }, [hasOngoingSessions]); // Re-create interval when ongoing session status changes

  const getTimePosition = useCallback((timeStr: string) => {
    // Parse as UTC and convert to local time properly
    const time = new Date(timeStr);
    const hour = time.getHours() + time.getMinutes() / 60 + time.getSeconds() / 3600;
    // Fixed to match header timeline: 6:00-24:00 (18 hours)
    const startHour = TIMELINE_CONSTANTS.START_HOUR;
    const endHour = TIMELINE_CONSTANTS.END_HOUR;
    
    if (hour < startHour) return 0;
    if (hour >= endHour) return 100;
    
    const percentage = ((hour - startHour) / (endHour - startHour)) * 100;
    
    return percentage;
  }, []);

  const getTimeDuration = useCallback((startStr: string, endStr: string | null) => {
    // Parse times ensuring proper timezone handling
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : new Date(); // Use fresh current time for ongoing sessions
    
    const startHour = start.getHours() + start.getMinutes() / 60 + start.getSeconds() / 3600;
    const endHour = end.getHours() + end.getMinutes() / 60 + end.getSeconds() / 3600;
    // Fixed to match header timeline: 6:00-24:00 (18 hours)
    const timelineStartHour = TIMELINE_CONSTANTS.START_HOUR;
    const timelineEndHour = TIMELINE_CONSTANTS.END_HOUR;
    const totalHours = TIMELINE_CONSTANTS.TOTAL_HOURS;
    
    let duration = Math.max(0, (endHour - startHour) / totalHours) * 100;
    
    // For ongoing sessions, ensure minimum width and extend to current time
    if (!endStr) {
      const now = currentTime; // Use the same currentTime state for consistency
      const currentHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
      const currentDuration = Math.max(0, (currentHour - startHour) / totalHours) * 100;
      duration = Math.max(duration, currentDuration, 0.5); // Minimum 0.5% width for visibility
    }
    
    return Math.min(duration, 100);
  }, [currentTime]);

  return (
    <div className={cn("relative h-8 my-3", className)} style={{ width: `${TIMELINE_CONSTANTS.TIMELINE_WIDTH}px` }}>
      {/* Assigned study times (light blue background) */}
      {assignedTimes.map((assigned) => (
        <div
          key={assigned.assignedStudyTimeId}
          className="absolute h-full bg-gray-200 border border-gray-300 rounded"
          style={{
            left: `${(getTimePosition(assigned.startTime) / 100) * TIMELINE_CONSTANTS.TIMELINE_WIDTH}px`,
            width: `${(getTimeDuration(assigned.startTime, assigned.endTime) / 100) * TIMELINE_CONSTANTS.TIMELINE_WIDTH}px`,
          }}
          title={`${assigned.title}: ${formatKoreanTime(assigned.startTime, 'HH:mm')} - ${formatKoreanTime(assigned.endTime, 'HH:mm')}`}
        />
      ))}
      
      {/* Connected actual study times (dark blue) */}
      {actualTimes.map((actual) => (
        <div
          key={actual.actualStudyTimeId}
          className="absolute h-full bg-green-500 rounded z-10"
          style={{
            left: `${(getTimePosition(actual.startTime) / 100) * TIMELINE_CONSTANTS.TIMELINE_WIDTH}px`,
            width: `${(getTimeDuration(actual.startTime, actual.endTime) / 100) * TIMELINE_CONSTANTS.TIMELINE_WIDTH}px`,
          }}
          title={`실제 접속: ${formatKoreanTime(actual.startTime, 'HH:mm')} - ${formatKoreanTime(actual.endTime, 'HH:mm')}`}
        />
      ))}
      
      {/* Unassigned actual study times (orange) */}
      {unassignedTimes.map((unassigned) => (
        <div
          key={unassigned.actualStudyTimeId}
          className="absolute h-full bg-green-200 rounded z-10"
          style={{
            left: `${(getTimePosition(unassigned.startTime) / 100) * TIMELINE_CONSTANTS.TIMELINE_WIDTH}px`,
            width: `${(getTimeDuration(unassigned.startTime, unassigned.endTime) / 100) * TIMELINE_CONSTANTS.TIMELINE_WIDTH}px`,
          }}
          title={`미할당 시간 추가 접속: ${formatKoreanTime(unassigned.startTime, 'HH:mm')} - ${formatKoreanTime(unassigned.endTime, 'HH:mm')}`}
        />
      ))}
    </div>
  );
});

StudyTimeBar.displayName = 'StudyTimeBar';

export { Timeline, TimelineHeader, StudyTimeBar, FixedTimelineHeader, useAutoScroll }; 