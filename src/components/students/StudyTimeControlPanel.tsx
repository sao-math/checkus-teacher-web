
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, Settings, Play, Loader2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";
import { StudyTimeCalendarToggle } from './StudyTimeCalendarToggle';

interface StudyTimeControlPanelProps {
  onGenerateStudyTimes: (startDate: Date, days: number) => Promise<void>;
  viewMode: 'week' | 'month';
  onViewModeChange: (mode: 'week' | 'month') => void;
}

export const StudyTimeControlPanel: React.FC<StudyTimeControlPanelProps> = ({
  onGenerateStudyTimes,
  viewMode,
  onViewModeChange
}) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [days, setDays] = useState(7);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      await onGenerateStudyTimes(startDate, days);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <Settings className="h-5 w-5" />
            제어 패널
          </CardTitle>
          
          {/* 뷰 모드 토글 추가 */}
          <StudyTimeCalendarToggle 
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* 시작일 선택 */}
          <div className="space-y-2">
            <Label>시작일</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => date && setStartDate(date)}
                dateFormat="MM/dd"
                locale={ko}
                className="w-full h-10 pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholderText="날짜 선택"
              />
            </div>
          </div>

          {/* 기간 설정 */}
          <div className="space-y-2">
            <Label>기간 (일)</Label>
            <Input
              type="number"
              value={days}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                if (value >= 1 && value <= 365) {
                  setDays(value);
                }
              }}
              min="1"
              max="365"
              className="w-full"
              placeholder="7"
            />
          </div>

          {/* 생성 버튼 */}
          <div className="space-y-2">
            <Label className="invisible">버튼</Label>
            <Button 
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  학습시간 생성
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
