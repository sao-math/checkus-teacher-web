import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/ui/Button';
import { Class, CompletionRate } from '../../types';
import { colors } from '../../styles/colors';

const mockClass: Class = {
  id: '1',
  name: '1학년 2반',
  description: '기초 과정 반',
  teacherId: '2',
  studentCount: 3,
  createdAt: '2023-03-10T09:15:00Z',
  updatedAt: '2023-04-18T11:45:00Z',
};

const mockCompletionRates: CompletionRate[] = [
  {
    studentId: '1',
    studentName: '김철수',
    completedCount: 15,
    totalCount: 20,
    rate: 0.75,
    dailyCompletions: generateMockDailyData(0.75),
  },
  {
    studentId: '2',
    studentName: '박영희',
    completedCount: 18,
    totalCount: 20,
    rate: 0.9,
    dailyCompletions: generateMockDailyData(0.9),
  },
  {
    studentId: '3',
    studentName: '이지민',
    completedCount: 12,
    totalCount: 20,
    rate: 0.6,
    dailyCompletions: generateMockDailyData(0.6),
  },
];

function generateMockDailyData(baseRate: number): StudentDailyCompletion[] {
  const days = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 30);

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const variance = Math.random() * 0.4 - 0.2;
    const rate = Math.max(0, Math.min(1, baseRate + variance));
    
    days.push({
      date: date.toISOString(),
      completedCount: Math.floor(Math.random() * 5),
      totalCount: 5,
      rate,
    });
  }

  return days;
}

const ClassDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<Class | null>(null);
  const [completionRates, setCompletionRates] = useState<CompletionRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (id) {
          setClassData(mockClass);
          setCompletionRates(mockCompletionRates);
        } else {
          setError('반 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        setError('대시보드 데이터를 로드하는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [id]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getCompletionColor = (completion: number | null, date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date > today) return 'bg-gray-200';
    if (completion === null) return 'bg-red-500';
    if (completion === 1) return 'bg-green-500';
    if (completion > 0) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleBackToClass = () => {
    navigate(`/classes/${id}`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
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

  const daysInMonth = getDaysInMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <AppLayout title={`${classData.name} - 할일 완수율`}>
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={handleBackToClass}
        >
          반 상세 정보로 돌아가기
        </Button>
      </div>

      <div className={`bg-${colors.background2} shadow-sm rounded-lg overflow-hidden`}>
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월 할일 완수율
          </h3>
        </div>

        <div className="px-6 py-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  학생 이름
                </th>
                {days.map(day => (
                  <th key={day} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {completionRates.map(student => (
                <tr key={student.studentId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.studentName}
                  </td>
                  {student.dailyCompletions.map((completion, index) => (
                    <td key={index} className="px-2 py-4">
                      <div className="flex justify-center">
                        <div
                          className={`w-3 h-3 rounded-full ${getCompletionColor(completion.rate, new Date(completion.date))}`}
                          title={`${new Date(completion.date).toLocaleDateString()}: ${(completion.rate * 100).toFixed(1)}%`}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClassDashboardPage;