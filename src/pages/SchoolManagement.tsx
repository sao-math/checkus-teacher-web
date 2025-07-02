import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Trash2, Users, School as SchoolIcon, AlertTriangle, Plus } from 'lucide-react';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { schoolApi, School } from '@/services/schoolApi';
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner';

const SchoolManagement = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [addingSchool, setAddingSchool] = useState(false);

  // useCrudOperations 훅으로 CRUD 로직 통합
  const crud = useCrudOperations<School>({
    endpoints: {
      list: schoolApi.getSchools,
      create: schoolApi.createSchool,
      delete: schoolApi.deleteSchool,
    },
    searchFields: ['name'],
    messages: {
      deleteSuccess: (school) => `"${school.name}" 학교가 삭제되었습니다.`,
      deleteError: '학교 삭제에 실패했습니다. 연결된 학생이 있는지 확인해주세요.',
      fetchError: '학교 목록을 불러오는데 실패했습니다.',
    },
  });

  const handleAddSchool = async () => {
    if (!newSchoolName.trim()) return;

    try {
      setAddingSchool(true);
      await crud.createItem!({ name: newSchoolName.trim() });
      setAddDialogOpen(false);
      setNewSchoolName('');
    } catch (error) {
      console.error('Failed to create school:', error);
    } finally {
      setAddingSchool(false);
    }
  };

  const canDeleteSchool = (school: School) => {
    return (school.studentCount || 0) === 0;
  };

  if (crud.loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">학교 관리</h1>
        <PageLoadingSpinner text="학교 목록을 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">학교 관리</h1>
        <Button onClick={() => setAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          새 학교 추가
        </Button>
      </div>

      <div className="grid gap-4">
        {crud.items.map((school) => (
          <Card key={school.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <SchoolIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">{school.name}</h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>{school.studentCount || 0}명의 학생</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {canDeleteSchool(school) ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => crud.deleteItem(school)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled 
                      className="text-gray-400 border-gray-300"
                      title={`${school.studentCount}명의 학생이 소속되어 있어 삭제할 수 없습니다`}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      삭제 불가
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {crud.items.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <SchoolIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 학교가 없습니다</h3>
              <p className="text-gray-500 mb-4">새로운 학교를 추가해보세요.</p>
              <Button onClick={() => setAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                새 학교 추가
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 새 학교 추가 다이얼로그 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 학교 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-1">
                학교명
              </label>
              <Input
                id="schoolName"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                placeholder="학교명을 입력하세요"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !addingSchool) {
                    handleAddSchool();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              취소
            </Button>
            <Button 
              onClick={handleAddSchool}
              disabled={!newSchoolName.trim() || addingSchool}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {addingSchool ? '추가 중...' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolManagement; 