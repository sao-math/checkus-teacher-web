import { format } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

// Korean timezone
export const KOREAN_TIMEZONE = 'Asia/Seoul';

/**
 * Format local date and time for server requests (YYYY-MM-DDTHH:mm:ss)
 * This function converts local time to UTC before formatting
 */
export const formatLocalDateTime = (date: Date, hours: number, minutes: number): string => {
  // Create local datetime in Korean timezone
  const localDateTime = new Date(date);
  localDateTime.setHours(hours, minutes, 0, 0);
  
  // Convert to UTC for server
  return convertKoreanToUtc(localDateTime.toISOString());
};

/**
 * Create UTC ISO string from local date and time components
 * Use this when sending datetime to server
 */
export const createUtcDateTime = (date: Date, timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const localDateTime = new Date(date);
  localDateTime.setHours(hours, minutes, 0, 0);
  
  // Convert Korean local time to UTC
  const utcDate = fromZonedTime(localDateTime, KOREAN_TIMEZONE);
  return utcDate.toISOString();
};

/**
 * Convert Date object to UTC ISO string for server requests
 * Use this for date range queries
 */
export const toUtcIsoString = (date: Date): string => {
  // If it's already a date boundary (start/end of day), convert from Korean timezone
  const utcDate = fromZonedTime(date, KOREAN_TIMEZONE);
  return utcDate.toISOString();
};

/**
 * Convert Date objects that are already in local time to UTC for server
 * Use this when the Date object represents local time that needs to be sent to server
 */
export const convertLocalDateToUtc = (localDate: Date): string => {
  const utcDate = fromZonedTime(localDate, KOREAN_TIMEZONE);
  return utcDate.toISOString();
};

/**
 * Check if the given date string appears to already be in Korean timezone
 */
const isAlreadyKoreanTime = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  const koreanOffset = 9 * 60; // Korea is UTC+9
  const actualOffset = -date.getTimezoneOffset(); // getTimezoneOffset returns negative for positive offsets
  
  // If the string contains timezone info or the offset suggests it's already in Korean time
  return dateString.includes('+09:00') || dateString.includes('+0900') || 
         (Math.abs(actualOffset - koreanOffset) < 60); // Allow some tolerance
};

/**
 * Convert UTC time string to Korean local time and format it
 */
export const formatKoreanTime = (utcTimeString: string, formatPattern: string = 'HH:mm'): string => {
  if (!utcTimeString) return '';
  
  try {
    const date = new Date(utcTimeString);
    
    // Check if the date is invalid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', utcTimeString);
      return '';
    }
    
    // If the time appears to already be in Korean timezone, use it directly
    if (isAlreadyKoreanTime(utcTimeString)) {
      return format(date, formatPattern);
    }
    
    // Otherwise, convert UTC to Korean time
    const koreanDate = toZonedTime(date, KOREAN_TIMEZONE);
    return format(koreanDate, formatPattern);
  } catch (error) {
    console.error('Error formatting Korean time:', error, 'Input:', utcTimeString);
    // Fallback to basic formatting
    try {
      return format(new Date(utcTimeString), formatPattern);
    } catch (fallbackError) {
      console.error('Fallback formatting also failed:', fallbackError);
      return '';
    }
  }
};

/**
 * Convert Korean local time to UTC for sending to server
 */
export const convertKoreanToUtc = (localTimeString: string): string => {
  try {
    const localDate = new Date(localTimeString);
    
    if (isNaN(localDate.getTime())) {
      console.warn('Invalid date string for conversion:', localTimeString);
      return new Date().toISOString(); // Return current time as fallback
    }
    
    const utcDate = fromZonedTime(localDate, KOREAN_TIMEZONE);
    return utcDate.toISOString();
  } catch (error) {
    console.error('Error converting Korean time to UTC:', error);
    return new Date(localTimeString).toISOString();
  }
};

/**
 * Format time range in Korean timezone
 */
export const formatKoreanTimeRange = (startTime: string, endTime: string): string => {
  const start = formatKoreanTime(startTime, 'HH:mm');
  const end = formatKoreanTime(endTime, 'HH:mm');
  
  // If either time failed to format, return empty string
  if (!start || !end) {
    return '';
  }
  
  return `${start} - ${end}`;
};

/**
 * Format date and time in Korean timezone
 */
export const formatKoreanDateTime = (dateTimeString: string, formatPattern: string = 'yyyy-MM-dd HH:mm'): string => {
  return formatKoreanTime(dateTimeString, formatPattern);
}; 