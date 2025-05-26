import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { mockClasses } from '@/data/mockClasses';
import ClassTaskMatrix from '@/components/classes/ClassTaskMatrix';

const ClassTaskDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedClass = mockClasses.find(cls => cls.id === parseInt(id || ''));

  if (!selectedClass) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/classes')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">반을 찾을 수 없습니다</h3>
          <p className="text-gray-500">요청하신 반이 존재하지 않습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/classes')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedClass.name} 할일 대시보드
            </h1>
            <p className="text-gray-600 mt-1">
              담당: {selectedClass.teacher}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => navigate(`/classes/${id}`)}
          >
            반 상세보기
          </Button>
        </div>
      </div>

      <ClassTaskMatrix classId={parseInt(id || '0')} />
    </div>
  );
};

export default ClassTaskDashboard;
