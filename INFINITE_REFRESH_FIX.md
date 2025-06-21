# 무한 새로고침 문제 해결 가이드

## 문제 상황
시간표 추가 작업 실패 후 브라우저가 무한 새로고침되는 현상

## 원인 분석

### 1. **순환 Import 문제** (주요 원인)
- `axios.ts`에서 `authService` import
- `authService.ts`에서 `api` (axios instance) import
- 이로 인한 무한 의존성 루프 발생

### 2. **인증 토큰 갱신 실패 시 무한 리다이렉트**
- 401 에러 발생 시 `window.location.href = '/login'` 사용
- React Router와 충돌하여 무한 리다이렉트 발생
- 여러 API 요청이 동시에 실패할 때 중복 리다이렉트

### 3. **React useEffect 무한 루프**
- 의존성 배열에 함수나 객체 포함으로 인한 무한 재실행
- 여러 concurrent 데이터 fetch 요청

### 4. **중복 에러 토스트**
- 같은 에러가 여러 곳에서 처리되어 무한 토스트 생성

## 해결책

### 1. **순환 Import 제거**
```typescript
// axios.ts - authService import 제거
// 대신 localStorage에서 직접 토큰 접근
const token = localStorage.getItem('accessToken');
```

### 2. **안전한 인증 실패 처리**
```typescript
// 리다이렉트 플래그로 중복 방지
let isRedirecting = false;

// History API 사용으로 React Router와 호환
window.history.pushState(null, '', '/login');
window.dispatchEvent(new PopStateEvent('popstate'));
```

### 3. **useEffect 안정화**
```typescript
// 의존성 배열에서 함수 제거
useEffect(() => {
  fetchData();
}, [studentId]); // showError 제거

// concurrent fetch 방지
const isFetchingRef = useRef(false);
```

### 4. **에러 처리 Debounce**
```typescript
// 3초 내 같은 에러는 중복 표시 방지
const recentErrors = new Map<string, number>();
const ERROR_DEBOUNCE_TIME = 3000;
```

## 추가 보안 조치

### 1. **글로벌 에러 핸들러 중복 설정 방지**
```typescript
if (window.__globalErrorHandlersSetup) {
  return;
}
window.__globalErrorHandlersSetup = true;
```

### 2. **AuthContext 안정화**
```typescript
// 인증 확인 중복 방지
const isCheckingAuth = useRef(false);
```

### 3. **토큰 갱신 최적화**
```typescript
// 직접 axios 호출로 순환 참조 방지
const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {
  refreshToken
});
```

## 테스트 방법

1. **네트워크 연결 끊고 시간표 추가**
   - 에러 토스트 1회만 표시되는지 확인
   - 무한 새로고침 없는지 확인

2. **만료된 토큰으로 API 호출**
   - 로그인 페이지로 1회만 이동하는지 확인

3. **빠른 연속 페이지 이동**
   - useEffect가 중복 실행되지 않는지 확인

## 모니터링 포인트

- 브라우저 콘솔에서 "infinite loop" 경고 확인
- Network 탭에서 중복 API 요청 확인  
- Performance 탭에서 과도한 리렌더링 확인

## 적용된 파일들

1. `src/lib/axios.ts` - 순환 import 제거, 안전한 리다이렉트
2. `src/lib/errorHandler.ts` - 에러 debounce, 중복 설정 방지
3. `src/contexts/AuthContext.tsx` - 인증 상태 안정화
4. `src/pages/StudentDetails.tsx` - useEffect 최적화 