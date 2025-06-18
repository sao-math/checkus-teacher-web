import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TimeRangePickerProps {
  startTime?: string; // "HH:mm" format
  endTime?: string; // "HH:mm" format
  onTimeChange: (startTime: string, endTime: string) => void;
  className?: string;
  disabled?: boolean;
}

const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  startTime = "09:00",
  endTime = "10:00",
  onTimeChange,
  className,
  disabled = false
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'start' | 'end' | 'range' | null>(null);
  const [dragStart, setDragStart] = useState<number>(0);

  // Convert time string to minutes from midnight
  const timeToMinutes = useCallback((time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }, []);

  // Convert minutes from midnight to time string
  const minutesToTime = useCallback((minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }, []);

  // Get position percentage from minutes
  const getPositionFromMinutes = useCallback((minutes: number): number => {
    return (minutes / (24 * 60)) * 100;
  }, []);

  // Get minutes from mouse position
  const getMinutesFromPosition = useCallback((clientX: number): number => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const minutes = Math.round(percentage * 24 * 60 / 15) * 15; // Snap to 15-minute intervals
    return Math.min(Math.max(0, minutes), 24 * 60 - 15);
  }, []);

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'start' | 'end' | 'range') => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    setDragType(type);
    setDragStart(e.clientX);
  }, [disabled]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragType || disabled) return;

    const newMinutes = getMinutesFromPosition(e.clientX);

    if (dragType === 'start') {
      const newStart = Math.min(newMinutes, endMinutes - 15);
      onTimeChange(minutesToTime(newStart), endTime);
    } else if (dragType === 'end') {
      const newEnd = Math.max(newMinutes, startMinutes + 15);
      onTimeChange(startTime, minutesToTime(newEnd));
    } else if (dragType === 'range') {
      const deltaX = e.clientX - dragStart;
      const deltaMinutes = Math.round((deltaX / (barRef.current?.getBoundingClientRect().width || 1)) * 24 * 60 / 15) * 15;
      
      const duration = endMinutes - startMinutes;
      let newStartMinutes = startMinutes + deltaMinutes;
      let newEndMinutes = endMinutes + deltaMinutes;

      // Keep within bounds
      if (newStartMinutes < 0) {
        newStartMinutes = 0;
        newEndMinutes = duration;
      } else if (newEndMinutes > 24 * 60) {
        newEndMinutes = 24 * 60;
        newStartMinutes = 24 * 60 - duration;
      }

      onTimeChange(minutesToTime(newStartMinutes), minutesToTime(newEndMinutes));
      setDragStart(e.clientX);
    }
  }, [isDragging, dragType, disabled, getMinutesFromPosition, startMinutes, endMinutes, onTimeChange, minutesToTime, startTime, endTime, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleBarClick = useCallback((e: React.MouseEvent) => {
    if (disabled || isDragging) return;
    
    const newMinutes = getMinutesFromPosition(e.clientX);
    const midPoint = (startMinutes + endMinutes) / 2;
    
    if (newMinutes < midPoint) {
      // Clicked closer to start, adjust start time
      const newStart = Math.min(newMinutes, endMinutes - 15);
      onTimeChange(minutesToTime(newStart), endTime);
    } else {
      // Clicked closer to end, adjust end time
      const newEnd = Math.max(newMinutes, startMinutes + 15);
      onTimeChange(startTime, minutesToTime(newEnd));
    }
  }, [disabled, isDragging, getMinutesFromPosition, startMinutes, endMinutes, minutesToTime, onTimeChange, startTime, endTime]);

  // Generate hour markers
  const hourMarkers = Array.from({ length: 25 }, (_, i) => i);

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Time display */}
      <div className="flex justify-between items-center text-sm font-medium">
        <span className="text-blue-600">{startTime}</span>
        <span className="text-gray-500">
          {Math.round((endMinutes - startMinutes) / 60 * 10) / 10}시간
        </span>
        <span className="text-blue-600">{endTime}</span>
      </div>

      {/* Time bar container */}
      <div className="relative">
        {/* Hour markers */}
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          {[0, 6, 12, 18, 24].map(hour => (
            <span key={hour} className="w-8 text-center">
              {hour === 24 ? '24:00' : `${hour}:00`}
            </span>
          ))}
        </div>

        {/* Main time bar */}
        <div
          ref={barRef}
          className={cn(
            "relative h-12 bg-gray-100 rounded-lg border-2 border-gray-200 cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleBarClick}
        >
          {/* Hour grid lines */}
          {hourMarkers.slice(1, -1).map(hour => (
            <div
              key={hour}
              className="absolute top-0 bottom-0 w-px bg-gray-300"
              style={{ left: `${(hour / 24) * 100}%` }}
            />
          ))}

          {/* Selected time range */}
          <div
            className={cn(
              "absolute top-1 bottom-1 bg-blue-500 rounded cursor-move transition-colors",
              isDragging && dragType === 'range' && "bg-blue-600"
            )}
            style={{
              left: `${getPositionFromMinutes(startMinutes)}%`,
              width: `${getPositionFromMinutes(endMinutes - startMinutes)}%`,
            }}
            onMouseDown={(e) => handleMouseDown(e, 'range')}
          />

          {/* Start time handle */}
          <div
            className={cn(
              "absolute top-0 bottom-0 w-3 bg-blue-600 rounded-l cursor-ew-resize flex items-center justify-center transition-colors",
              isDragging && dragType === 'start' && "bg-blue-700"
            )}
            style={{ left: `calc(${getPositionFromMinutes(startMinutes)}% - 6px)` }}
            onMouseDown={(e) => handleMouseDown(e, 'start')}
          >
            <div className="w-1 h-6 bg-white rounded" />
          </div>

          {/* End time handle */}
          <div
            className={cn(
              "absolute top-0 bottom-0 w-3 bg-blue-600 rounded-r cursor-ew-resize flex items-center justify-center transition-colors",
              isDragging && dragType === 'end' && "bg-blue-700"
            )}
            style={{ left: `calc(${getPositionFromMinutes(endMinutes)}% - 6px)` }}
            onMouseDown={(e) => handleMouseDown(e, 'end')}
          >
            <div className="w-1 h-6 bg-white rounded" />
          </div>
        </div>

        {/* Time labels on bar */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          {hourMarkers.filter((_, i) => i % 4 === 0).map(hour => (
            <span key={hour} className="w-8 text-center">
              {hour}
            </span>
          ))}
        </div>
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: '30분', duration: 30 },
          { label: '1시간', duration: 60 },
          { label: '1.5시간', duration: 90 },
          { label: '2시간', duration: 120 },
          { label: '3시간', duration: 180 },
        ].map(preset => (
          <button
            key={preset.label}
            type="button"
            disabled={disabled}
            onClick={() => {
              const newEndMinutes = startMinutes + preset.duration;
              if (newEndMinutes <= 24 * 60) {
                onTimeChange(startTime, minutesToTime(newEndMinutes));
              }
            }}
            className={cn(
              "px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border transition-colors",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeRangePicker; 