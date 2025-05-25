import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { TodoItem } from '../../types';
import Button from '../../components/ui/Button';
import { Upload, FileText, Check, AlertTriangle, Download } from 'lucide-react';

interface ExcelTaskUploaderProps {
  onTasksUploaded: (tasks: Partial<TodoItem>[]) => void;
  typeId: string;
}

interface ExcelUploadResult {
  success: boolean;
  message: string;
  data?: Partial<TodoItem>[];
  previewData?: any[];
}

const ExcelTaskUploader: React.FC<ExcelTaskUploaderProps> = ({ onTasksUploaded, typeId }) => {
  const [uploadResult, setUploadResult] = useState<ExcelUploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateExcelData = (data: any[]): ExcelUploadResult => {
    if (!data || data.length === 0) {
      return { 
        success: false, 
        message: '엑셀 파일에 데이터가 없습니다.' 
      };
    }

    // 필수 열 확인
    const requiredColumns = ['title', 'description', 'isLeaf'];
    const firstRow = data[0];
    
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    if (missingColumns.length > 0) {
      return {
        success: false,
        message: `필수 열이 누락되었습니다: ${missingColumns.join(', ')}. 
                 필수 열: title(제목), description(설명), isLeaf(실제과제여부)`
      };
    }

    // 데이터 유효성 검사
    const invalidRows: number[] = [];
    data.forEach((row, index) => {
      if (!row.title || typeof row.title !== 'string') {
        invalidRows.push(index + 1);
      }
    });

    if (invalidRows.length > 0) {
      return {
        success: false,
        message: `${invalidRows.join(', ')} 행에 잘못된 데이터가 있습니다. 모든 행에 제목이 있어야 합니다.`,
        previewData: data.slice(0, 5)
      };
    }

    return {
      success: true,
      message: `${data.length}개의 할일 데이터가 준비되었습니다.`,
      data: data.map(row => ({
        title: row.title,
        description: row.description || '',
        isLeaf: row.isLeaf === 'Y' || row.isLeaf === '1' || row.isLeaf === 'true' || row.isLeaf === true,
        parentId: row.parentId || null,
        materials: row.materials ? JSON.parse(row.materials) : []
      })),
      previewData: data.slice(0, 5)
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const binaryStr = evt.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        const result = validateExcelData(data);
        setUploadResult(result);
        
        if (result.success && result.data) {
          // 업로드 성공 시 부모 컴포넌트에 데이터 전달
          onTasksUploaded(result.data);
        }
      } catch (error) {
        setUploadResult({
          success: false,
          message: `파일 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`
        });
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setUploadResult({
        success: false,
        message: '파일을 읽는 중 오류가 발생했습니다.'
      });
      setIsUploading(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const generateSampleExcel = () => {
    // 샘플 데이터 생성
    const sampleData = [
      {
        title: '수학',
        description: '수학 과제',
        isLeaf: false,
        parentId: null,
        materials: '[]'
      },
      {
        title: '기초 연산',
        description: '덧셈, 뺄셈, 곱셈, 나눗셈 연습',
        isLeaf: true,
        parentId: 'parent_id',
        materials: '[{"title":"기초 수학 문제집","isVideo":false,"completionCondition":"전체 풀이 완료"}]'
      }
    ];

    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    
    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "할일목록");
    
    // 엑셀 파일 다운로드
    XLSX.writeFile(workbook, "할일_템플릿.xlsx");
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">엑셀로 할일 일괄 업로드</h2>
        <p className="text-gray-600">
          엑셀 파일을 업로드하여 여러 할일을 한 번에 등록할 수 있습니다.
          파일에는 최소한 'title', 'description', 'isLeaf' 열이 포함되어야 합니다.
        </p>
      </div>

      <div className="mb-6 flex space-x-4">
        <Button 
          variant="primary" 
          onClick={handleButtonClick} 
          className="inline-flex items-center"
          isLoading={isUploading}
        >
          <Upload size={16} className="mr-2" />
          <span>엑셀 파일 선택</span>
        </Button>

        <Button 
          variant="outline" 
          onClick={generateSampleExcel} 
          className="inline-flex items-center"
        >
          <Download size={16} className="mr-2" />
          <span>샘플 템플릿 다운로드</span>
        </Button>

        <input
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileUpload}
          ref={fileInputRef}
        />
      </div>
      <div className="mb-4 text-sm text-gray-500">
        지원 형식: .xlsx, .xls
      </div>

      {uploadResult && (
        <div className={`p-4 rounded-md ${uploadResult.success ? 'bg-green-50' : 'bg-red-50'} mb-6`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {uploadResult.success ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${uploadResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {uploadResult.success ? '업로드 성공' : '업로드 실패'}
              </h3>
              <div className={`mt-2 text-sm ${uploadResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {uploadResult.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {uploadResult?.previewData && uploadResult.previewData.length > 0 && (
        <div className="overflow-x-auto">
          <h3 className="text-md font-medium mb-2">미리보기 (첫 5개 항목)</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(uploadResult.previewData[0]).map(key => (
                  <th
                    key={key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {uploadResult.previewData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.entries(row).map(([key, value], cellIndex) => (
                    <td key={`${rowIndex}-${cellIndex}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-md font-medium mb-2">샘플 엑셀 형식</h3>
        <div className="bg-gray-50 p-4 rounded-md text-sm font-mono whitespace-pre-wrap">
          title | description | isLeaf | parentId | materials
          -----|-------------|--------|----------|----------
          수학 | 수학 과제 | false | null | []
          기초 연산 | 덧셈, 뺄셈, 곱셈, 나눗셈 연습 | true | parent_id | [&#123;"title":"기초 수학 문제집","isVideo":false,"completionCondition":"전체 풀이 완료"&#125;]
        </div>
      </div>
    </div>
  );
};

export default ExcelTaskUploader; 