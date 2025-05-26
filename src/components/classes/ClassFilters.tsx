import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClassFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: 'all' | 'active' | 'inactive';
  onFilterChange: (status: 'all' | 'active' | 'inactive') => void;
}

const ClassFilters = ({ searchTerm, onSearchChange, filterStatus, onFilterChange }: ClassFiltersProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="반 이름, 선생님, 과목으로 검색..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={(value) => onFilterChange(value as 'all' | 'active' | 'inactive')}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassFilters;
