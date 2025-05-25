import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Mail, Calendar, Clock } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

// Mock data
const mockTeacher: User = {
  id: '2',
  name: '김선생',
  email: 'teacher@example.com',
  role: 'teacher',
  isApproved: true,
  createdAt: '2023-03-10T09:15:00Z',
  updatedAt: '2023-04-18T11:45:00Z',
};

const TeacherDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [teacher, setTeacher] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }
    
    const fetchTeacher = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (id) {
          setTeacher(mockTeacher);
          setName(mockTeacher.name);
          setEmail(mockTeacher.email);
        } else {
          setError('선생님 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        setError('선생님 정보를 로드하는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeacher();
  }, [id, user, navigate]);
  
  const handleBackToTeachers = () => {
    navigate('/teachers');
  };
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      if (teacher) {
        const updatedTeacher = {
          ...teacher,
          name,
          email,
          updatedAt: new Date().toISOString(),
        };
        setTeacher(updatedTeacher);
      }
      
      setIsEditing(false);
    } catch (err) {
      setError('선생님 정보 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('이 선생님 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate('/teachers');
      } catch (err) {
        setError('선생님 삭제에 실패했습니다.');
      }
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AppLayout>
    );
  }
  
  if (error || !teacher) {
    return (
      <AppLayout>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || '선생님 정보를 찾을 수 없습니다.'}</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="선생님 상세 정보">
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={handleBackToTeachers}
        >
          선생님 목록으로 돌아가기
        </Button>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">선생님 정보</h3>
          <div className="flex space-x-2">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditToggle}
                >
                  수정
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 size={16} />}
                  onClick={handleDelete}
                >
                  삭제
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditToggle}
              >
                취소
              </Button>
            )}
          </div>
        </div>
        
        <div className="px-6 py-5">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Input
                    id="name"
                    label="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    fullWidth
                  />
                </div>
                
                <div>
                  <Input
                    id="email"
                    label="이메일"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                    leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    leftIcon={<Save size={16} />}
                  >
                    저장
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">이름</h4>
                  <p className="mt-1 text-sm text-gray-900">{teacher.name}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">이메일</h4>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-400" />
                    {teacher.email}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">상태</h4>
                  <p className="mt-1 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      teacher.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {teacher.isApproved ? '승인됨' : '승인 대기 중'}
                    </span>
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">역할</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {teacher.role === 'admin' ? '관리자' : '선생님'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">가입일</h4>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {new Date(teacher.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">최근 업데이트</h4>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-400" />
                    {new Date(teacher.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">담당 반</h3>
        </div>
        
        <div className="px-6 py-5">
          <div className="text-center py-8 text-gray-500">
            아직 담당하는 반이 없습니다.
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TeacherDetailPage;