import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Student, Class } from '../../types';

// Mock data
const mockStudent: Student = {
  id: '1',
  name: '김철수',
  grade: '1학년',
  classIds: ['1'],
  contactInfo: '010-1234-5678',
  notes: '수학 과목 보충 필요',
  createdAt: '2024-03-10T09:15:00Z',
  updatedAt: '2024-03-18T11:45:00Z',
};

const mockClasses: Class[] = [
  {
    id: '1',
    name: '1학년 2반',
    description: '기초 과정 반',
    teacherIds: ['1'],
    studentCount: 15,
    createdAt: '2024-03-15T10:30:00Z',
    updatedAt: '2024-03-20T14:20:00Z',
  },
  {
    id: '2',
    name: '2학년 3반',
    description: '중급 과정 반',
    teacherIds: ['1'],
    studentCount: 12,
    createdAt: '2024-03-10T09:15:00Z',
    updatedAt: '2024-03-18T11:45:00Z',
  },
  {
    id: '3',
    name: '3학년 1반',
    description: '고급 과정 반',
    teacherIds: ['1'],
    studentCount: 10,
    createdAt: '2024-03-11T13:40:00Z',
    updatedAt: '2024-03-19T16:30:00Z',
  },
];

const StudentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = id !== 'new';
  
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call to fetch classes
    setTimeout(() => {
      setClasses(mockClasses);
      
      if (isEditing) {
        // Simulate API call to fetch student details
        const studentData = mockStudent;
        if (studentData) {
          setName(studentData.name);
          setGrade(studentData.grade);
          setContactInfo(studentData.contactInfo);
          setNotes(studentData.notes);
          setSelectedClassIds(studentData.classIds);
        } else {
          setError('학생 정보를 찾을 수 없습니다.');
        }
      } else if (location.state && location.state.classId) {
        // If creating a new student from a class, pre-select that class
        setSelectedClassIds([location.state.classId]);
      }
      
      setIsLoading(false);
    }, 1000);
  }, [id, isEditing, location.state]);
  
  const handleClassToggle = (classId: string) => {
    setSelectedClassIds(prev => 
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to student list or detail
      navigate('/students');
    } catch (err) {
      setError('학생 정보 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/students');
  };

  return (
    <AppLayout title={isEditing ? '학생 정보 수정' : '새 학생 등록'}>
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={handleCancel}
        >
          학생 목록으로 돌아가기
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
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
                {isEditing ? '학생 정보 수정' : '새 학생 정보 입력'}
              </h3>
            </div>
            
            <div className="px-6 py-5 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Input
                    id="name"
                    label="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    fullWidth
                    placeholder="학생 이름"
                  />
                </div>
                
                <div>
                  <Input
                    id="grade"
                    label="학년"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    required
                    fullWidth
                    placeholder="예: 1학년"
                  />
                </div>
              </div>
              
              <div>
                <Input
                  id="contactInfo"
                  label="연락처"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  fullWidth
                  placeholder="예: 010-1234-5678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  반 선택
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {classes.map((cls) => (
                    <div
                      key={cls.id}
                      className={`
                        border rounded-md p-4 cursor-pointer transition-colors
                        ${selectedClassIds.includes(cls.id)
                          ? 'bg-blue-50 border-blue-500'
                          : 'border-gray-300 hover:bg-gray-50'}
                      `}
                      onClick={() => handleClassToggle(cls.id)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedClassIds.includes(cls.id)}
                          onChange={() => {}}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          {cls.name}
                        </label>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 ml-6">
                        {cls.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  메모
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="학생에 대한 특이사항이나 메모를 입력하세요"
                />
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
                {isEditing ? '학생 정보 저장' : '학생 등록'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
};

export default StudentFormPage;