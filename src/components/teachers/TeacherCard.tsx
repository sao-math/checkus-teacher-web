import React from 'react';
import { Phone, Users, Calendar } from 'lucide-react';
import ManagementCard from '@/components/ui/ManagementCard';

interface Teacher {
  id: number;
  username: string;
  name: string;
  phoneNumber: string;
  discordId?: string;
  createdAt: string;
  status: 'active' | 'pending' | 'resigned';
  classes: string[];
}

interface TeacherCardProps {
  teacher: Teacher;
  onView: (teacher: Teacher) => void;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, onView, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resigned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '재직중';
      case 'pending': return '승인대기';
      case 'resigned': return '퇴직';
      default: return '알 수 없음';
    }
  };

  const info = [
    {
      icon: Phone,
      text: teacher.phoneNumber
    }
  ];

  if (teacher.discordId) {
    info.push({
      icon: Users,
      text: `Discord: ${teacher.discordId}`
    });
  }

  if (teacher.classes.length > 0) {
    info.push({
      icon: Users,
      text: `담당: ${teacher.classes.join(', ')}`
    });
  }

  info.push({
    icon: Calendar,
    text: `가입일: ${new Date(teacher.createdAt).toLocaleDateString()}`
  });

  return (
    <ManagementCard
      id={teacher.id}
      title={teacher.name}
      subtitle={`@${teacher.username}`}
      status={{
        value: teacher.status,
        label: getStatusText(teacher.status),
        color: getStatusColor(teacher.status)
      }}
      avatar={{
        fallback: teacher.name.charAt(0)
      }}
      info={info}
      actions={[]}
      onView={() => onView(teacher)}
      onEdit={() => onEdit(teacher)}
      onDelete={() => onDelete(teacher)}
      deleteConfirmation={{
        title: '정말 삭제하시겠습니까?',
        description: `${teacher.name} 선생님의 모든 정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`
      }}
    />
  );
};

export default TeacherCard; 