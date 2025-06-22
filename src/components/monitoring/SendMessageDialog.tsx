import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MessageSquare, Users, AlertCircle, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import notificationApi, { NotificationTemplate } from '@/services/notificationApi';
import { MonitoringStudent } from '@/types/monitoring';

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudents: MonitoringStudent[];
  onSendComplete: () => void;
}

interface MessagePreview {
  studentName: string;
  recipient: string;
  message: string;
}

export const SendMessageDialog: React.FC<SendMessageDialogProps> = ({
  open,
  onOpenChange,
  selectedStudents,
  onSendComplete,
}) => {
  const { toast } = useToast();
  const [deliveryMethod, setDeliveryMethod] = useState<'alimtalk' | 'discord'>('alimtalk');
  const [messageType, setMessageType] = useState<'template' | 'custom'>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // 템플릿 목록 조회
  const {
    data: templatesResponse,
    isLoading: templatesLoading,
    error: templatesError,
  } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: notificationApi.getTemplates,
    enabled: open,
  });

  const templates = templatesResponse?.data || [];

  // 폼 초기화
  useEffect(() => {
    if (open) {
      setDeliveryMethod('alimtalk');
      setMessageType('template');
      setSelectedTemplateId('');
      setCustomMessage('');
      setShowPreview(false);
    }
  }, [open]);

  // 전송 가능한 학생 필터링
  const getAvailableStudents = () => {
    return selectedStudents.filter(student => {
      if (deliveryMethod === 'alimtalk') {
        return student.studentPhone && student.studentPhone.trim() !== '';
      } else {
        // Discord의 경우 discordId 확인 필요 (타입에 없으면 임시로 모든 학생 허용)
        return true; // TODO: 실제 discordId 필드가 있을 때 수정
      }
    });
  };

  const availableStudents = getAvailableStudents();
  const unavailableCount = selectedStudents.length - availableStudents.length;

  // 메시지 미리보기 생성
  const generatePreview = (): MessagePreview[] => {
    if (messageType === 'custom') {
      return availableStudents.map(student => ({
        studentName: student.studentName,
        recipient: deliveryMethod === 'alimtalk' ? student.studentPhone : 'Discord ID',
        message: customMessage,
      }));
    } else {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (!template) return [];

      return availableStudents.map(student => ({
        studentName: student.studentName,
        recipient: deliveryMethod === 'alimtalk' ? student.studentPhone : 'Discord ID',
        message: template.previewMessage.replace(/#{이름}/g, student.studentName),
      }));
    }
  };

  // 유효성 검증
  const isValid = () => {
    if (availableStudents.length === 0) return false;
    if (messageType === 'template') {
      return selectedTemplateId !== '';
    } else {
      return customMessage.trim() !== '' && deliveryMethod === 'discord';
    }
  };

  // 메시지 발송
  const handleSend = async () => {
    if (!isValid()) return;

    setIsSending(true);
    try {
      const studentIds = availableStudents.map(s => s.studentId);
      const result = await notificationApi.sendBulkNotification(
        studentIds,
        deliveryMethod,
        messageType === 'template' ? selectedTemplateId : undefined,
        messageType === 'custom' ? customMessage : undefined
      );

      if (result.success > 0) {
        toast({
          title: "메시지 발송 완료",
          description: `${result.success}명에게 성공적으로 전송되었습니다.${
            result.failed > 0 ? ` (실패: ${result.failed}명)` : ''
          }`,
        });
      }

      if (result.failed > 0 && result.errors.length > 0) {
        // 에러 상세 내용은 콘솔에만 출력
        console.error('발송 실패 상세:', result.errors);
        
        if (result.success === 0) {
          toast({
            title: "메시지 발송 실패",
            description: "모든 메시지 발송에 실패했습니다. 다시 시도해주세요.",
            variant: "destructive",
          });
        }
      }

      onSendComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to send messages:', error);
      toast({
        title: "메시지 발송 실패",
        description: "메시지 발송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>메시지 발송</span>
          </DialogTitle>
          <DialogDescription>
            선택된 {selectedStudents.length}명의 학생에게 메시지를 발송합니다.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto px-1">
          <div className="space-y-6 pr-3">
            {/* 발송 대상 정보 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>발송 대상</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">전송 가능</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {availableStudents.length}명
                  </Badge>
                </div>
                {unavailableCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">전송 불가</span>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {unavailableCount}명
                    </Badge>
                  </div>
                )}
                {unavailableCount > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {deliveryMethod === 'alimtalk' 
                        ? '전화번호가 등록되지 않은 학생은 카카오톡 메시지를 받을 수 없습니다.'
                        : '디스코드 ID가 등록되지 않은 학생은 디스코드 메시지를 받을 수 없습니다.'
                      }
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* 발송 방법 선택 */}
            <div className="space-y-3">
              <Label>발송 방법</Label>
              <RadioGroup
                value={deliveryMethod}
                onValueChange={(value) => setDeliveryMethod(value as 'alimtalk' | 'discord')}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="alimtalk" id="alimtalk" />
                  <Label htmlFor="alimtalk">카카오톡 알림톡</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="discord" id="discord" />
                  <Label htmlFor="discord">디스코드</Label>
                </div>
              </RadioGroup>
            </div>

            {/* 메시지 타입 선택 */}
            <div className="space-y-3">
              <Label>메시지 유형</Label>
              <RadioGroup
                value={messageType}
                onValueChange={(value) => setMessageType(value as 'template' | 'custom')}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="template" id="template" />
                  <Label htmlFor="template">템플릿 사용</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="custom" 
                    id="custom" 
                    disabled={deliveryMethod === 'alimtalk'}
                  />
                  <Label htmlFor="custom" className={deliveryMethod === 'alimtalk' ? 'text-gray-400' : ''}>
                    직접 입력 {deliveryMethod === 'alimtalk' && '(디스코드만 가능)'}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 템플릿 선택 */}
            {messageType === 'template' && (
              <div className="space-y-3">
                <Label>템플릿 선택</Label>
                {templatesLoading ? (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>템플릿을 불러오는 중...</span>
                  </div>
                ) : templatesError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      템플릿을 불러올 수 없습니다. 다시 시도해주세요.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <RadioGroup
                    value={selectedTemplateId}
                    onValueChange={setSelectedTemplateId}
                    className="space-y-3"
                  >
                    {templates.map((template) => (
                      <div key={template.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={template.id} id={template.id} />
                          <Label htmlFor={template.id} className="font-medium">
                            {template.name}
                          </Label>
                        </div>
                        <div className="ml-6 p-3 bg-gray-50 rounded-md text-sm">
                          <p className="text-gray-600 mb-2">{template.description}</p>
                          <p className="text-gray-800 whitespace-pre-line">
                            {template.previewMessage}
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            )}

            {/* 직접 메시지 입력 */}
            {messageType === 'custom' && (
              <div className="space-y-3">
                <Label htmlFor="custom-message">메시지 내용</Label>
                <Textarea
                  id="custom-message"
                  placeholder="보낼 메시지를 입력하세요..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={6}
                />
                <p className="text-sm text-gray-500">
                  {customMessage.length}/500자
                </p>
              </div>
            )}

            {/* 미리보기 */}
            {isValid() && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>미리보기</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? '숨기기' : '미리보기'}
                  </Button>
                </div>
                
                {showPreview && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="max-h-40 overflow-y-auto">
                        <div className="space-y-3">
                          {generatePreview().slice(0, 3).map((preview, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-md">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">{preview.studentName}</span>
                                <span className="text-xs text-gray-500">{preview.recipient}</span>
                              </div>
                              <p className="text-sm text-gray-800 whitespace-pre-line">
                                {preview.message}
                              </p>
                            </div>
                          ))}
                          {generatePreview().length > 3 && (
                            <p className="text-center text-sm text-gray-500">
                              외 {generatePreview().length - 3}명...
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-shrink-0 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!isValid() || isSending || availableStudents.length === 0}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                발송 중...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                {availableStudents.length}명에게 발송
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 