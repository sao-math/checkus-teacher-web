# useApiCall Hook

## 개요

`useApiCall` 훅은 모든 API 호출을 표준화하고 중복 코드를 제거하기 위해 설계된 강력한 훅입니다. 자동 로딩 상태 관리, 에러 처리, 재시도 로직, 요청 취소 등을 제공합니다.

## 주요 기능

- ✅ **자동 로딩 상태 관리**
- ✅ **통합 에러 처리 및 로깅**
- ✅ **자동 재시도 로직** (exponential backoff 지원)
- ✅ **요청 취소 지원** (AbortController)
- ✅ **자동 toast 알림**
- ✅ **응답 데이터 자동 추출**
- ✅ **TypeScript 완전 지원**

## 기본 사용법

### 1. 단순 데이터 조회

```typescript
import { useApiCall } from '@/hooks/useApiCall';
import api from '@/lib/axios';

const StudentDetail = ({ studentId }: { studentId: number }) => {
  const studentApi = useApiCall(
    (id: number) => api.get(`/students/${id}`),
    { showErrorToast: true }
  );

  useEffect(() => {
    studentApi.execute(studentId);
  }, [studentId]);

  if (studentApi.loading) return <Loading />;
  if (studentApi.error) return <ErrorMessage error={studentApi.error} />;
  
  return (
    <div>
      <h1>{studentApi.data?.name}</h1>
      <p>{studentApi.data?.email}</p>
      <button onClick={studentApi.retry}>재시도</button>
    </div>
  );
};
```

### 2. 데이터 업데이트 (재시도 + 성공 알림)

```typescript
const StudentEdit = () => {
  const updateStudent = useApiCall(
    (id: number, data: StudentData) => api.put(`/students/${id}`, data),
    {
      showSuccessToast: true,
      successMessage: "학생 정보가 업데이트되었습니다",
      retry: { 
        attempts: 3, 
        delay: 1000, 
        exponentialBackoff: true 
      },
      onSuccess: (data) => navigate(`/students/${data.id}`)
    }
  );

  const handleSubmit = async (formData: StudentData) => {
    try {
      await updateStudent.execute(studentId, formData);
    } catch (error) {
      // 에러는 useApiCall에서 자동 처리됨
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 폼 내용 */}
      <button 
        type="submit" 
        disabled={updateStudent.loading}
      >
        {updateStudent.loading ? '저장 중...' : '저장'}
      </button>
    </form>
  );
};
```

### 3. 목록 조회 (자동 새로고침)

```typescript
const StudentList = () => {
  const studentsApi = useApiCall(
    (params?: GetStudentsParams) => api.get('/students', { params }),
    { showErrorToast: true }
  );

  // 초기 로드
  useEffect(() => {
    studentsApi.execute();
  }, []);

  // 필터 변경 시 재조회
  const handleFilterChange = (filters: GetStudentsParams) => {
    studentsApi.execute(filters);
  };

  return (
    <div>
      <FilterBar onFilterChange={handleFilterChange} />
      
      {studentsApi.loading && <SkeletonLoader />}
      
      {studentsApi.error && (
        <ErrorBanner 
          error={studentsApi.error} 
          onRetry={studentsApi.retry}
        />
      )}
      
      {studentsApi.data && (
        <StudentGrid students={studentsApi.data} />
      )}
      
      <button onClick={() => studentsApi.execute()}>
        새로고침
      </button>
    </div>
  );
};
```

## API 레퍼런스

### ApiCallConfig

```typescript
interface ApiCallConfig {
  showLoading?: boolean;           // 로딩 상태 표시 (기본: true)
  showErrorToast?: boolean;        // 에러 toast 표시 (기본: true)
  showSuccessToast?: boolean;      // 성공 toast 표시 (기본: false)
  successMessage?: string;         // 커스텀 성공 메시지
  errorMessage?: string;           // 커스텀 에러 메시지
  retry?: {                        // 재시도 설정
    attempts?: number;             // 재시도 횟수 (기본: 0)
    delay?: number;                // 재시도 딜레이 (기본: 1000ms)
    exponentialBackoff?: boolean;  // 지수 백오프 (기본: false)
  };
  enableAbortController?: boolean; // 요청 취소 활성화 (기본: true)
  transform?: (data: any) => any;  // 응답 데이터 변환
  onError?: (error: any) => void;  // 커스텀 에러 핸들러
  onSuccess?: (data: any) => void; // 커스텀 성공 핸들러
}
```

### UseApiCallReturn

```typescript
interface UseApiCallReturn<T> {
  // 상태
  loading: boolean;                // 로딩 상태
  data: T | null;                  // 응답 데이터
  error: Error | null;             // 에러 객체
  lastResponse: AxiosResponse | null; // 마지막 응답
  
  // 액션
  execute: (...args: any[]) => Promise<T>;  // API 호출 실행
  reset: () => void;                         // 상태 초기화
  cancel: () => void;                        // 요청 취소
  retry: () => Promise<T | null>;            // 재시도
}
```

## 고급 사용법

### 1. 응답 데이터 변환

```typescript
const studentsApi = useApiCall(
  () => api.get('/students'),
  {
    transform: (data) => ({
      students: data.items,
      totalCount: data.total,
      hasMore: data.hasNext
    })
  }
);
```

### 2. 조건부 재시도

