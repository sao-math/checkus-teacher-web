import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Class } from '@/types/class';

interface ClassCardProps {
  cls: Class;
  onClassClick: (cls: Class) => void;
  onEdit?: (cls: Class) => void;
  onDelete?: (cls: Class) => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ cls, onClassClick, onEdit, onDelete }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{cls.name}</h3>
            <Badge 
              variant={cls.status === 'active' ? 'default' : 'secondary'}
              className={cls.status === 'active' ? 'bg-green-100 text-green-800' : ''}
            >
              {cls.status === 'active' ? '활성' : '비활성'}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onClassClick(cls)}>
                <Eye className="h-4 w-4 mr-2" />
                상세보기
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(cls)}>
                <Edit className="h-4 w-4 mr-2" />
                정보 수정
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600"
                    onSelect={(e) => {
                      e.preventDefault();
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {cls.name} 반의 모든 정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete?.(cls)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>{cls.studentCount}명의 학생</span>
          {cls.maxStudents && (
            <span className="text-gray-400">/ {cls.maxStudents}명</span>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>담당: {cls.teacher}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{cls.schedule}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassCard;
