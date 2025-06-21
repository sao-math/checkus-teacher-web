import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { AssignedStudyTime, ConnectedActualStudyTime, UnassignedActualStudyTime } from '@/types/monitoring';
import { formatKoreanTime, formatKoreanTimeRange } from '@/utils/dateUtils';

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
      
      const timelineWidth = 1200; // Fixed width from TimelineHeader
      
      // Calculate current time position (13:00 to 22:00 = 9 hours)
      const startHour = 13; // 1 PM
      const endHour = 22; // 10 PM
      const totalHours = endHour - startHour;
      const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
      
      // Calculate the pixel position of current time on the timeline
      let currentTimePixelPosition;
      
      if (currentHour < startHour) {
        // Before 1 PM - show beginning of timeline
        currentTimePixelPosition = 0;
      } else if (currentHour > endHour) {
        // After 10 PM - show end of timeline
        currentTimePixelPosition = timelineWidth;
      } else {
        // Between 1 PM and 10 PM - calculate exact position
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
  const hours = Array.from({ length: 18 }, (_, i) => 6 + i); // 6:00 to 23:00
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute instead of every second

    return () => clearInterval(interval);
  }, []);

  const getCurrentTimePosition = useCallback(() => {
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
    const startHour = 6;
    const endHour = 24;
    
    if (currentHour < startHour || currentHour >= endHour) return null;
    
    const progress = (currentHour - startHour) / (endHour - startHour);
    return progress * 100;
  }, [currentTime]);

  const currentTimePosition = getCurrentTimePosition();

  return (
    <div className="relative h-12 border-b border-gray-200 bg-gray-50">
      <div className="flex h-full" style={{ width: '1800px' }}>
        {hours.map((hour, index) => (
          <div 
            key={hour} 
            className="flex-1 flex items-center justify-center border-r border-gray-200 text-sm font-medium text-gray-600"
          >
            {hour}:00
          </div>
        ))}
        <div className="flex-1 flex items-center justify-center text-sm font-medium text-gray-600">
          24:00
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
    <div className="relative h-12 bg-gray-50" style={{ width: '1800px' }}>
      {/* Grid lines for each hour */}
      <div className="flex h-full">
        {Array.from({ length: 18 }, (_, i) => (
          <div 
            key={i} 
            className="flex-1 border-r border-gray-300"
          />
        ))}
      </div>
      
      {/* Time labels positioned exactly on tick marks */}
      {Array.from({ length: 19 }, (_, i) => {
        const hour = 6 + i; // 6:00 to 24:00
        return (
          <div 
            key={hour}
            className="absolute top-0 h-full flex items-center justify-center"
            style={{ 
              left: `${(i / 18) * 100}%`,
              transform: 'translateX(-50%)', // Center on the tick mark
              zIndex: 10
            }}
          >
            <span className="text-xs font-medium text-gray-600 bg-gray-50 px-1">
              {hour}:00
            </span>
          </div>
        );
      })}
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
  const getTimePosition = useCallback((timeStr: string) => {
    const time = new Date(timeStr);
    const hour = time.getHours() + time.getMinutes() / 60;
    const startHour = 6;
    const endHour = 24;
    
    if (hour < startHour) return 0;
    if (hour >= endHour) return 100;
    
    return ((hour - startHour) / (endHour - startHour)) * 100;
  }, []);

  const getTimeDuration = useCallback((startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const totalHours = 24 - 6; // 18 hours total
    
    return ((endHour - startHour) / totalHours) * 100;
  }, []);

  return (
    <div className={cn("relative h-8", className)}>
      {/* Assigned study times (light blue background) */}
      {assignedTimes.map((assigned) => (
        <div
          key={assigned.assignedStudyTimeId}
          className="absolute h-full bg-gray-200 border border-gray-300 rounded"
          style={{
            left: `${getTimePosition(assigned.startTime)}%`,
            width: `${getTimeDuration(assigned.startTime, assigned.endTime)}%`,
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
            left: `${getTimePosition(actual.startTime)}%`,
            width: `${getTimeDuration(actual.startTime, actual.endTime)}%`,
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
            left: `${getTimePosition(unassigned.startTime)}%`,
            width: `${getTimeDuration(unassigned.startTime, unassigned.endTime)}%`,
          }}
          title={`미할당 시간 추가 접속: ${formatKoreanTime(unassigned.startTime, 'HH:mm')} - ${formatKoreanTime(unassigned.endTime, 'HH:mm')}`}
        />
      ))}
    </div>
  );
});

StudyTimeBar.displayName = 'StudyTimeBar';

export { Timeline, TimelineHeader, StudyTimeBar, FixedTimelineHeader, useAutoScroll }; 