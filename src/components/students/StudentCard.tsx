import React from 'react';
import { School, Phone, Users } from 'lucide-react';
import ManagementCard from '@/components/ui/ManagementCard';
import { Student } from '@/types/student';

interface StudentCardProps {
  student: Student;
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onView, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENROLLED': return 'bg-green-100 text-green-800';
      case 'GRADUATED': return 'bg-blue-100 text-blue-800';
      case 'WITHDRAWN': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ENROLLED': return '재원';
      case 'GRADUATED': return '졸업';
      case 'WITHDRAWN': return '퇴원';
      default: return '알 수 없음';
    }
  };

  const info = [
    {
      icon: School,
      text: `${student.school} ${student.grade}학년`
    },
    {
      icon: Phone,
      text: student.studentPhoneNumber || '연락처 없음'
    }
  ];

  if (student.classes.length > 0) {
    info.push({
      icon: Users,
      text: student.classes.join(', ')
    });
  }

  return (
    <ManagementCard
      id={student.id}
      title={student.name}
      status={{
        value: student.status,
        label: getStatusText(student.status),
        color: getStatusColor(student.status)
      }}
      avatar={{
        fallback: student.name.charAt(0)
      }}
      info={info}
      actions={[]}
      onView={() => onView(student)}
      onEdit={() => onEdit(student)}
      onDelete={() => onDelete(student)}
      deleteConfirmation={{
        title: '학생 삭제',
        description: `${student.name} 학생을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
      }}
    />
  );
};

export default StudentCard; 