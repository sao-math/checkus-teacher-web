import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, BookOpen } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Student } from '../../types';

// Mock data
const mockStudents: Student[] = [
  {
    id: '1',
    name: '김철수',
    grade: '1학년',
    classIds: ['1'],
    contactInfo: '010-1234-5678',
    notes: '수학 과목 보충 필요',
    createdAt: '2023-03-10T09:15:00Z',
    updatedAt: '2023-04-18T11:45:00Z',
  },
  {
    id: '2',
    name: '박영희',
    grade: '2학년',
    classIds: ['2'],
    contactInfo: '010-2345-6789',
    notes: '영어 능력 우수',
    createdAt: '2023-02-20T13:40:00Z',
    updatedAt: '2023-04-22T16:30:00Z',
  },
  {
    id: '3',
    name: '이지민',
    grade: '3학년',
    classIds: ['3'],
    contactInfo: '010-3456-7890',
    notes: '미술 활동 참여도 높음',
    createdAt: '2023-01-15T10:20:00Z',
    updatedAt: '2023-04-19T15:10:00Z',
  },
  {
    id: '4',
    name: '정민준',
    grade: '1학년',
    classIds: ['1'],
    contactInfo: '010-4567-8901',
    notes: '체육 활동 우수',
    createdAt: '2023-01-20T11:30:00Z',
    updatedAt: '2023-04-15T14:25:00Z',
  },
];

const StudentListPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStudents(mockStudents);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudents();
  }, []);
  
  const filteredStudents = students.filter(
    student => student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              student.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleCreateStudent = () => {
    navigate('/students/new');
  };
  
  const handleStudentClick = (id: string) => {
    navigate(`/students/${id}`);
  };

  return (
    <AppLayout title="학생 관리">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="w-full sm:w-64">
          <Input
            placeholder="학생 이름 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-5 w-5 text-gray-400" />}
            fullWidth
          />
        </div>
        <Button
          onClick={handleCreateStudent}
          leftIcon={<Plus size={16} />}
        >
          새 학생 등록
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 학생이 없습니다</h3>
          <p className="text-gray-600 mb-6">새 학생을 등록해보세요.</p>
          <Button
            onClick={handleCreateStudent}
            leftIcon={<Plus size={16} />}
          >
            새 학생 등록
          </Button>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
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
                  반
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  메모
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {student.classIds.length} 반
                    </div>
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
    </AppLayout>
  );
};

export default StudentListPage;