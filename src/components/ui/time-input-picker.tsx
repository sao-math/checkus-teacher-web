import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TimeInputPickerProps {
  startTime?: string; // "HH:mm" format
  endTime?: string; // "HH:mm" format
  onTimeChange: (startTime: string, endTime: string) => void;
  className?: string;
  disabled?: boolean;
}

const TimeInputPicker: React.FC<TimeInputPickerProps> = ({
  startTime = "09:00",
  endTime = "10:00",
  onTimeChange,
  className,
  disabled = false
}) => {
  const [localStartTime, setLocalStartTime] = useState(startTime);
  const [localEndTime, setLocalEndTime] = useState(endTime);
  const [error, setError] = useState<string | null>(null);

  // Update local state when props change
  useEffect(() => {
    setLocalStartTime(startTime);
    setLocalEndTime(endTime);
  }, [startTime, endTime]);

  // Calculate duration in hours and minutes
  const calculateDuration = (start: string, end: string): string => {
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    let endTotalMinutes = endHours * 60 + endMinutes;
    
    // Handle next day scenario (e.g., 23:00 to 01:00)
    if (endTotalMinutes <= startTotalMinutes) {
      endTotalMinutes += 24 * 60;
    }
    
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours === 0) {
      return `${minutes}분`;
    } else if (minutes === 0) {
      return `${hours}시간`;
    } else {
      return `${hours}시간 ${minutes}분`;
    }
  };

  // Validate time range
  const validateTimeRange = (start: string, end: string): string | null => {
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    let endTotalMinutes = endHours * 60 + endMinutes;
    
    // Handle next day scenario
    if (endTotalMinutes <= startTotalMinutes) {
      endTotalMinutes += 24 * 60;
    }
    
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    
    if (durationMinutes < 1) {
      return '종료 시간은 시작 시간보다 늦어야 합니다.';
    }
    
    if (durationMinutes > 12 * 60) {
      return '12시간을 초과할 수 없습니다.';
    }
    
    return null;
  };

  const handleStartTimeChange = (value: string) => {
    setLocalStartTime(value);
    const validationError = validateTimeRange(value, localEndTime);
    setError(validationError);
    
    if (!validationError) {
      onTimeChange(value, localEndTime);
    }
  };

  const handleEndTimeChange = (value: string) => {
    setLocalEndTime(value);
    const validationError = validateTimeRange(localStartTime, value);
    setError(validationError);
    
    if (!validationError) {
      onTimeChange(localStartTime, value);
    }
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Time Input Fields */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="start-time" className="text-sm font-medium whitespace-nowrap">
            시작 시간
          </Label>
          <Input
            id="start-time"
            type="time"
            value={localStartTime}
            onChange={(e) => handleStartTimeChange(e.target.value)}
            disabled={disabled}
            className={cn(
              "w-auto",
              error && "border-red-500 focus:border-red-500"
            )}
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="end-time" className="text-sm font-medium whitespace-nowrap">
            종료 시간
          </Label>
          <Input
            id="end-time"
            type="time"
            value={localEndTime}
            onChange={(e) => handleEndTimeChange(e.target.value)}
            disabled={disabled}
            className={cn(
              "w-auto",
              error && "border-red-500 focus:border-red-500"
            )}
          />
        </div>
      </div>

      {/* Duration Display */}
      <div className="flex justify-center">
        <div className={cn(
          "px-3 py-2 bg-gray-50 rounded-lg border text-sm font-medium",
          error ? "text-red-600 bg-red-50 border-red-200" : "text-gray-700"
        )}>
          {error || `총 시간: ${calculateDuration(localStartTime, localEndTime)}`}
        </div>
      </div>
    </div>
  );
};

export default TimeInputPicker; 