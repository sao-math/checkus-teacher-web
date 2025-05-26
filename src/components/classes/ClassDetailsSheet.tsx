
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Users, Calendar, Clock, Edit, Trash2, UserPlus } from 'lucide-react';

interface Class {
  id: number;
  name: string;
  studentCount: number;
  teacher: string;
  schedule: string;
  status: 'active' | 'inactive';
  description?: string;
  maxStudents?: number;
}

interface ClassDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClass: Class | null;
  onEdit: (cls: Class) => void;
  onDelete: (cls: Class) => void;
}

export const ClassDetailsSheet: React.FC<ClassDetailsSheetProps> = ({
  open,
  onOpenChange,
  selectedClass,
  onEdit,
  onDelete,
}) => {
  if (!selectedClass) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">{selectedClass.name}</SheetTitle>
            <Badge 
              variant={selectedClass.status === 'active' ? 'default' : 'secondary'}
              className={selectedClass.status === 'active' ? 'bg-green-100 text-green-800' : ''}
            >
              {selectedClass.status === 'active' ? '활성' : '비활성'}
            </Badge>
          </div>
          <SheetDescription>
            반 정보를 확인하고 관리할 수 있습니다.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">기본 정보</h3>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>담당 선생님</span>
              </div>
              <p className="font-medium">{selectedClass.teacher}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>수업 시간</span>
              </div>
              <p className="font-medium">{selectedClass.schedule}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>학생 현황</span>
              </div>
              <p className="font-medium">
                {selectedClass.studentCount}명
                {selectedClass.maxStudents && ` / ${selectedClass.maxStudents}명`}
              </p>
            </div>

            {selectedClass.description && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>설명</span>
                </div>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedClass.description}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* 액션 버튼들 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">관리</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full" onClick={() => console.log('학생 추가')}>
                <UserPlus className="h-4 w-4 mr-2" />
                학생 추가
              </Button>
              
              <Button variant="outline" className="w-full" onClick={() => console.log('출석 관리')}>
                <Clock className="h-4 w-4 mr-2" />
                출석 관리
              </Button>
            </div>

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                onEdit(selectedClass);
                onOpenChange(false);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              반 정보 수정
            </Button>

            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={() => {
                onDelete(selectedClass);
                onOpenChange(false);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              반 삭제
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
