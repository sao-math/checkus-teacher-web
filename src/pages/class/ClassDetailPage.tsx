import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Edit, Trash2, UserPlus, Activity } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/ui/Button';
import { Class, Student } from '../../types';

// Mock data
const mockClass: Class = {
  id: '1',
  name: '1학년 2반',
  description: '기초 과정 반',
  teacherIds: ['1'], // testuser의 ID
  studentCount: 3,
  createdAt: '2024-03-15T10:30:00Z',
  updatedAt: '2024-03-20T14:20:00Z',
};

const mockStudents: Student[] = [
  {
    id: '1',
    name: '김철수',
    grade: '1학년',
    classIds: ['1'],
    contactInfo: '010-1234-5678',
    notes: '수학 과목 보충 필요',
    createdAt: '2024-03-10T09:15:00Z',
    updatedAt: '2024-03-18T11:45:00Z',
  },
  {
    id: '2',
    name: '박영희',
    grade: '1학년',
    classIds: ['1'],
    contactInfo: '010-2345-6789',
    notes: '영어 능력 우수',
    createdAt: '2024-03-11T13:40:00Z',
    updatedAt: '2024-03-19T16:30:00Z',
  },
  {
    id: '3',
    name: '이지민',
    grade: '1학년',
    classIds: ['1'],
    contactInfo: '010-3456-7890',
    notes: '미술 활동 참여도 높음',
    createdAt: '2024-03-12T10:20:00Z',
    updatedAt: '2024-03-20T15:10:00Z',
  },
];

const ClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchClassData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (id) {
          setClassData(mockClass);
          setStudents(mockStudents);
        } else {
          setError('반 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        setError('반 정보를 로드하는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClassData();
  }, [id]);
  
  const handleEditClass = () => {
    if (id) {
      navigate(`/classes/${id}/edit`);
    }
  };
  
  const handleDeleteClass = async () => {
    if (window.confirm('이 반을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate('/classes');
      } catch (err) {
        setError('반 삭제에 실패했습니다.');
      }
    }
  };
  
  const handleAddStudent = () => {
    // Open modal or navigate to student selection page
    navigate('/students/new', { state: { classId: id } });
  };
  
  const handleStudentClick = (studentId: string) => {
    navigate(`/students/${studentId}`);
  };
  
  const handleViewDashboard = () => {
    if (id) {
      navigate(`/classes/${id}/dashboard`);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
        </div>
      </AppLayout>
    );
  }
  
  if (error || !classData) {
    return (
      <AppLayout>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || '반 정보를 찾을 수 없습니다.'}</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={classData.name}>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{classData.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{classData.description}</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Activity size={16} />}
              onClick={handleViewDashboard}
            >
              대시보드
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit size={16} />}
              onClick={handleEditClass}
            >
              수정
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 size={16} />}
              onClick={handleDeleteClass}
            >
              삭제
            </Button>
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-center text-gray-600 mb-6">
            <Users className="h-5 w-5 mr-2" />
            <span>학생 {students.length}명</span>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-base font-medium text-gray-900">학생 목록</h4>
              <Button
                size="sm"
                leftIcon={<UserPlus size={16} />}
                onClick={handleAddStudent}
              >
                학생 추가
              </Button>
            </div>
            
            {students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                이 반에 등록된 학생이 없습니다.
              </div>
            ) : (
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        이름
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        학년
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        연락처
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        메모
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr 
                        key={student.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleStudentClick(student.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{student.grade}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{student.contactInfo}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 truncate max-w-xs">{student.notes}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClassDetailPage;