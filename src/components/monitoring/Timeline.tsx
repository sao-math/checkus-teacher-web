import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { AssignedStudyTime, ConnectedActualStudyTime, UnassignedActualStudyTime } from '@/types/monitoring';

interface TimelineProps {
  children: React.ReactNode;
  className?: string;
}

const Timeline: React.FC<TimelineProps> = ({ children, className }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isInitialized, setIsInitialized] = useState(false);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to show current time at 30% from left
  useEffect(() => {
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
  }, [currentTime, isInitialized]);

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
  const hours = Array.from({ length: 9 }, (_, i) => 13 + i); // 13:00 to 21:00
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getCurrentTimePosition = () => {
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
    const startHour = 13;
    const endHour = 22;
    
    if (currentHour < startHour || currentHour > endHour) return null;
    
    const progress = (currentHour - startHour) / (endHour - startHour);
    return progress * 100;
  };

  const currentTimePosition = getCurrentTimePosition();

  return (
    <div className="relative h-12 border-b border-gray-200 bg-gray-50">
      <div className="flex h-full" style={{ width: '1200px' }}>
        {hours.map((hour, index) => (
          <div 
            key={hour} 
            className="flex-1 flex items-center justify-center border-r border-gray-200 text-sm font-medium text-gray-600"
          >
            {hour}:00
          </div>
        ))}
        <div className="flex-1 flex items-center justify-center text-sm font-medium text-gray-600">
          22:00
        </div>
      </div>
      
      {/* Current time indicator */}
      {currentTimePosition !== null && (
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: `${currentTimePosition}%` }}
        >
          <div className="absolute -top-2 -left-8 bg-red-500 text-white text-xs px-2 py-1 rounded">
            {currentTime.getHours().toString().padStart(2, '0')}:{currentTime.getMinutes().toString().padStart(2, '0')}
          </div>
        </div>
      )}
    </div>
  );
};

// Timeline header showing hours (for fixed layout - without scroll control)
const FixedTimelineHeader: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const hours = Array.from({ length: 9 }, (_, i) => 13 + i); // 13:00 to 21:00

  const getCurrentTimePosition = () => {
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
    const startHour = 13;
    const endHour = 22;
    
    if (currentHour < startHour || currentHour > endHour) return null;
    
    const progress = (currentHour - startHour) / (endHour - startHour);
    return progress * 100;
  };

  const currentTimePosition = getCurrentTimePosition();

  return (
    <div className="relative h-12 bg-gray-50" style={{ width: '1200px' }}>
      <div className="flex h-full">
        {hours.map((hour, index) => (
          <div 
            key={hour} 
            className="flex-1 flex items-center justify-center border-r border-gray-200 text-sm font-medium text-gray-600"
          >
            {hour}:00
          </div>
        ))}
        <div className="flex-1 flex items-center justify-center text-sm font-medium text-gray-600">
          22:00
        </div>
      </div>
      
      {/* Current time indicator */}
      {currentTimePosition !== null && (
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: `${currentTimePosition}%` }}
        >
          <div className="absolute -top-2 -left-8 bg-red-500 text-white text-xs px-2 py-1 rounded">
            {currentTime.getHours().toString().padStart(2, '0')}:{currentTime.getMinutes().toString().padStart(2, '0')}
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for auto-scroll functionality
interface UseAutoScrollOptions {
  headerScrollRef: React.RefObject<HTMLDivElement>;
  contentScrollRef: React.RefObject<HTMLDivElement>;
}

const useAutoScroll = ({ headerScrollRef, contentScrollRef }: UseAutoScrollOptions) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isInitialized, setIsInitialized] = useState(false);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to show current time at 30% from left
  useEffect(() => {
    const container = contentScrollRef.current;
    if (container) {
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
  }, [currentTime, isInitialized, contentScrollRef]);

  // Initial scroll when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (contentScrollRef.current && !isInitialized) {
        setCurrentTime(new Date()); // Trigger scroll calculation
      }
    }, 100); // Small delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, [isInitialized, contentScrollRef]);
};

// Study time bar component
interface StudyTimeBarProps {
  assignedTimes: AssignedStudyTime[];
  actualTimes: ConnectedActualStudyTime[];
  unassignedTimes: UnassignedActualStudyTime[];
  className?: string;
}

const StudyTimeBar: React.FC<StudyTimeBarProps> = ({ 
  assignedTimes, 
  actualTimes, 
  unassignedTimes, 
  className 
}) => {
  const getTimePosition = (timeStr: string) => {
    const time = new Date(timeStr);
    const hour = time.getHours() + time.getMinutes() / 60;
    const startHour = 13;
    const endHour = 22;
    
    if (hour < startHour) return 0;
    if (hour > endHour) return 100;
    
    return ((hour - startHour) / (endHour - startHour)) * 100;
  };

  const getTimeDuration = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const totalHours = 22 - 13; // 9 hours total
    
    return ((endHour - startHour) / totalHours) * 100;
  };

  return (
    <div className={cn("relative h-8", className)}>
      {/* Assigned study times (light blue background) */}
      {assignedTimes.map((assigned) => (
        <div
          key={assigned.assignedStudyTimeId}
          className="absolute h-full bg-blue-200 border border-blue-300 rounded"
          style={{
            left: `${getTimePosition(assigned.startTime)}%`,
            width: `${getTimeDuration(assigned.startTime, assigned.endTime)}%`,
          }}
          title={`${assigned.title}: ${new Date(assigned.startTime).toLocaleTimeString()} - ${new Date(assigned.endTime).toLocaleTimeString()}`}
        />
      ))}
      
      {/* Connected actual study times (dark blue) */}
      {actualTimes.map((actual) => (
        <div
          key={actual.actualStudyTimeId}
          className="absolute h-full bg-blue-600 rounded z-10"
          style={{
            left: `${getTimePosition(actual.startTime)}%`,
            width: `${getTimeDuration(actual.startTime, actual.endTime)}%`,
          }}
          title={`실제 접속: ${new Date(actual.startTime).toLocaleTimeString()} - ${new Date(actual.endTime).toLocaleTimeString()}`}
        />
      ))}
      
      {/* Unassigned actual study times (orange) */}
      {unassignedTimes.map((unassigned) => (
        <div
          key={unassigned.actualStudyTimeId}
          className="absolute h-full bg-orange-500 rounded z-10"
          style={{
            left: `${getTimePosition(unassigned.startTime)}%`,
            width: `${getTimeDuration(unassigned.startTime, unassigned.endTime)}%`,
          }}
          title={`할당되지 않은 접속: ${new Date(unassigned.startTime).toLocaleTimeString()} - ${new Date(unassigned.endTime).toLocaleTimeString()}`}
        />
      ))}
    </div>
  );
};

export { Timeline, TimelineHeader, StudyTimeBar, FixedTimelineHeader, useAutoScroll }; 