
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ClassManagementHeaderProps {
  onCreateClick: () => void;
}

const ClassManagementHeader = ({ onCreateClick }: ClassManagementHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">반 관리</h1>
      </div>
      <Button 
        className="bg-blue-600 hover:bg-blue-700 text-white"
        onClick={onCreateClick}
      >
        <Plus className="h-4 w-4 mr-2" />
        새 반 만들기
      </Button>
    </div>
  );
};

export default ClassManagementHeader;
