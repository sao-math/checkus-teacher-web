import React from 'react';
import { Users, Calendar } from 'lucide-react';
import ManagementCard from '@/components/ui/ManagementCard';
import { Class } from '@/types/class';

interface ClassCardProps {
  cls: Class;
  onClassClick: (cls: Class) => void;
  onEdit?: (cls: Class) => void;
  onDelete?: (cls: Class) => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ cls, onClassClick, onEdit, onDelete }) => {
  const info = [
    {
      icon: Users,
      text: `${cls.studentCount}명의 학생${cls.maxStudents ? ` / ${cls.maxStudents}명` : ''}`
    },
    {
      icon: Users,
      text: `담당: ${cls.teacher}`
    },
    {
      icon: Calendar,
      text: cls.schedule
    }
  ];

  return (
    <ManagementCard
      id={cls.id}
      title={cls.name}
      status={{
        value: cls.status,
        label: cls.status === 'active' ? '활성' : '비활성',
        color: cls.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }}
      avatar={{
        fallback: cls.name.charAt(0)
      }}
      info={info}
      actions={[]}
      onView={() => onClassClick(cls)}
      onEdit={onEdit ? () => onEdit(cls) : undefined}
      onDelete={onDelete ? () => onDelete(cls) : undefined}
      deleteConfirmation={{
        title: '정말 삭제하시겠습니까?',
        description: `${cls.name} 반의 모든 정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`
      }}
    />
  );
};

export default ClassCard;
