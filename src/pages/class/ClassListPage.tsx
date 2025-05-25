import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Activity } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Class } from '../../types';

// Mock data
const mockClasses: Class[] = [
  {
    id: '1',
    name: '1학년 2반',
    description: '기초 과정 반',
    teacherId: '2',
    studentCount: 15,
    createdAt: '2023-04-15T10:30:00Z',
    updatedAt: '2023-04-20T14:20:00Z',
  },
  {
    id: '2',
    name: '2학년 3반',
    description: '중급 과정 반',
    teacherId: '2',
    studentCount: 12,
    createdAt: '2023-03-10T09:15:00Z',
    updatedAt: '2023-04-18T11:45:00Z',
  },
  {
    id: '3',
    name: '3학년 1반',
    description: '고급 과정 반',
    teacherId: '2',
    studentCount: 10,
    createdAt: '2023-02-20T13:40:00Z',
    updatedAt: '2023-04-22T16:30:00Z',
  },
];

const ClassListPage: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setClasses(mockClasses);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClasses();
  }, []);
  
  const filteredClasses = classes.filter(
    cls => cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           cls.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleCreateClass = () => {
    navigate('/classes/new');
  };
  
  const handleClassClick = (id: string) => {
    navigate(`/classes/${id}`);
  };
  
  const handleDashboardClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/classes/${id}/dashboard`);
  };

  return (
    <AppLayout title="반 관리">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="w-full sm:w-64">
          <Input
            placeholder="반 이름 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-5 w-5 text-gray-400" />}
            fullWidth
          />
        </div>
        <Button
          onClick={handleCreateClass}
          leftIcon={<Plus size={16} />}
        >
          새 반 만들기
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 반이 없습니다</h3>
          <p className="text-gray-600 mb-6">새 반을 만들어 학생들을 관리해보세요.</p>
          <Button
            onClick={handleCreateClass}
            leftIcon={<Plus size={16} />}
          >
            새 반 만들기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleClassClick(cls.id)}
            >
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">{cls.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{cls.description}</p>
              </div>
              <div className="px-6 py-4">
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <Users className="h-5 w-5 mr-2" />
                  <span>학생 {cls.studentCount}명</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    마지막 업데이트: {new Date(cls.updatedAt).toLocaleDateString()}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Activity size={14} />}
                    onClick={(e) => handleDashboardClick(cls.id, e)}
                  >
                    대시보드
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default ClassListPage;