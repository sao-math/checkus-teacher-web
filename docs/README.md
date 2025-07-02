# CheckUS Teacher Web - 문서

프로젝트 리팩토링 관련 문서들입니다.

## 📋 문서 목록

### 📊 **[리팩토링 일지](./REFACTORING.md)** ⭐
- **메인 문서**: 현재 진행 상황 및 성과
- 실제 측정된 코드 감소량: **366줄**
- 완료된 훅들: useForm, useAsyncForm, useApiCall 등

### 🛠️ **개별 훅 문서**
- [📋 useForm](./hooks/useForm.md) - 폼 상태 관리
- [🚀 useAsyncForm](./hooks/useAsyncForm.md) - 비동기 폼 제출  
- [🌐 useApiCall](./hooks/useApiCall.md) - API 호출 관리
- [📞 usePhoneNumberInput](./hooks/usePhoneNumberInput.md) - 전화번호 입력

---

## 🚀 빠른 사용법

### 폼 개발
```typescript
import { useForm, useAsyncForm } from '@/hooks';

const form = useForm({ /* 설정 */ });
const asyncForm = useAsyncForm({ /* 설정 */ });
```

### API 호출
```typescript
import { useApiCall } from '@/hooks/useApiCall';

const api = useApiCall(() => fetch('/api/data'));
```

---

**💡 시작하기**: [리팩토링 일지](./REFACTORING.md)부터 읽어보세요!
