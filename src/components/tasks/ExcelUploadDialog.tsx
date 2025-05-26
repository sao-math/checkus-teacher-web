import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, X, Download } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ExcelUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => void;
  onTemplateDownload: () => void;
}

export const ExcelUploadDialog: React.FC<ExcelUploadDialogProps> = ({
  open,
  onOpenChange,
  onUpload,
  onTemplateDownload,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.type === 'application/vnd.ms-excel') {
      setSelectedFile(file);
    } else {
      alert('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedFile(null);
    setDragOver(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Excel 파일 업로드</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={onTemplateDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              템플릿 다운로드
            </Button>
          </div>
          <p className="text-sm text-red-800">
            업로드 시 기존 할일DB는 지워지고 덮어씌워집니다. <br />
            기존 목록을 유지하고 싶으면 먼저 다운로드 후 수정하세요.
          </p>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {selectedFile ? (
              <div className="space-y-3">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4 mr-1" />
                  제거
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-gray-600">
                    Excel 파일을 드래그하여 놓거나{' '}
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-700 underline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      클릭하여 선택
                    </button>
                    하세요
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    .xlsx, .xls 파일만 지원됩니다
                  </p>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">업로드 형식 안내</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 카테고리: 할일의 카테고리 (예: 개념, 테스트)</li>
              <li>• 상위할일ID: 상위 할일의 ID (없으면 비워두세요)</li>
              <li>• 할일ID: 할일의 고유 ID (절대 중복 x)</li>
              <li>• 제목: 할일의 제목</li>
              <li>• 설명: 할일에 대한 설명</li>
              <li>• 실제과제여부: 'Y' 또는 'N'</li>
              <li>• 완료조건: 할일의 완료 조건</li>
              <li>• 자료URL1~3: 참고 자료 URL (최대 3개)</li>
              <li>• 영상여부1~3: 각 URL이 영상인지 여부 ('Y' 또는 'N')</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              취소
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  disabled={!selectedFile}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  업로드
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>정말 업로드하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    기존 할일DB의 모든 정보가 삭제되고 새로운 데이터로 덮어씌워집니다. 이 작업은 되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={handleUpload} className="bg-blue-600 hover:bg-blue-700">
                    업로드
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
