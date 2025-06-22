import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { schoolApi, School } from '@/services/schoolApi';
import { Trash2, Users, School as SchoolIcon, AlertTriangle, Plus } from 'lucide-react';

const SchoolManagement = () => {
  const { toast } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [addingSchool, setAddingSchool] = useState(false);
  const [studentCounts, setStudentCounts] = useState<Record<number, number>>({});

  const fetchSchools = async () => {
    try {
      const schoolsData = await schoolApi.getSchools();
      setSchools(schoolsData);
      
      // 학생 수는 이제 API 응답에 포함되어 있음
      const counts: Record<number, number> = {};
      schoolsData.forEach(school => {
        counts[school.id] = school.studentCount || 0;
      });
      setStudentCounts(counts);
    } catch (error) {
      console.error('Failed to fetch schools:', error);
      toast({
        title: "오류",
        description: "학교 목록을 불러오는데 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleAddSchool = async () => {
    if (!newSchoolName.trim()) return;

    try {
      setAddingSchool(true);
      const newSchool = await schoolApi.createSchool({ name: newSchoolName.trim() });
      
      // 새 학교를 목록에 추가 (학생 수는 0)
      setSchools(prev => [...prev, { ...newSchool, studentCount: 0 }]);
      setStudentCounts(prev => ({ ...prev, [newSchool.id]: 0 }));
      
      toast({
        title: "성공",
        description: `"${newSchool.name}" 학교가 추가되었습니다`,
      });
      
      setAddDialogOpen(false);
      setNewSchoolName('');
    } catch (error) {
      console.error('Failed to create school:', error);
      toast({
        title: "오류",
        description: "새 학교 추가에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setAddingSchool(false);
    }
  };

  const handleDeleteClick = async (school: School) => {
    const studentCount = studentCounts[school.id] || 0;
    
    if (studentCount > 0) {
      toast({
        title: "삭제 불가",
        description: `이 학교에 ${studentCount}명의 학생이 소속되어 있어 삭제할 수 없습니다`,
        variant: "destructive",
      });
      return;
    }

    try {
      await schoolApi.deleteSchool(school.id);
      
      setSchools(prev => prev.filter(s => s.id !== school.id));
      setStudentCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[school.id];
        return newCounts;
      });
      
      toast({
        title: "성공",
        description: `"${school.name}" 학교가 삭제되었습니다`,
      });
    } catch (error) {
      console.error('Failed to delete school:', error);
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "학교 삭제에 실패했습니다",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">학교 관리</h1>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">학교 목록을 불러오는 중...</p>
          </div>
        </div>
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
        {schools.map((school) => (
          <Card key={school.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <SchoolIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">{school.name}</h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>{studentCounts[school.id] || 0}명의 학생</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {(studentCounts[school.id] || 0) === 0 ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                          <Trash2 className="h-4 w-4 mr-1" />
                          삭제
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>학교 삭제 확인</AlertDialogTitle>
                          <AlertDialogDescription>
                            "{school.name}" 학교를 정말 삭제하시겠습니까?
                            <br />이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteClick(school)} className="bg-red-600 hover:bg-red-700">
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled 
                      className="text-gray-400 border-gray-300"
                      title={`${studentCounts[school.id]}명의 학생이 소속되어 있어 삭제할 수 없습니다`}
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
        
        {schools.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <SchoolIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 학교가 없습니다</h3>
              <p className="text-gray-500 mb-4">새로운 학교를 추가해보세요</p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                첫 번째 학교 추가
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
              <Label htmlFor="newSchoolName">학교명</Label>
              <Input
                id="newSchoolName"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                placeholder="학교명을 입력하세요"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSchoolName.trim()) {
                    handleAddSchool();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={addingSchool}>
              취소
            </Button>
            <Button onClick={handleAddSchool} disabled={!newSchoolName.trim() || addingSchool}>
              {addingSchool ? '추가 중...' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolManagement; 