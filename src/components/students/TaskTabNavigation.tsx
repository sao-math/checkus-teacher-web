
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskType } from '@/types/task';

interface TaskTabNavigationProps {
  taskTypes: TaskType[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const TaskTabNavigation: React.FC<TaskTabNavigationProps> = ({
  taskTypes,
  activeTab,
  onTabChange
}) => {
  return (
    <TabsList className="grid w-full grid-cols-3">
      {taskTypes.map((type) => (
        <TabsTrigger key={type.id} value={type.id.toString()}>
          {type.name}
        </TabsTrigger>
      ))}
      <TabsTrigger value="new">새로만들기</TabsTrigger>
    </TabsList>
  );
};
