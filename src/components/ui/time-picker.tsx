import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TimePickerProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onError?: (hasError: boolean, message?: string) => void;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  onError,
  className = ''
}) => {
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    onStartTimeChange(newStartTime);
    
    // Auto-calculate end time if not set
    if (!endTime && newStartTime) {
      const [hours, minutes] = newStartTime.split(':').map(Number);
      const endTimeDate = new Date();
      endTimeDate.setHours(hours + 1, minutes); // Default to 1 hour duration
      const newEndTime = endTimeDate.toTimeString().slice(0, 5);
      onEndTimeChange(newEndTime);
    }
    
    // Validate time range
    if (endTime && newStartTime >= endTime) {
      onError?.(true, 'Start time must be before end time');
    } else {
      onError?.(false);
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    onEndTimeChange(newEndTime);
    
    // Validate time range
    if (startTime && startTime >= newEndTime) {
      onError?.(true, 'End time must be after start time');
    } else {
      onError?.(false);
    }
  };

  const setPresetTime = (presetStartTime: string) => {
    onStartTimeChange(presetStartTime);
    const [hours, minutes] = presetStartTime.split(':').map(Number);
    const endTimeDate = new Date();
    endTimeDate.setHours(hours + 1, minutes);
    const newEndTime = endTimeDate.toTimeString().slice(0, 5);
    onEndTimeChange(newEndTime);
    onError?.(false);
  };

  const addDuration = (minutes: number) => {
    if (!startTime) return;
    
    const [hours, mins] = startTime.split(':').map(Number);
    const endTimeDate = new Date();
    endTimeDate.setHours(hours, mins + minutes);
    const newEndTime = endTimeDate.toTimeString().slice(0, 5);
    onEndTimeChange(newEndTime);
    onError?.(false);
  };

  const calculateDuration = () => {
    if (startTime && endTime) {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      const durationMinutes = endTotalMinutes - startTotalMinutes;
      
      if (durationMinutes > 0) {
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}min` : ''}`;
      }
    }
    return null;
  };

  const duration = calculateDuration();
  const hasError = startTime && endTime && startTime >= endTime;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Start Time */}
      <div className="space-y-2">
        <Label>Start Time</Label>
        <Input 
          type="time" 
          value={startTime}
          onChange={handleStartTimeChange}
        />
        {/* Preset time buttons */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: '9:00', value: '09:00' },
            { label: '13:00', value: '13:00' },
            { label: '14:00', value: '14:00' },
            { label: '19:00', value: '19:00' },
            { label: '20:00', value: '20:00' }
          ].map(preset => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setPresetTime(preset.value)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* End Time */}
      <div className="space-y-2">
        <Label>End Time</Label>
        <Input 
          type="time" 
          value={endTime}
          onChange={handleEndTimeChange}
        />
        {/* Duration presets */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: '+30min', minutes: 30 },
            { label: '+1hr', minutes: 60 },
            { label: '+1.5hr', minutes: 90 },
            { label: '+2hr', minutes: 120 }
          ].map(duration => (
            <button
              key={duration.minutes}
              type="button"
              onClick={() => addDuration(duration.minutes)}
              className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded"
              disabled={!startTime}
            >
              {duration.label}
            </button>
          ))}
        </div>
        
        {/* Duration display and validation */}
        {duration && !hasError && (
          <div className="text-xs text-gray-600">
            Duration: {duration}
          </div>
        )}
        {hasError && (
          <div className="text-xs text-red-600">
            ⚠️ End time must be after start time
          </div>
        )}
      </div>
    </div>
  );
}; 