```typescript
const criticalApi = useApiCall(
  (data) => api.post('/critical-operation', data),
  {
    retry: { 
      attempts: 5, 
      delay: 2000, 
      exponentialBackoff: true 
    },
    onError: (error) => {
      // 특정 에러 코드에 따른 처리
      if (error.response?.status === 429) {
        console.log('Rate limited, backing off...');
      }
    }
  }
);
```

### 3. 병렬 API 호출

```typescript
const StudentProfile = ({ studentId }: { studentId: number }) => {
  const studentApi = useApiCall((id: number) => api.get(`/students/${id}`));
  const scheduleApi = useApiCall((id: number) => api.get(`/schedules/student/${id}`));
  const gradesApi = useApiCall((id: number) => api.get(`/grades/student/${id}`));

  useEffect(() => {
    // 병렬 실행
    Promise.all([
      studentApi.execute(studentId),
      scheduleApi.execute(studentId),
      gradesApi.execute(studentId)
    ]);
  }, [studentId]);

  const isLoading = studentApi.loading || scheduleApi.loading || gradesApi.loading;
  const hasError = studentApi.error || scheduleApi.error || gradesApi.error;

  if (isLoading) return <Loading />;
  if (hasError) return <Error />;

  return (
    <div>
      <StudentInfo data={studentApi.data} />
      <ScheduleInfo data={scheduleApi.data} />
      <GradeInfo data={gradesApi.data} />
    </div>
  );
};
```

## 기존 코드에서 마이그레이션

### Before (기존 패턴)

```typescript
// ❌ 중복이 많은 기존 코드
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState(null);

const fetchStudent = async (studentId: number) => {
  try {
    setLoading(true);
    setError(null);
    const response = await api.get(`/students/${studentId}`);
    setData(response.data.data);
  } catch (error) {
    if (isAxiosError(error)) {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    setError(error);
    toast({
      title: "오류",
      description: "학생 정보를 불러오는데 실패했습니다",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
```

### After (useApiCall 사용)

```typescript
// ✅ 간결하고 일관된 새 코드
const studentApi = useApiCall(
  (studentId: number) => api.get(`/students/${studentId}`),
  { errorMessage: "학생 정보를 불러오는데 실패했습니다" }
);

// 사용법도 더 간단
useEffect(() => {
  studentApi.execute(studentId);
}, [studentId]);
```

## 성능 최적화 팁

### 1. 메모화된 API 함수

```typescript
const StudentList = () => {
  // API 함수를 useCallback으로 메모화
  const apiFunction = useCallback(
    (params: GetStudentsParams) => api.get('/students', { params }),
    []
  );
  
  const studentsApi = useApiCall(apiFunction);
  
  // ...
};
```

### 2. 조건부 실행

```typescript
const ConditionalApi = ({ shouldFetch, userId }: Props) => {
  const userApi = useApiCall(
    (id: number) => api.get(`/users/${id}`),
    { showLoading: shouldFetch } // 조건부 로딩 표시
  );

  useEffect(() => {
    if (shouldFetch && userId) {
      userApi.execute(userId);
    }
  }, [shouldFetch, userId]);
};
```

### 3. 요청 취소

```typescript
const SearchResults = () => {
  const searchApi = useApiCall(
    (query: string) => api.get(`/search?q=${query}`),
    { enableAbortController: true }
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchApi.execute(searchQuery);
      }
    }, 300); // 디바운싱

    return () => {
      clearTimeout(timer);
      searchApi.cancel(); // 이전 요청 취소
    };
  }, [searchQuery]);
};
```

## 에러 처리 패턴

### 1. 글로벌 에러 처리

```typescript
const globalErrorHandler = (error: any) => {
  if (error.response?.status === 401) {
    // 인증 만료 처리
    authService.logout();
    navigate('/login');
  } else if (error.response?.status >= 500) {
    // 서버 에러 로깅
    console.error('Server error:', error);
  }
};

const apiCall = useApiCall(apiFunction, {
  onError: globalErrorHandler
});
```

### 2. 컴포넌트별 에러 처리

```typescript
const UserProfile = () => {
  const userApi = useApiCall(
    (id: number) => api.get(`/users/${id}`),
    {
      showErrorToast: false, // 자동 toast 비활성화
      onError: (error) => {
        if (error.response?.status === 404) {
          navigate('/users'); // 사용자를 목록으로 리다이렉트
        }
      }
    }
  );
};
```

## 모범 사례

### ✅ 좋은 사용법

1. **일관된 설정 사용**
2. **적절한 에러 메시지 제공**
3. **로딩 상태 활용**
4. **재시도 로직 적절히 사용**
5. **요청 취소 활용**

### ❌ 피해야 할 사용법

1. **과도한 재시도 설정**
2. **불필요한 성공 toast**
3. **메모리 누수 (useEffect 정리 안함)**
4. **에러 상태 무시**

## 기존 API 서비스와 통합

useApiCall 훅은 기존 `studentApi`, `authService` 등과 완벽하게 호환됩니다:

```typescript
// 기존 studentApi 함수들을 그대로 사용
const studentDetail = useApiCall(studentApi.getStudentDetail);
const updateStudent = useApiCall(studentApi.updateStudent);
const createSchedule = useApiCall(studentApi.createWeeklySchedule);
```

---

**다음 단계**: [useCrudOperations Hook →](./useCrudOperations.md)

**관련 문서**: 
- [useForm Hook](./useForm.md)
- [useAsyncForm Hook](./useAsyncForm.md) 