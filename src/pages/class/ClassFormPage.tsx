import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Class, User } from '../../types';
import { colors } from '../../styles/colors';

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
    email: 'teacher2@example.com',
    role: 'teacher',
    isApproved: true,
    createdAt: '2023-04-20T13:40:00Z',
    updatedAt: '2023-04-20T13:40:00Z',
  },
];

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
];

const ClassFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id !== 'new';
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [teachers, setTeachers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    setIsLoading(true);
    
    const fetchData = async () => {
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setTeachers(mockTeachers);
        
        if (isEditing) {
          const classData = mockClasses.find(c => c.id === id);
          if (classData) {
            setName(classData.name);
            setDescription(classData.description);
            setTeacherId(classData.teacherId);
          } else {
            setError('반 정보를 찾을 수 없습니다.');
          }
        }
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditing]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to class list
      navigate('/classes');
    } catch (err) {
      setError('반 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/classes');
  };

  return (
    <AppLayout title={isEditing ? '반 수정' : '새 반 만들기'}>
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={handleCancel}
        >
          반 목록으로 돌아가기
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className={`bg-${colors.background2} shadow-sm rounded-lg overflow-hidden`}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? '반 정보 수정' : '새 반 정보 입력'}
              </h3>
            </div>
            
            <div className="px-6 py-5 space-y-6">
              <div>
                <Input
                  id="name"
                  label="반 이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  fullWidth
                  placeholder="예: 1학년 2반"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  반 설명
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  placeholder="반에 대한 간단한 설명을 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-1">
                  담당 선생님
                </label>
                <select
                  id="teacherId"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                  required
                >
                  <option value="">선생님을 선택해주세요</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                취소
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                leftIcon={<Save size={16} />}
              >
                {isEditing ? '반 정보 저장' : '반 만들기'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
};

export default ClassFormPage;