import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { Reference } from '@/types/task';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReferenceFormProps {
  references: Reference[];
  onChange: (references: Reference[]) => void;
}

export const ReferenceForm: React.FC<ReferenceFormProps> = ({
  references,
  onChange,
}) => {
  const addReference = () => {
    if (references.length >= 3) return;
    
    const newReference: Reference = {
      id: Date.now(),
      url: '',
      isVideo: false,
      completionCondition: '없음',
    };
    
    onChange([...references, newReference]);
  };

  const updateReference = (id: number, field: keyof Reference, value: any) => {
    const updated = references.map(ref => 
      ref.id === id ? { ...ref, [field]: value } : ref
    );
    onChange(updated);
  };

  const removeReference = (id: number) => {
    onChange(references.filter(ref => ref.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">참고자료 (최대 3개)</Label>
        {references.length < 3 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addReference}
            className="h-8"
          >
            <Plus className="h-3 w-3 mr-1" />
            추가
          </Button>
        )}
      </div>

      {references.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
          참고자료를 추가해보세요
        </div>
      )}

      {references.map((reference, index) => (
        <Card key={reference.id} className="p-4">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">참고자료 {index + 1}</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeReference(reference.id)}
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            <div>
              <Label htmlFor={`url-${reference.id}`} className="text-xs">URL *</Label>
              <Input
                id={`url-${reference.id}`}
                value={reference.url}
                onChange={(e) => updateReference(reference.id, 'url', e.target.value)}
                placeholder="참고자료 URL"
                className="h-8"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`video-${reference.id}`}
                checked={reference.isVideo}
                onCheckedChange={(checked) => 
                  updateReference(reference.id, 'isVideo', checked === true)
                }
              />
              <Label htmlFor={`video-${reference.id}`} className="text-xs">
                영상 자료
              </Label>
            </div>

            <div>
              <Label htmlFor={`condition-${reference.id}`} className="text-xs">완료 조건</Label>
              <Select
                value={reference.completionCondition}
                onValueChange={(value) => updateReference(reference.id, 'completionCondition', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="완료 조건 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="없음">없음</SelectItem>
                  <SelectItem value="사진업로드">사진업로드</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
