import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageCircle } from 'lucide-react';
import { StudyTimeBar } from './Timeline';
import { FixedRow } from './FixedLayout';
import { SendMessageDialog } from './SendMessageDialog';
import { MonitoringStudent, StudentStatus } from '@/types/monitoring';
import { cn } from '@/lib/utils';

interface StudentRowProps {
  student: MonitoringStudent;
  isSelected: boolean;
  onSelectionChange: (studentId: number, selected: boolean) => void;
  onMessageSent?: () => void;
}

const getStatusColor = (status: StudentStatus): string => {
  switch (status) {
    case 'ATTENDING':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'ABSENT':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'NO_ASSIGNED_TIME':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const getStatusText = (status: StudentStatus): string => {
  switch (status) {
    case 'ATTENDING':
      return '출석 중';
    case 'ABSENT':
      return '미접속';
    case 'NO_ASSIGNED_TIME':
      return '할당 시간 없음';
    default:
      return '알 수 없음';
  }
};

const StudentRow: React.FC<StudentRowProps> = ({ 
  student, 
  isSelected, 
  onSelectionChange, 
  onMessageSent 
}) => {
  const navigate = useNavigate();
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  const handleStudentClick = () => {
    navigate(`/students/${student.studentId}`);
  };

  const handleCheckboxChange = (checked: boolean) => {
    onSelectionChange(student.studentId, checked);
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMessageDialog(true);
  };

  const handleMessageSendComplete = () => {
    onMessageSent?.();
  };

  // Get all connected actual study times from assigned times
  const allConnectedActualTimes = student.assignedStudyTimes.flatMap(
    assigned => assigned.connectedActualStudyTimes
  );

  const tooltipContent = (
    <div className="space-y-2">
      <div>
        <strong>전화번호:</strong> {student.studentPhone}
      </div>
      <div>
        <strong>상태:</strong> {getStatusText(student.status)}
      </div>
      {student.guardians.length > 0 && (
        <div>
          <strong>보호자:</strong>
          {student.guardians.map((guardian, index) => (
            <div key={guardian.guardianId} className="ml-2">
              {guardian.relationship}: {guardian.guardianPhone}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const leftContent = (
    <div className="flex items-center space-x-3">
      <Checkbox
        checked={isSelected}
        onCheckedChange={handleCheckboxChange}
        className="h-4 w-4"
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleStudentClick}
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer",
                getStatusColor(student.status)
              )}
            >
              {student.studentName}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs z-[9999]" sideOffset={8}>
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Individual message button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMessageClick}
              className="h-8 w-8 p-0 hover:bg-blue-50"
            >
              <MessageCircle className="h-4 w-4 text-blue-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>메시지 보내기</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  const rightContent = (
    <StudyTimeBar
      assignedTimes={student.assignedStudyTimes}
      actualTimes={allConnectedActualTimes}
      unassignedTimes={student.unassignedActualStudyTimes}
    />
  );

  return (
    <>
      <FixedRow 
        leftContent={leftContent}
        rightContent={rightContent}
      />
      
      {/* Individual message dialog */}
      <SendMessageDialog
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        selectedStudents={[student]}
        onSendComplete={handleMessageSendComplete}
      />
    </>
  );
};

export default StudentRow; 