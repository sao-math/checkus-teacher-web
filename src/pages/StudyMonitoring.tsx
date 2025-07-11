import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MessageCircle, RefreshCw, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FixedLayout, FixedLayoutRef } from '@/components/monitoring/FixedLayout';
import { FixedTimelineHeader } from '@/components/monitoring/Timeline';
import StudentRow from '@/components/monitoring/StudentRow';
import { SendMessageDialog } from '@/components/monitoring/SendMessageDialog';
import monitoringApi from '@/services/monitoringApi';
import { MonitoringStudent } from '@/types/monitoring';
import { formatKoreanTime } from '@/utils/dateUtils';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Separate component for last refresh time to optimize re-rendering
const LastRefreshTime: React.FC<{ lastRefreshTime: Date | null }> = ({ lastRefreshTime }) => {
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Only update if the tab is visible
      if (!document.hidden) {
        forceUpdate({}); // Only re-render this component
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Force update immediately when lastRefreshTime changes
  useEffect(() => {
    if (lastRefreshTime) {
      forceUpdate({}); // Immediately update when lastRefreshTime changes
    }
  }, [lastRefreshTime]);

  const formatLastRefreshTime = (time: Date | null) => {
    if (!time) return null;
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}초 전`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours}시간 전`;
  };

  if (!lastRefreshTime) return null;

  return (
    <div className="text-sm text-gray-500">
      마지막 업데이트: {formatLastRefreshTime(lastRefreshTime)}
    </div>
  );
};

// 학생 정렬 유틸리티 함수들
const getNextStudyTime = (student: MonitoringStudent, currentTime: Date): Date | null => {
  const now = currentTime.getTime();
  
  let nextTime: Date | null = null;
  
  for (const assignedTime of student.assignedStudyTimes) {
    const startTime = new Date(assignedTime.startTime).getTime();
    
    // 아직 시작하지 않은 공부 시간만 고려
    if (startTime > now) {
      if (!nextTime || startTime < nextTime.getTime()) {
        nextTime = new Date(startTime);
      }
    }
  }
  
  return nextTime;
};

const getCurrentStudyTime = (student: MonitoringStudent, currentTime: Date): boolean => {
  const now = currentTime.getTime();
  
  for (const assignedTime of student.assignedStudyTimes) {
    const startTime = new Date(assignedTime.startTime).getTime();
    const endTime = new Date(assignedTime.endTime).getTime();
    
    // 현재 시간이 공부 시간 범위 내에 있는지 확인
    if (startTime <= now && now <= endTime) {
      return true;
    }
  }
  
  return false;
};

const getMinutesUntilNextStudy = (student: MonitoringStudent, currentTime: Date): number => {
  const nextTime = getNextStudyTime(student, currentTime);
  if (!nextTime) return Infinity; // 다음 공부 시간이 없으면 가장 뒤로
  
  return Math.floor((nextTime.getTime() - currentTime.getTime()) / (1000 * 60));
};

const getSortPriority = (student: MonitoringStudent, currentTime: Date): number => {
  const isCurrentlyStudying = getCurrentStudyTime(student, currentTime);
  const minutesUntilNext = getMinutesUntilNextStudy(student, currentTime);
  
  // 1순위: 현재 공부해야 하는데 결석인 학생 (가장 중요!)
  if (isCurrentlyStudying && student.status === 'ABSENT') {
    return 1;
  }
  
  // 2순위: 곧 공부해야 하는 학생 (30분 이내)
  if (minutesUntilNext <= 30 && minutesUntilNext !== Infinity) {
    return 2;
  }
  
  // 3순위: 현재 공부 중이고 출석한 학생
  if (isCurrentlyStudying && student.status === 'ATTENDING') {
    return 3;
  }
  
  // 4순위: 나머지 다음 공부 시간이 있는 학생
  if (minutesUntilNext !== Infinity) {
    return 4;
  }
  
  // 5순위: 공부 시간 할당이 없는 학생
  return 5;
};

