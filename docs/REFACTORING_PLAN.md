# CheckUS Teacher Web - 리팩토링 계획

## 📋 프로젝트 개요

CheckUS 교사 웹 애플리케이션의 코드 중복 제거 및 재사용성 향상을 위한 리팩토링 계획입니다.

**목표**:
- 코드 중복 제거 (DRY 원칙 적용)
- 재사용 가능한 훅과 컴포넌트 추출
- 유지보수성 향상
- 개발 생산성 증대

**기간**: 2024년 12월
**담당**: CheckUS Team

---

## 🎯 Phase 1: 핵심 Form 관련 훅 (최우선)

### 1.1 useForm 훅 구현
- **목적**: 범용 폼 상태 관리 통합
- **대상 파일**: `TeacherForm.tsx`, `StudentEdit.tsx`, `Register.tsx`, `ClassForm.tsx`
- **예상 효과**: 폼 관련 코드 60% 중복 제거

### 1.2 useFormValidation 훅 구현
- **목적**: 공통 검증 로직 통합
- **주요 검증**: 필수값, 전화번호, 이메일, 길이 제한
- **예상 효과**: validation 코드 80% 중복 제거

### 1.3 useAsyncForm 훅 구현
- **목적**: 비동기 폼 제출 로직 통합
- **기능**: loading, error, success 상태 관리
- **예상 효과**: API 호출 관련 코드 70% 중복 제거

---

## 🎯 Phase 2: API 관련 훅 (중간 우선순위)

### 2.1 useApiCall 훅 구현
- **목적**: 단일 API 호출 패턴 통합
- **기능**: loading, error, data 상태 자동 관리
- **대상**: 모든 API 호출 코드

### 2.2 useCrudOperations 훅 구현
- **목적**: CRUD 작업 통합 관리
- **기능**: Create, Read, Update, Delete 일괄 관리
- **대상**: Management 페이지들

### 2.3 API Error 처리 통합
- **목적**: 에러 처리 로직 표준화
- **기능**: 자동 toast, retry 로직
- **현재 파일**: `errorHandler.ts` 확장

---

## 🎯 Phase 3: UI 컴포넌트 확장 (중간 우선순위)

### 3.1 Management 페이지 컴포넌트 확장
- **기존**: `ManagementList`, `ManagementCard`
- **추가**: `ManagementPage`, `SearchAndFilter`
- **목적**: Management 페이지 구조 표준화

### 3.2 Loading State 통합
- **훅**: `useLoadingState`
- **컴포넌트**: `LoadingWrapper`, `SkeletonLoader`
- **목적**: 로딩 UI 일관성 확보

### 3.3 Toast/Notification 개선
- **훅**: `useNotification`
- **기능**: 성공/실패 메시지 패턴 통합
- **목적**: 사용자 피드백 일관성

---

## 🎯 Phase 4: 구조 개선 (낮은 우선순위, 높은 유지보수성)

### 4.1 타입 정의 통합
- **베이스 타입**: `BaseEntity`, `ApiResponse<T>`
- **CRUD 타입**: `CrudRequest<T>`, `CrudResponse<T>`
- **목적**: 타입 안전성 및 일관성 향상

### 4.2 상태 관리 최적화
- **Context 분리**: 기능별 Context 세분화
- **Cache 관리**: React Query 도입 검토
- **목적**: 성능 최적화

---

## 📊 진행 상황 추적

### 완료된 작업 ✅
- [x] `usePhoneNumberInput` 훅 구현 (기존)
- [x] 리팩토링 계획 수립

### 진행 중인 작업 🔄
- [ ] 작업 시작 예정

### 대기 중인 작업 ⏳
- [ ] Phase 1 작업들
- [ ] Phase 2 작업들
- [ ] Phase 3 작업들
- [ ] Phase 4 작업들

---

## 📈 예상 효과

### 정량적 효과
- **코드 중복 감소**: 60-80%
- **파일 수 감소**: 15-20%
- **코드 라인 수 감소**: 30-40%

### 정성적 효과
- 새로운 기능 개발 속도 향상
- 버그 발생률 감소
- 코드 리뷰 시간 단축
- 팀 생산성 향상

---

## 🚨 주의사항

1. **기존 기능 영향 최소화**: 각 단계마다 철저한 테스트
2. **점진적 적용**: 한 번에 모든 것을 바꾸지 않음
3. **문서화 병행**: 새로운 훅과 컴포넌트 사용법 문서화
4. **팀 공유**: 리팩토링 진행 상황 정기적 공유

---

## 📚 관련 문서

- [usePhoneNumberInput 훅 문서](./hooks/usePhoneNumberInput.md)
- [리팩토링 체크리스트](./REFACTORING_CHECKLIST.md)
- [새로운 훅 사용 가이드](./hooks/README.md) (예정)

---

**📝 최종 수정**: 2024년 12월  
**👨‍💻 작성자**: CheckUS Team 