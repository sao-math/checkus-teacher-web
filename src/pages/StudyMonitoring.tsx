import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MessageCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Timeline, TimelineHeader } from '@/components/monitoring/Timeline';
import StudentRow from '@/components/monitoring/StudentRow';
import monitoringApi from '@/services/monitoringApi';
import { MonitoringStudent } from '@/types/monitoring';

const StudyMonitoring: React.FC = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to today's date in YYYY-MM-DD format
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Query for monitoring data
  const { 
    data: monitoringData, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['monitoring', selectedDate],
    queryFn: () => monitoringApi.getStudyTimeMonitoring(selectedDate),
    refetchInterval: autoRefresh ? 60000 : false, // Refetch every minute if auto refresh is on
    refetchIntervalInBackground: true,
  });

  const students = monitoringData?.data?.students || [];

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
      setSelectedStudents(new Set(students.map(s => s.studentId)));
    } else {
      setSelectedStudents(new Set());
    }
  }, [students]);

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

    // TODO: Implement bulk message functionality
    toast({
      title: "메시지 기능",
      description: `${selectedStudents.size}명의 학생에게 메시지 기능이 구현될 예정입니다.`,
    });
  };

  // Manual refresh
  const handleRefresh = () => {
    refetch();
    toast({
      title: "데이터 새로고침",
      description: "모니터링 데이터를 업데이트했습니다.",
    });
  };

  // Get status counts
  const statusCounts = students.reduce((acc, student) => {
    acc[student.status] = (acc[student.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const isAllSelected = students.length > 0 && selectedStudents.size === students.length;
  const isPartiallySelected = selectedStudents.size > 0 && selectedStudents.size < students.length;

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">데이터 로드 실패</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">스터디 모니터링</h1>
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
            <label htmlFor="auto-refresh" className="text-sm font-medium">
              자동 새로고침 (1분)
            </label>
          </div>
          
          {/* Manual refresh button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
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
                <label htmlFor="date" className="text-sm font-medium">
                  모니터링 날짜:
                </label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
              </div>
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
            <div className="flex items-center space-x-4">
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
              <span>
                학생 목록 ({students.length}명)
                {selectedStudents.size > 0 && ` • ${selectedStudents.size}명 선택됨`}
              </span>
            </div>
            
            {/* Bulk actions */}
            {selectedStudents.size > 0 && (
              <Button 
                onClick={handleBulkMessage}
                className="flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>메시지 보내기 ({selectedStudents.size})</span>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>데이터를 불러오는 중...</p>
            </div>
          ) : (
            <Timeline>
              {/* Timeline Header */}
              <div className="flex">
                <div className="w-48 h-12 border-b border-gray-200 bg-gray-50 flex items-center px-3">
                  <span className="text-sm font-medium text-gray-600">학생</span>
                </div>
                <div className="flex-1">
                  <TimelineHeader />
                </div>
              </div>
              
              {/* Student Rows */}
              <div>
                {students.map((student) => (
                  <StudentRow
                    key={student.studentId}
                    student={student}
                    isSelected={selectedStudents.has(student.studentId)}
                    onSelectionChange={handleStudentSelection}
                  />
                ))}
              </div>
              
              {students.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  해당 날짜에 대한 데이터가 없습니다.
                </div>
              )}
            </Timeline>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>범례</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-200 border border-blue-300 rounded"></div>
              <span className="text-sm">할당된 공부시간</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span className="text-sm">실제 접속시간</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm">할당되지 않은 접속</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyMonitoring; 