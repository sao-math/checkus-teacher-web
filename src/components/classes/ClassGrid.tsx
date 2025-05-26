import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Class } from '@/types/class';
import ClassCard from './ClassCard';

interface ClassGridProps {
  classes: Class[];
  onClassClick: (cls: Class) => void;
  onEdit?: (cls: Class) => void;
  onDelete?: (cls: Class) => void;
}

const ClassGrid: React.FC<ClassGridProps> = ({ classes, onClassClick, onEdit, onDelete }) => {
  if (classes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
          <p className="text-gray-500">다른 검색어를 시도해보세요</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {classes.map((cls) => (
        <ClassCard
          key={cls.id}
          cls={cls}
          onClassClick={onClassClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ClassGrid;
