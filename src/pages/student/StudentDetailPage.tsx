import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Book, Clock, Calendar, BookOpen } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/ui/Button';
import { Student, StudentSchedule, StudentTodo, Class } from '../../types';

// Mock data
const mockStudent: Student = {
  id: '1',
  name: '김철수',
  grade: '1학년',
  classIds: ['1'],
  contactInfo: '010-1234-5678',
  notes: '수학 과목 보충 필요',
  createdAt: '2023-03-10T09:15:00Z',
  updatedAt: '2023-04-18T11:45:00Z',
};

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

const mockSchedules: StudentSchedule[] = [
  {
    id: '1',
    studentId: '1',
    dayOfWeek: 1, // Monday
    startTime: '14:00',
    endTime: '16:00',
    subject: '수학',
    notes: '기본 연산 학습',
  },
  {
    id: '2',
    studentId: '1',
    dayOfWeek: 3, // Wednesday
    startTime: '15:00',
    endTime: '17:00',
    subject: '영어',
    notes: '기초 문법 및 독해',
  },
  {
    id: '3',
    studentId: '1',
    dayOfWeek: 5, // Friday
    startTime: '16:00',
    endTime: '18:00',
    subject: '과학',
    notes: '자연 현상 이해',
  },
];

const mockTodos: StudentTodo[] = [
  {
    id: '1',
    studentId: '1',
    todoId: '101',
    classId: '1',
    isCompleted: true,
    completedAt: '2023-04-15T14:30:00Z',
    dueDate: '2023-04-15T17:00:00Z',
    createdAt: '2023-04-10T09:00:00Z',
  },
  {
    id: '2',
    studentId: '1',
    todoId: '102',
    classId: '1',
    isCompleted: false,
    completedAt: null,
    dueDate: '2023-04-22T17:00:00Z',
    createdAt: '2023-04-17T09:00:00Z',
  },
  {
    id: '3',
    studentId: '1',
    todoId: '103',
    classId: '1',
    isCompleted: false,
    completedAt: null,
    dueDate: '2023-04-29T17:00:00Z',
    createdAt: '2023-04-24T09:00:00Z',
  },
];

// Helper for getting day name
const getDayName = (day: number): string => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[day];
};

const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [schedules, setSchedules] = useState<StudentSchedule[]>([]);
  const [todos, setTodos] = useState<StudentTodo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchStudentData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (id) {
          setStudent(mockStudent);
          setClasses(mockClasses);
          setSchedules(mockSchedules);
          setTodos(mockTodos);
        } else {
          setError('학생 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        setError('학생 정보를 로드하는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudentData();
  }, [id]);
  
  const handleEditStudent = () => {
    if (id) {
      navigate(`/students/${id}/edit`);
    }
  };
  
  const handleDeleteStudent = async () => {
    if (window.confirm('이 학생을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate('/students');
      } catch (err) {
        setError('학생 삭제에 실패했습니다.');
      }
    }
  };
  
  const handleAddSchedule = () => {
    // This would normally open a modal to add a schedule
    alert('일정 추가 기능 구현 예정');
  };
  
  const handleAddTodo = () => {
    // This would normally open a modal to add a todo
    alert('할일 추가 기능 구현 예정');
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
  
  if (error || !student) {
    return (
      <AppLayout>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || '학생 정보를 찾을 수 없습니다.'}</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Sort schedules by day of week
  const sortedSchedules = [...schedules].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <AppLayout title={student.name}>
      {/* Student Basic Info Section */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">학생 정보</h3>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit size={16} />}
              onClick={handleEditStudent}
            >
              수정
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 size={16} />}
              onClick={handleDeleteStudent}
            >
              삭제
            </Button>
          </div>
        </div>
        
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-gray-500">이름</h4>
              <p className="mt-1 text-sm text-gray-900">{student.name}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">학년</h4>
              <p className="mt-1 text-sm text-gray-900">{student.grade}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">연락처</h4>
              <p className="mt-1 text-sm text-gray-900">{student.contactInfo}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">소속 반</h4>
              <div className="mt-1 flex flex-wrap gap-2">
                {classes.map((cls) => (
                  <span 
                    key={cls.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    {cls.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500">메모</h4>
            <p className="mt-1 text-sm text-gray-900">{student.notes}</p>
          </div>
        </div>
      </div>
      
      {/* Fixed Schedule Section */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">고정 시간표</h3>
          </div>
          <Button
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={handleAddSchedule}
          >
            일정 추가
          </Button>
        </div>
        
        <div className="px-6 py-5">
          {sortedSchedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              등록된 고정 일정이 없습니다.
            </div>
          ) : (
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      요일
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      시간
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      과목
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      메모
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedSchedules.map((schedule) => (
                    <tr key={schedule.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getDayName(schedule.dayOfWeek)}요일
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Book className="h-3 w-3 mr-1" />
                          {schedule.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {schedule.notes}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Todo Calendar Section */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">할일 달력</h3>
          </div>
          <Button
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={handleAddTodo}
          >
            할일 추가
          </Button>
        </div>
        
        <div className="px-6 py-5">
          {todos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              등록된 할일이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`
                    border rounded-lg p-4
                    ${todo.isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : new Date(todo.dueDate) < new Date()
                        ? 'bg-red-50 border-red-200'
                        : 'bg-blue-50 border-blue-200'
                    }
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={todo.isCompleted}
                          readOnly
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className={`ml-2 text-sm font-medium ${todo.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          할일 #{todo.todoId}
                        </span>
                      </div>
                      <p className={`mt-1 text-xs ${todo.isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                        마감일: {new Date(todo.dueDate).toLocaleDateString()} {new Date(todo.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    
                    <div>
                      <span 
                        className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${todo.isCompleted 
                            ? 'bg-green-100 text-green-800' 
                            : new Date(todo.dueDate) < new Date()
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }
                        `}
                      >
                        {todo.isCompleted 
                          ? '완료' 
                          : new Date(todo.dueDate) < new Date()
                            ? '기한 초과'
                            : '진행 중'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentDetailPage;