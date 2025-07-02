# useCrudOperations Hook

Management 페이지들에서 공통으로 사용되는 CRUD 패턴을 추상화한 훅입니다.

## 🎯 **목적**

StudentManagement, TeacherManagement, ClassManagement 등에서 반복되는 다음 패턴들을 통합:
- 목록 조회 및 상태 관리
- 검색 및 필터링
- 생성/수정/삭제 작업
- Navigation 헬퍼
- 에러 처리 및 Toast 알림

## 📋 **기본 사용법**

```typescript
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { classApi } from '@/services/classApi';

const crud = useCrudOperations<Class>({
  endpoints: {
    list: classApi.getClasses,
    delete: classApi.deleteClass,
  },
  routes: {
    detail: (item) => `/classes/${item.id}`,
    edit: (item) => `/classes/${item.id}/edit`,
    create: '/classes/new',
  },
  searchFields: ['name', 'teacher'],
  statusField: 'status',
});
```

## 🔧 **CrudConfig 설정**

### **endpoints (필수)**
```typescript
endpoints: {
  list: (params?: any) => Promise<T[]>,     // 목록 조회 (필수)
  create?: (item: Partial<T>) => Promise<T>, // 생성 (선택)
  update?: (id: string | number, item: Partial<T>) => Promise<T>, // 수정 (선택)
  delete?: (id: string | number) => Promise<void>, // 삭제 (선택)
}
```

### **routes (선택)**
```typescript
routes?: {
  detail?: (item: T) => string,  // 상세보기 경로
  edit?: (item: T) => string,    // 수정 경로
  create?: string,               // 생성 경로
}
```

### **필터링 설정**
```typescript
searchFields?: (keyof T)[],              // 검색할 필드들
statusField?: keyof T,                   // 상태 필드
statusOptions?: Array<{                  // 상태 옵션들
  value: string;
  label: string;
}>,
initialFilter?: string,                  // 초기 필터 값
```

### **메시지 설정**
```typescript
messages?: {
  deleteSuccess?: (item: T) => string,   // 삭제 성공 메시지
  deleteError?: string,                  // 삭제 실패 메시지
  fetchError?: string,                   // 조회 실패 메시지
}
```

### **기타 옵션**
```typescript
autoLoad?: boolean,  // 자동 로드 여부 (기본: true)
```

## 📤 **반환값 (CrudOperations)**

### **상태 관리**
```typescript
items: T[],              // 전체 아이템 목록
loading: boolean,        // 로딩 상태
error: string | null,    // 에러 메시지
```

### **검색 및 필터링**
```typescript
searchTerm: string,                    // 검색어
setSearchTerm: (term: string) => void, // 검색어 설정
filterStatus: string,                  // 필터 상태
setFilterStatus: (status: string) => void, // 필터 상태 설정
filteredItems: T[],                    // 필터링된 아이템 목록
```

### **CRUD 작업**
```typescript
fetchItems: (params?: any) => Promise<void>,     // 목록 새로고침
createItem?: (item: Partial<T>) => Promise<T>,   // 아이템 생성
updateItem?: (id: string | number, item: Partial<T>) => Promise<T>, // 아이템 수정
deleteItem: (item: T) => Promise<void>,          // 아이템 삭제
refreshItems: () => Promise<void>,               // 목록 새로고침 (alias)
```

### **Navigation 헬퍼**
```typescript
handleView: (item: T) => void,    // 상세보기로 이동
handleEdit: (item: T) => void,    // 수정페이지로 이동
handleCreate: () => void,         // 생성페이지로 이동
```

### **유틸리티**
```typescript
getDeleteConfirmation: (item: T) => {  // 삭제 확인 메시지 생성
  title: string;
  description: string;
}
```

## 🚀 **실제 사용 예제**

