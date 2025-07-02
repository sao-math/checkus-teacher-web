# CheckUS Teacher Web Documentation

CheckUS 선생님 웹 애플리케이션의 개발 문서입니다.

## 📁 문서 구조

### 🔧 Hooks
- [**usePhoneNumberInput**](./hooks/usePhoneNumberInput.md) - 전화번호 입력 필드를 위한 재사용 가능한 훅

### 🎨 Components
> 추후 추가 예정

### 🌐 API
> 추후 추가 예정

### 📋 Guide
> 추후 추가 예정

## 🚀 빠른 참조

### 자주 사용되는 패턴

#### 전화번호 입력 필드
```typescript
import { usePhoneNumberInput } from '@/hooks/usePhoneNumberInput';

const phoneNumber = usePhoneNumberInput({
  startsWith010: true
});

<Input
  value={phoneNumber.value}
  onChange={phoneNumber.onChange}
  className={!phoneNumber.isValid && phoneNumber.value.length > 3 ? 'border-red-500' : ''}
/>
```

#### Toast 알림 표시
```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: "성공",
  description: "작업이 완료되었습니다.",
});
```

## 📝 문서 작성 가이드

### 1. 새로운 훅 문서 추가
1. `docs/hooks/` 폴더에 `[hookName].md` 파일 생성
2. 템플릿 구조 따르기:
   - 주요 기능
   - 기본 사용법
   - API 레퍼런스
   - 사용 사례별 예제
   - 주의사항

### 2. JSDoc 주석 작성
- 모든 public API에 JSDoc 주석 추가
- `@param`, `@returns`, `@example` 태그 활용
- TypeScript 인터페이스에도 상세 설명 추가

### 3. 코드 예제
- 실제 동작하는 코드 예제 제공
- 일반적인 사용 사례와 엣지 케이스 모두 포함
- TypeScript 타입 정보 명시

## 🔄 업데이트 로그

### 2024.12 - v1.0.0
- ✅ **usePhoneNumberInput**: 전화번호 입력 훅 구현 및 문서화
- ✅ docs 폴더 구조 설정
- ✅ 문서 작성 가이드 수립

---

**📧 문의**: CheckUS 개발팀  
**🔗 프로젝트**: [CheckUS](https://github.com/checkus-project)  
**�� 최종 수정**: 2024년 12월 