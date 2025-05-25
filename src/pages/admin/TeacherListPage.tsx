import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserCheck, UserX, Mail } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

// Mock data
const mockTeachers: User[] = [
  {
    id: '2',
    name: '김선생',
    email: 'teacher@example.com',
    role: 'teacher',
    isApproved: true,
    createdAt: '2023-03-10T09:15:00Z',
    updatedAt: '2023-04-18T11:45:00Z',
  },
  {
    id: '3',
    name: '이선생',
    email: 'pending@example.com',
    role: 'teacher',
    isApproved: false,
    createdAt: '2023-04-20T13:40:00Z',
    updatedAt: '2023-04-20T13:40:00Z',
  },
  {
    id: '4',
    name: '박선생',
    email: 'teacher2@example.com',
    role: 'teacher',
    isApproved: true,
    createdAt: '2023-02-15T10:20:00Z',
    updatedAt: '2023-04-15T14:30:00Z',
  },
];

const TeacherListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [teachers, setTeachers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }
    
    const fetchTeachers = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTeachers(mockTeachers);
      } catch (error) {
        console.error('Failed to fetch teachers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeachers();
  }, [user, navigate]);
  
  const filteredTeachers = teachers.filter(
    teacher => teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const pendingTeachers = filteredTeachers.filter(teacher => !teacher.isApproved);
  const approvedTeachers = filteredTeachers.filter(teacher => teacher.isApproved);
  
  const handleTeacherClick = (id: string) => {
    navigate(`/teachers/${id}`);
  };
  
  const handleApprove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state to reflect approval
      setTeachers(teachers.map(teacher => 
        teacher.id === id ? { ...teacher, isApproved: true } : teacher
      ));
    } catch (error) {
      console.error('Failed to approve teacher:', error);
    }
  };
  
  const handleReject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm('이 선생님 계정을 거부하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Remove teacher from local state
        setTeachers(teachers.filter(teacher => teacher.id !== id));
      } catch (error) {
        console.error('Failed to reject teacher:', error);
      }
    }
  };

  return (
    <AppLayout title="선생님 관리">
      <div className="mb-6">
        <div className="w-full sm:w-64">
          <Input
            placeholder="이름 또는 이메일로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-5 w-5 text-gray-400" />}
            fullWidth
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
        </div>
      ) : (
        <>
          {/* Pending Approval Section */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">승인 대기 중인 선생님</h3>
            </div>
            
            {pendingTeachers.length === 0 ? (
              <div className="px-6 py-5 text-center text-gray-500">
                승인 대기 중인 선생님이 없습니다.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이메일
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingTeachers.map((teacher) => (
                    <tr 
                      key={teacher.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleTeacherClick(teacher.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-4 w-4 mr-1 text-gray-400" />
                          {teacher.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(teacher.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="success"
                            size="sm"
                            leftIcon={<UserCheck size={16} />}
                            onClick={(e) => handleApprove(teacher.id, e)}
                          >
                            승인
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            leftIcon={<UserX size={16} />}
                            onClick={(e) => handleReject(teacher.id, e)}
                          >
                            거부
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Approved Teachers Section */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">승인된 선생님</h3>
            </div>
            
            {approvedTeachers.length === 0 ? (
              <div className="px-6 py-5 text-center text-gray-500">
                승인된 선생님이 없습니다.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이메일
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      최근 업데이트
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {approvedTeachers.map((teacher) => (
                    <tr 
                      key={teacher.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleTeacherClick(teacher.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-4 w-4 mr-1 text-gray-400" />
                          {teacher.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(teacher.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(teacher.updatedAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default TeacherListPage;