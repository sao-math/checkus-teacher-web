import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Clock, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddStudentsDialog } from './AddStudentsDialog';

interface ClassQuickActionsProps {
  classId: number;
}

export const ClassQuickActions: React.FC<ClassQuickActionsProps> = ({ classId }) => {
  const { toast } = useToast();
  const [showAddStudentsDialog, setShowAddStudentsDialog] = useState(false);

  const handleAddStudent = () => {
    setShowAddStudentsDialog(true);
  };

  const handleAttendanceManagement = () => {
    toast({
      title: "개발 중",
      description: "출석 관리 기능이 개발 중입니다.",
    });
  };

  const handleTaskManagement = () => {
    toast({
      title: "개발 중",
      description: "과제 관리 기능이 개발 중입니다.",
    });
  };

  const handleAddStudents = (studentIds: number[]) => {
    // 실제로는 API 호출을 할 것입니다
    toast({
      title: "학생 추가 완료",
      description: `${studentIds.length}명의 학생이 추가되었습니다.`,
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>빠른 액션</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleAddStudent}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            학생 추가
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleAttendanceManagement}
          >
            <Clock className="h-4 w-4 mr-2" />
            출석 관리
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleTaskManagement}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            과제 관리
          </Button>
        </CardContent>
      </Card>

      <AddStudentsDialog
        open={showAddStudentsDialog}
        onOpenChange={setShowAddStudentsDialog}
        onAddStudents={handleAddStudents}
      />
    </>
  );
};