const StudyMonitoring: React.FC = () => {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => {
    // Use Korean local date for the date selector
    const today = new Date();
    const koreanDate = new Date(today.getTime() + (9 * 60 * 60 * 1000)); // UTC + 9 hours
    return koreanDate.toISOString().split('T')[0];
  });
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const fixedLayoutRef = useRef<FixedLayoutRef | null>(null);

  // Query for monitoring data - only enable when authenticated
  const { 
    data: monitoringData, 
    isLoading, 
    isError, 
    error, 
    refetch,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['monitoring', selectedDate],
    queryFn: () => monitoringApi.getStudyTimeMonitoring(selectedDate),
    enabled: isAuthenticated && !authLoading, // Only run query when authenticated
    refetchInterval: autoRefresh ? 60000 : false, // Refetch every minute if auto refresh is on
    refetchIntervalInBackground: true,
    retry: (failureCount, error) => {
      // Don't retry authentication errors
      if (error && 'response' in error && (error as any).response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Update last refresh time when data is successfully fetched
  useEffect(() => {
    if (monitoringData && !isLoading && !isError && dataUpdatedAt) {
      setLastRefreshTime(new Date(dataUpdatedAt));
    }
  }, [monitoringData, isLoading, isError, dataUpdatedAt]);

  const students = monitoringData?.data?.students || [];

  // 스마트 정렬된 학생 목록 (현재 결석인 학생 우선)
  const sortedStudents = useMemo(() => {
    const currentTime = new Date();
    
    return [...students].sort((a, b) => {
      const priorityA = getSortPriority(a, currentTime);
      const priorityB = getSortPriority(b, currentTime);
      
      // 우선순위가 다르면 우선순위로 정렬
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // 같은 우선순위 내에서 세부 정렬
      if (priorityA === 2 || priorityA === 4) {
        // 다음 공부 시간이 가까운 순서로 정렬
        const minutesA = getMinutesUntilNextStudy(a, currentTime);
        const minutesB = getMinutesUntilNextStudy(b, currentTime);
        
        if (minutesA !== minutesB) {
          return minutesA - minutesB;
        }
      }
      
      // 최종적으로 학생 ID로 안정적 정렬 (폴링 시 순서 변동 방지)
      return a.studentId - b.studentId;
    });
  }, [students]);

  // Handle student selection
  const handleStudentSelection = useCallback((studentId: number, selected: boolean) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(studentId);
      } else {
        newSet.delete(studentId);
      }
      return newSet;
    });
  }, []);

  // Handle select all/none
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedStudents(new Set(sortedStudents.map(s => s.studentId)));
    } else {
      setSelectedStudents(new Set());
    }
  }, [sortedStudents]);

  // Handle bulk message action
  const handleBulkMessage = () => {
    if (selectedStudents.size === 0) {
      toast({
        title: "선택된 학생이 없습니다",
        description: "메시지를 보낼 학생을 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    setShowMessageDialog(true);
  };

  // Handle message send complete
  const handleMessageSendComplete = () => {
    refetch();
    setLastRefreshTime(new Date());
  };

  // 현재 시간이 타임라인 범위 내에 있는지 확인
  const isCurrentTimeInRange = () => {
    // '현재시간으로' 버튼은 오늘로 이동하는 기능이 있으므로 항상 사용 가능
    return true;
  };

  // Get selected students data
  const getSelectedStudentsData = (): MonitoringStudent[] => {
    return students.filter(student => selectedStudents.has(student.studentId));
  };

  // Manual refresh
  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "데이터 새로고침",
        description: "모니터링 데이터를 업데이트했습니다.",
      });
    } catch (error) {
      console.error('Manuel refresh failed:', error);
    }
  };

  // Get status counts
  const statusCounts = sortedStudents.reduce((acc, student) => {
    acc[student.status] = (acc[student.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const isAllSelected = sortedStudents.length > 0 && selectedStudents.size === sortedStudents.length;
  const isPartiallySelected = selectedStudents.size > 0 && selectedStudents.size < sortedStudents.length;

  // Date navigation functions
  const handlePreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  // Go to current time (change date to today and scroll to current time)
  const handleGoToCurrentTime = () => {
    // 1. Calculate today's date in Korean timezone
    const today = new Date();
    const koreanDate = new Date(today.getTime() + (9 * 60 * 60 * 1000)); // UTC + 9 hours
    const todayString = koreanDate.toISOString().split('T')[0];
    
    // 2. Check if we're already on the current day
    const isAlreadyToday = selectedDate === todayString;
    
    if (isAlreadyToday) {
      // If already on today, scroll immediately without delay
      fixedLayoutRef.current?.scrollToCurrentTime();
    } else {
      // If on a different day, change date first then scroll after re-render
      setSelectedDate(todayString);
      
      // Wait for the date change to be processed and component to re-render
      setTimeout(() => {
        fixedLayoutRef.current?.scrollToCurrentTime();
      }, 100);
    }
  };

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <LoadingSpinner 
                icon="refresh" 
                size="lg" 
                text="인증 확인 중..." 
                className="mx-auto mb-4"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-500 mb-2">데이터 로드 실패</h3>
              <p className="text-gray-600 mb-4">
                {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}
              </p>
              <Button onClick={() => refetch()}>다시 시도</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">스터디 모니터링</h1>
          <p className="text-gray-600 mt-1">학생들의 실시간 학습 현황을 모니터링합니다</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Auto refresh toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={(checked) => setAutoRefresh(checked === true)}
            />
            <label htmlFor="auto-refresh" className="text-sm font-medium text-gray-700">
              자동 새로고침 (1분)
            </label>
          </div>
          
          {/* Last refresh time */}
          <LastRefreshTime lastRefreshTime={lastRefreshTime} />
          
          {/* Manual refresh button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingSpinner 
                icon="refresh" 
                size="sm" 
                className="mr-2" 
                variant="default"
              />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            새로고침
          </Button>
        </div>
      </div>

      {/* Date Selection and Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <label htmlFor="date" className="text-sm font-medium text-gray-700">
                  모니터링 날짜:
                </label>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousDay}
                    className="h-8 w-8 p-0"
                    title="전날"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextDay}
                    className="h-8 w-8 p-0"
                    title="다음날"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Scroll to current time button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGoToCurrentTime}
                disabled={!isCurrentTimeInRange()}
                className="flex items-center space-x-2"
                title="오늘 날짜로 이동하고 현재 시간 위치로 스크롤"
              >
                <Clock className="h-4 w-4" />
                <span>현재 시간으로</span>
              </Button>
            </div>
            
            {/* Status badges */}
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                출석 중: {statusCounts.ATTENDING || 0}
              </Badge>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                미접속: {statusCounts.ABSENT || 0}
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                할당 없음: {statusCounts.NO_ASSIGNED_TIME || 0}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el && el.querySelector('button')) {
                      const button = el.querySelector('button') as HTMLButtonElement & { indeterminate?: boolean };
                      if (button) button.indeterminate = isPartiallySelected;
                    }
                  }}
                  onCheckedChange={handleSelectAll}
                />
                <span className="font-medium text-gray-800">
                  학생 목록 ({sortedStudents.length}명)
                  <span className="text-sm text-gray-500 ml-2">• 결석/곧 공부할 학생 우선</span>
                </span>
              </div>
              
              {/* Legend - Compact version */}
              <div className="flex items-center space-x-4 ml-8">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded-sm"></div>
                  <span className="text-xs text-gray-600">할당</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <span className="text-xs text-gray-600">접속</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                  <span className="text-xs text-gray-600">추가접속 (미할당 시간)</span>
                </div>
              </div>
            </div>
            
            {/* Message button - Always visible */}
            <Button 
              onClick={handleBulkMessage}
              disabled={selectedStudents.size === 0}
              variant={selectedStudents.size > 0 ? "default" : "outline"}
              className={`
                transition-all duration-200 ease-in-out
                ${selectedStudents.size > 0 
                  ? 'shadow-md hover:shadow-lg' 
                  : 'text-gray-500'
                }
              `}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              <span>
                {selectedStudents.size > 0 
                  ? `${selectedStudents.size}명에게 메시지 보내기` 
                  : '메시지 보내기'
                }
              </span>
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0 h-[calc(100vh-400px)] min-h-96">
          {isLoading ? (
            <LoadingSpinner 
              icon="refresh" 
              size="lg" 
              text="데이터를 불러오는 중..." 
              className="p-8"
            />
          ) : (
            <FixedLayout header={<FixedTimelineHeader />} ref={fixedLayoutRef} selectedDate={selectedDate}>
              <div>
                {sortedStudents.map((student) => (
                  <StudentRow
                    key={student.studentId}
                    student={student}
                    isSelected={selectedStudents.has(student.studentId)}
                    onSelectionChange={handleStudentSelection}
                    onMessageSent={handleMessageSendComplete}
                  />
                ))}
                
                {sortedStudents.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    해당 날짜에 대한 데이터가 없습니다.
                  </div>
                )}
              </div>
            </FixedLayout>
          )}
        </CardContent>
      </Card>

      {/* Add SendMessageDialog */}
      <SendMessageDialog
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        selectedStudents={getSelectedStudentsData()}
        onSendComplete={handleMessageSendComplete}
      />
    </div>
  );
};

export default StudyMonitoring; 