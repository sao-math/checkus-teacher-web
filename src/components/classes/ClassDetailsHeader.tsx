
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Class } from '@/types/class';

interface ClassDetailsHeaderProps {
  selectedClass: Class;
}

export const ClassDetailsHeader: React.FC<ClassDetailsHeaderProps> = ({ selectedClass }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/classes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          반 관리로 돌아가기
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{selectedClass.name}</h1>
            <Badge 
              variant={selectedClass.status === 'active' ? 'default' : 'secondary'}
              className={selectedClass.status === 'active' ? 'bg-green-100 text-green-800' : ''}
            >
              {selectedClass.status === 'active' ? '활성' : '비활성'}
            </Badge>
          </div>
          <p className="text-gray-600 mt-1">반 정보를 확인하고 관리할 수 있습니다.</p>
        </div>
      </div>
      <Button 
        onClick={() => navigate(`/classes/${selectedClass.id}/task-dashboard`)}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        할일 대시보드
      </Button>
    </div>
  );
};
