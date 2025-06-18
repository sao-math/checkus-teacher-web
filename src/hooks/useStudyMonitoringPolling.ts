import { useState, useEffect, useRef, useCallback } from 'react';
import { studyMonitoringApi } from '@/services/studyMonitoringApi';
import { StudyMonitoringData } from '@/types/study-monitoring';

interface UseStudyMonitoringPollingResult {
  data: StudyMonitoringData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  isPolling: boolean;
}

export const useStudyMonitoringPolling = (
  timeFilter: 'current' | 'today' = 'current',
  pollingInterval: number = 30000 // 30 seconds
): UseStudyMonitoringPollingResult => {
  const [data, setData] = useState<StudyMonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const lastModifiedRef = useRef<string | undefined>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const baseBackoffDelay = 1000; // 1 second

  const fetchData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) {
        setLoading(true);
      }
      setError(null);

      const response = await studyMonitoringApi.getCurrentMonitoring(
        timeFilter,
        lastModifiedRef.current
      );

      setData(response.data);
      lastModifiedRef.current = response.data.lastModified;
      setLastUpdated(new Date());
      retryCountRef.current = 0; // Reset retry count on success
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'NOT_MODIFIED') {
          // Data hasn't changed, this is not an error
          return;
        }
        
        setError(err.message);
        retryCountRef.current++;
      } else {
        setError('An unexpected error occurred');
        retryCountRef.current++;
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  }, [timeFilter]);

  const scheduleNextPoll = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    let delay = pollingInterval;
    
    // Apply exponential backoff if there were errors
    if (retryCountRef.current > 0) {
      delay = Math.min(
        baseBackoffDelay * Math.pow(2, retryCountRef.current - 1),
        pollingInterval
      );
    }

    timeoutRef.current = setTimeout(async () => {
      if (!document.hidden && retryCountRef.current < maxRetries) {
        await fetchData(true);
      }
      scheduleNextPoll();
    }, delay);
  }, [pollingInterval, fetchData, maxRetries]);

  const startPolling = useCallback(() => {
    setIsPolling(true);
    scheduleNextPoll();
  }, [scheduleNextPoll]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const refresh = useCallback(async () => {
    retryCountRef.current = 0; // Reset retry count on manual refresh
    await fetchData(false);
  }, [fetchData]);

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
        // Refresh data when page becomes visible again
        refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startPolling, stopPolling, refresh]);

  // Initial data fetch and start polling
  useEffect(() => {
    fetchData(false).then(() => {
      if (!document.hidden) {
        startPolling();
      }
    });

    return () => {
      stopPolling();
    };
  }, [fetchData, startPolling, stopPolling]);

  // Handle time filter change
  useEffect(() => {
    lastModifiedRef.current = undefined; // Reset last modified on filter change
    retryCountRef.current = 0; // Reset retry count
    refresh();
  }, [timeFilter, refresh]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    isPolling
  };
}; 