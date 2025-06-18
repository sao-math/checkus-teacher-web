import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  RefreshCw, 
  Phone, 
  MessageSquare, 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  AlertCircle,
  CheckCircle2,
  Send
} from 'lucide-react';
import { useStudyMonitoringPolling } from '@/hooks/useStudyMonitoringPolling';
import { studyMonitoringApi } from '@/services/studyMonitoringApi';
import { StudyMonitoringStudent, StudentStatus } from '@/types/study-monitoring';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const StudyMonitoring: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<'current' | 'today'>('current');
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [bulkNotificationOpen, setBulkNotificationOpen] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [loadingNotifications, setLoadingNotifications] = useState<Set<number>>(new Set());
  const [loadingBulkNotification, setLoadingBulkNotification] = useState(false);

  const { data, loading, error, lastUpdated, refresh, isPolling } = useStudyMonitoringPolling(timeFilter);
  const { toast } = useToast();

  // Status styling helper
  const getStatusBadge = (status: StudentStatus) => {
    switch (status) {
      case 'PRESENT':
        return <Badge variant="default" className="bg-green-500"><UserCheck className="w-3 h-3 mr-1" />출석</Badge>;
      case 'ABSENT':
        return <Badge variant="destructive"><UserX className="w-3 h-3 mr-1" />결석</Badge>;
      case 'LATE':
        return <Badge variant="secondary" className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />지각</Badge>;
      case 'SCHEDULED':
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />예정</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter absent students for bulk actions
  const absentStudents = useMemo(() => {
    return data?.students.filter(student => student.status === 'ABSENT') || [];
  }, [data?.students]);

  // Handle individual student selection
  const toggleStudentSelection = (studentId: number) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  // Select all absent students
  const selectAllAbsent = () => {
    const absentIds = new Set(absentStudents.map(s => s.studentId));
    setSelectedStudents(absentIds);
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedStudents(new Set());
  };

  // Handle individual notification
  const handleIndividualNotification = async (studentId: number) => {
    setLoadingNotifications(prev => new Set(prev).add(studentId));
    
    try {
      await studyMonitoringApi.resendNotification(studentId, {
        message: '즉시 스터디룸에 입장해주세요!',
        channels: ['discord', 'sms']
      });
      
      toast({
        title: '알림 전송 완료',
        description: '학생에게 알림을 전송했습니다.',
      });
      
      // Refresh data to get updated notification status
      refresh();
    } catch (error) {
      toast({
        title: '알림 전송 실패',
        description: '알림 전송 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoadingNotifications(prev => {
        const next = new Set(prev);
        next.delete(studentId);
        return next;
      });
    }
  };

  // Handle bulk notification
  const handleBulkNotification = async () => {
    if (selectedStudents.size === 0) {
      toast({
        title: '학생을 선택해주세요',
        description: '알림을 보낼 학생을 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setLoadingBulkNotification(true);
    
    try {
      const response = await studyMonitoringApi.sendBulkNotification({
        studentIds: Array.from(selectedStudents),
        message: bulkMessage || '즉시 스터디룸에 입장해주세요!',
        channels: ['discord']
      });
      
      toast({
        title: '일괄 알림 전송 완료',
        description: `총 ${response.data.totalRequested}명 중 ${response.data.totalSent}명에게 알림을 전송했습니다.`,
      });
      
      setBulkNotificationOpen(false);
      setBulkMessage('');
      setSelectedStudents(new Set());
      refresh();
    } catch (error) {
      toast({
        title: '일괄 알림 전송 실패',
        description: '일괄 알림 전송 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoadingBulkNotification(false);
    }
  };

  // Handle student click (open in new tab)
  const handleStudentClick = (studentId: number) => {
    window.open(`/students/${studentId}`, '_blank');
  };

  // Format time display
  const formatTime = (timeString: string) => {
    return format(new Date(timeString), 'HH:mm', { locale: ko });
  };

  const formatDateTime = (timeString: string) => {
    return format(new Date(timeString), 'MM/dd HH:mm', { locale: ko });
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">데이터를 불러올 수 없습니다</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={refresh}>다시 시도</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">스터디 출석 모니터링</h1>
          <p className="text-muted-foreground">
            디스코드 스터디룸 출석 현황을 실시간으로 모니터링합니다
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">현재 시간</p>
            <p className="text-lg font-semibold">
              {data?.currentTime ? format(new Date(data.currentTime), 'yyyy/MM/dd HH:mm:ss') : '-'}
            </p>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground">
                마지막 업데이트: {format(lastUpdated, 'HH:mm:ss')}
              </p>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 활성 학생</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.totalActiveStudents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">출석</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{data.summary.presentStudents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">결석</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{data.summary.absentStudents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">지각</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{data.summary.lateStudents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">출석률</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{data.summary.attendanceRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="time-filter"
              checked={timeFilter === 'today'}
              onCheckedChange={(checked) => setTimeFilter(checked ? 'today' : 'current')}
            />
            <Label htmlFor="time-filter">
              {timeFilter === 'current' ? '현재 시간대' : '오늘 전체'}
            </Label>
          </div>
          
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isPolling ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm text-muted-foreground">
              {isPolling ? '실시간 업데이트 중' : '업데이트 일시정지'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {selectedStudents.size > 0 && (
            <Button variant="outline" size="sm" onClick={clearSelection}>
              선택 해제 ({selectedStudents.size})
            </Button>
          )}
          
          {absentStudents.length > 0 && (
            <Button variant="outline" size="sm" onClick={selectAllAbsent}>
              결석자 전체 선택
            </Button>
          )}
          
          <Button
            size="sm"
            onClick={() => setBulkNotificationOpen(true)}
            disabled={selectedStudents.size === 0}
          >
            <Send className="w-4 h-4 mr-2" />
            일괄 알림 ({selectedStudents.size})
          </Button>
        </div>
      </div>

      {/* Student Table */}
      <Card>
        <CardHeader>
          <CardTitle>학생 출석 현황</CardTitle>
          <CardDescription>
            학생명을 클릭하면 상세 페이지가 새 탭에서 열립니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">선택</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>학생명</TableHead>
                <TableHead>할당 시간</TableHead>
                <TableHead>실제 시간</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>마지막 알림</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.students?.map((student) => (
                <TableRow key={student.studentId}>
                  <TableCell>
                    <Checkbox
                      checked={selectedStudents.has(student.studentId)}
                      onCheckedChange={() => toggleStudentSelection(student.studentId)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    {getStatusBadge(student.status)}
                  </TableCell>
                  
                  <TableCell>
                    <button
                      className="text-left hover:underline font-medium"
                      onClick={() => handleStudentClick(student.studentId)}
                    >
                      {student.studentName}
                    </button>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{student.assignedStudyTime.activityName}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(student.assignedStudyTime.startTime)} - {formatTime(student.assignedStudyTime.endTime)}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {student.actualStudyTime.startTime ? (
                      <div className="text-sm">
                        <div>{formatTime(student.actualStudyTime.startTime)}</div>
                        {student.actualStudyTime.endTime && (
                          <div>- {formatTime(student.actualStudyTime.endTime)}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <a
                        href={`tel:${student.studentPhone}`}
                        className="flex items-center text-sm text-blue-600 hover:underline"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        {student.studentPhone}
                      </a>
                      {student.guardianPhones.map((phone, index) => (
                        <a
                          key={index}
                          href={`tel:${phone}`}
                          className="flex items-center text-sm text-blue-600 hover:underline"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          {phone} (보호자)
                        </a>
                      ))}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {student.lastNotificationSent ? (
                      <div className="text-sm">
                        <div>{formatDateTime(student.lastNotificationSent)}</div>
                        <div className="text-muted-foreground">
                          {student.lastNotificationType}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleIndividualNotification(student.studentId)}
                      disabled={loadingNotifications.has(student.studentId)}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {loadingNotifications.has(student.studentId) ? '전송중...' : '알림'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {!data?.students?.length && (
            <div className="text-center py-8 text-muted-foreground">
              표시할 학생이 없습니다
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Notification Dialog */}
      <Dialog open={bulkNotificationOpen} onOpenChange={setBulkNotificationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>일괄 알림 전송</DialogTitle>
            <DialogDescription>
              선택된 {selectedStudents.size}명의 학생에게 알림을 전송합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-message">메시지 (선택사항)</Label>
              <Textarea
                id="bulk-message"
                value={bulkMessage}
                onChange={(e) => setBulkMessage(e.target.value)}
                placeholder="기본 메시지: 즉시 스터디룸에 입장해주세요!"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkNotificationOpen(false)}>
              취소
            </Button>
            <Button onClick={handleBulkNotification} disabled={loadingBulkNotification}>
              {loadingBulkNotification ? '전송중...' : '알림 전송'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudyMonitoring; 