### **ClassManagement.tsx**
```typescript
const ClassManagement = () => {
  const crud = useCrudOperations<Class>({
    endpoints: {
      list: classApi.getClasses,
      create: classApi.createClass,
      update: classApi.updateClass,
      delete: classApi.deleteClass,
    },
    routes: {
      detail: (cls) => `/classes/${cls.id}`,
      edit: (cls) => `/classes/${cls.id}/edit`,
      create: '/classes/new',
    },
    searchFields: ['name', 'teacher', 'schedule'],
    statusField: 'status',
    messages: {
      deleteSuccess: (cls) => `${cls.name} 클래스가 삭제되었습니다.`,
      deleteError: '클래스 삭제에 실패했습니다.',
    },
  });

  return (
    <div>
      <SearchInput 
        value={crud.searchTerm}
        onChange={crud.setSearchTerm}
      />
      <ManagementList
        items={crud.filteredItems}
        onView={crud.handleView}
        onEdit={crud.handleEdit}
        onDelete={crud.deleteItem}
        getDeleteConfirmation={crud.getDeleteConfirmation}
      />
    </div>
  );
};
```

## ✨ **주요 기능**

### **1. 자동 상태 관리**
- 로딩, 에러 상태 자동 처리
- 낙관적 업데이트 (삭제 시)
- 실패 시 자동 복구

### **2. 통합 검색/필터링**
- 여러 필드에 대한 텍스트 검색
- 상태별 필터링
- 실시간 필터링 결과

### **3. 자동화된 에러 처리**
- API 실패 시 Toast 알림
- 사용자 친화적 에러 메시지
- 에러 로깅

### **4. Navigation 통합**
- 선언적 라우트 설정
- 타입 안전한 Navigation

### **5. 메시지 커스터마이징**
- 성공/실패 메시지 개별 설정
- 동적 메시지 생성 지원

## 🔄 **Before / After 비교**

### **Before (기존 ClassManagement)**
```typescript
const [classes, setClasses] = useState<Class[]>([]);
const [loading, setLoading] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const [filterStatus, setFilterStatus] = useState('all');
const { toast } = useToast();
const navigate = useNavigate();

const fetchClasses = async () => {
  setLoading(true);
  try {
    const data = await classApi.getClasses();
    setClasses(data);
  } catch (error) {
    toast({
      title: "오류",
      description: "클래스 목록을 불러올 수 없습니다.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

const handleDelete = async (cls: Class) => {
  try {
    await classApi.deleteClass(cls.id);
    setClasses(prev => prev.filter(c => c.id !== cls.id));
    toast({
      title: "삭제 완료",
      description: `${cls.name}이 삭제되었습니다.`,
    });
  } catch (error) {
    toast({
      title: "삭제 실패",
      description: "삭제에 실패했습니다.",
      variant: "destructive",
    });
  }
};

const filteredClasses = classes.filter(cls => 
  (filterStatus === 'all' || cls.status === filterStatus) &&
  cls.name.toLowerCase().includes(searchTerm.toLowerCase())
);

// ... 50+ 줄의 반복적인 코드
```

### **After (useCrudOperations)**
```typescript
const crud = useCrudOperations<Class>({
  endpoints: { list: classApi.getClasses, delete: classApi.deleteClass },
  searchFields: ['name', 'teacher'],
  statusField: 'status',
  messages: {
    deleteSuccess: (cls) => `${cls.name}이 삭제되었습니다.`,
  },
});

// 모든 기능이 crud 객체에 통합됨!
```

## 📊 **적용 결과**

### **코드 감소**
- **ClassManagement**: 121줄 → 93줄 (**23% 감소**)
- 중복 로직 완전 제거
- Import 개수 50% 감소

### **기능 향상**
- 자동 에러 처리
- 일관된 UX 패턴
- 타입 안전성 보장

## 🎯 **향후 적용 예정**

1. **StudentManagement** - 학생 관리 페이지
2. **TeacherManagement** - 교사 관리 페이지
3. **기타 Management 페이지들**

각 페이지에서 **50-100줄의 코드 감소** 예상

---

**📝 작성일**: 2024년 12월  
**🔧 버전**: v1.0.0  
**📦 의존성**: useNavigate, useToast 