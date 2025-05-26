import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockClasses } from '@/data/mockClasses';
import { ClassDetailsHeader } from '@/components/classes/ClassDetailsHeader';
import { ClassBasicInfo } from '@/components/classes/ClassBasicInfo';
import { ClassQuickActions } from '@/components/classes/ClassQuickActions';
import { ClassSettings } from '@/components/classes/ClassSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClassTaskMatrix from '@/components/classes/ClassTaskMatrix';

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');

  const selectedClass = mockClasses.find(cls => cls.id === parseInt(id || ''));

  if (!selectedClass) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/classes')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">반을 찾을 수 없습니다</h3>
            <p className="text-gray-500">요청하신 반이 존재하지 않습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/classes/${id}/edit`);
  };

  const handleDelete = () => {
    toast({
      title: "반 삭제 완료",
      description: `${selectedClass.name}이(가) 삭제되었습니다.`,
      variant: "destructive",
    });
    navigate('/classes');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/classes')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{selectedClass.name}</h1>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">반 정보</TabsTrigger>
          <TabsTrigger value="tasks">할일 대시보드</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ClassBasicInfo selectedClass={selectedClass} />
            </div>
            <div className="space-y-6">
              <ClassQuickActions classId={selectedClass.id} />
              <ClassSettings onEdit={handleEdit} onDelete={handleDelete} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="tasks" className="mt-6">
          <ClassTaskMatrix classId={parseInt(id || '0')} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassDetails;
