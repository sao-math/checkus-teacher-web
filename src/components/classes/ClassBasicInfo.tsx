
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar } from 'lucide-react';
import { Class } from '@/types/class';

interface ClassBasicInfoProps {
  selectedClass: Class;
}

export const ClassBasicInfo: React.FC<ClassBasicInfoProps> = ({ selectedClass }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">기본 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>담당 선생님</span>
          </div>
          <p className="text-lg font-medium">{selectedClass.teacher}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>수업 시간</span>
          </div>
          <p className="text-lg font-medium">{selectedClass.schedule}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>학생 현황</span>
          </div>
          <p className="text-lg font-medium">
            {selectedClass.studentCount}명
            {selectedClass.maxStudents && ` / ${selectedClass.maxStudents}명`}
          </p>
        </div>

        {selectedClass.description && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>설명</span>
            </div>
            <p className="text-sm bg-gray-50 p-4 rounded-lg leading-relaxed">
              {selectedClass.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
