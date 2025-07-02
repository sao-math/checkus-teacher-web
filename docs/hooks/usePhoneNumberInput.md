# usePhoneNumberInput Hook

전화번호 입력 필드를 위한 재사용 가능한 React 훅입니다. 자동 포맷팅, 유효성 검증, 사용자 경험 개선 기능을 제공합니다.

## 🎯 주요 기능

- ✅ **자동 010 접두사 추가** (옵션)
- ✅ **하이픈(-) 자동 삽입** (010-xxxx-xxxx 형태)
- ✅ **실시간 유효성 검증**
- ✅ **최대 11자리 제한**
- ✅ **TypeScript 완전 지원**

## 📦 설치 및 import

```typescript
import { usePhoneNumberInput } from '@/hooks/usePhoneNumberInput';
```

## 🚀 기본 사용법

### 1. 기본 사용 (010 자동 시작)

```typescript
const MyForm = () => {
  const phoneNumber = usePhoneNumberInput({
    initialValue: '',
    startsWith010: true
  });

  return (
    <div>
      <label>전화번호</label>
      <input
        value={phoneNumber.value}
        onChange={phoneNumber.onChange}
        placeholder="010-1234-5678"
      />
      {!phoneNumber.isValid && phoneNumber.value.length > 3 && (
        <p className="error">올바른 전화번호 형식을 입력해주세요</p>
      )}
    </div>
  );
};
```

### 2. UI 컴포넌트와 함께 사용

```typescript
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TeacherForm = () => {
  const phoneNumber = usePhoneNumberInput({
    startsWith010: true
  });

  return (
    <div className="space-y-2">
      <Label htmlFor="phoneNumber">전화번호 *</Label>
      <Input
        id="phoneNumber"
        value={phoneNumber.value}
        onChange={phoneNumber.onChange}
        placeholder="010-1234-5678"
        required
        className={
          !phoneNumber.isValid && phoneNumber.value.length > 3 
            ? 'border-red-500' 
            : ''
        }
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          010으로 시작하며 자동으로 하이픈이 추가됩니다
        </p>
        {phoneNumber.value.length > 3 && (
          <p className={`text-xs ${
            phoneNumber.isValid ? 'text-green-600' : 'text-red-500'
          }`}>
            {phoneNumber.isValid ? '✓ 올바른 형식' : '✗ 잘못된 형식'}
          </p>
        )}
      </div>
    </div>
  );
};
```

## 📋 API 레퍼런스

### Props

| 속성 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `initialValue` | `string` | `''` | 초기 전화번호 값 |
| `startsWith010` | `boolean` | `true` | 010으로 자동 시작할지 여부 |

### 반환값

| 속성 | 타입 | 설명 |
|------|------|------|
| `value` | `string` | 현재 포맷된 전화번호 값 |
| `onChange` | `(e: React.ChangeEvent<HTMLInputElement>) => void` | input의 onChange 핸들러 |
| `setValue` | `(value: string) => void` | 프로그래밍 방식으로 값 설정 |
| `isValid` | `boolean` | 전화번호 유효성 검증 결과 |

## 💡 사용 사례별 예제

### Case 1: 교사 정보 입력 (010 강제)

```typescript
const TeacherForm = () => {
  const phoneNumber = usePhoneNumberInput({
    startsWith010: true  // 교사는 010 필수
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phoneNumber.isValid) {
      alert('올바른 전화번호를 입력해주세요');
      return;
    }
    // API 호출
    updateTeacher({ phoneNumber: phoneNumber.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={phoneNumber.value}
        onChange={phoneNumber.onChange}
      />
    </form>
  );
};
```

### Case 2: 일반 사용자 입력 (010 강제 없음)

```typescript
const UserForm = () => {
  const phoneNumber = usePhoneNumberInput({
    startsWith010: false  // 일반 번호도 허용
  });

  return (
    <Input
      value={phoneNumber.value}
      onChange={phoneNumber.onChange}
      placeholder="전화번호를 입력하세요"
    />
  );
};
```

### Case 3: 기존 데이터 수정

```typescript
const EditForm = ({ existingPhone }) => {
  const phoneNumber = usePhoneNumberInput({
    initialValue: existingPhone,  // 기존 데이터로 초기화
    startsWith010: true
  });

  // 프로그래밍 방식으로 값 변경
  const resetPhone = () => {
    phoneNumber.setValue('010');
  };

  return (
    <>
      <Input
        value={phoneNumber.value}
        onChange={phoneNumber.onChange}
      />
      <Button onClick={resetPhone}>초기화</Button>
    </>
  );
};
```

## ⚙️ 내부 동작 원리

### 1. 포맷팅 로직

```
입력: "01012345678"
↓
숫자 추출: "01012345678"
↓
010 접두사 체크: "01012345678" (이미 010으로 시작)
↓
길이 제한: "01012345678" (11자리 유지)
↓
하이픈 삽입: "010-1234-5678"
```

### 2. 유효성 검증

- **정규식**: `/^010-\d{4}-\d{4}$/`
- **형태**: 010-xxxx-xxxx (정확히 13자, 하이픈 포함)

### 3. startsWith010 동작

| startsWith010 | 입력 | 결과 |
|---------------|------|------|
| `true` | "1234" | "010-1234" |
| `true` | "0101234" | "010-1234" |
| `false` | "0201234" | "020-1234" |

## 🛠️ 현재 적용된 페이지

| 페이지 | 파일 경로 | startsWith010 | 용도 |
|--------|-----------|---------------|------|
| 교사 정보 수정 | `pages/TeacherForm.tsx` | `true` | 교사 전화번호 |
| 교사 회원가입 | `pages/Register.tsx` | `true` | 신규 교사 등록 |
| 학생 정보 수정 | `pages/StudentEdit.tsx` | `true` | 학생 전화번호 |

## ⚠️ 주의사항

### 1. 유효성 검증 타이밍

```typescript
// ❌ 잘못된 사용
if (!phoneNumber.isValid) {
  // 사용자가 아직 입력 중일 수 있음
}

// ✅ 올바른 사용
if (!phoneNumber.isValid && phoneNumber.value.length > 3) {
  // 어느 정도 입력한 후에만 검증
}
```

### 2. 서버 전송 시 형태

```typescript
// ✅ 하이픈 포함된 형태로 전송 (권장)
const submitData = {
  phoneNumber: phoneNumber.value  // "010-1234-5678"
};

// 또는 하이픈 제거 후 전송
const submitData = {
  phoneNumber: phoneNumber.value.replace(/-/g, '')  // "01012345678"
};
```

## 🔧 커스터마이징

### 다른 국가 번호 지원

현재는 한국 010 형태만 지원하지만, 필요 시 확장 가능:

```typescript
// 추후 확장 예시
const phoneNumber = usePhoneNumberInput({
  countryCode: 'KR',  // 'US', 'JP' 등
  format: 'mobile'    // 'landline', 'international' 등
});
```

## 📈 개선 효과

| 항목 | 이전 | 이후 |
|------|------|------|
| 코드 중복 | 4개 파일에 동일 로직 반복 | 1개 훅으로 통합 |
| 일관성 | 페이지마다 다른 동작 | 모든 곳에서 동일한 UX |
| 유지보수 | 4곳 수정 필요 | 1곳만 수정 |
| 타입 안전성 | 부분적 | 완전한 TypeScript 지원 |

## 🐛 문제 해결

### Q: 기존 전화번호가 제대로 표시되지 않아요
A: `initialValue`를 올바르게 설정했는지 확인하세요:

```typescript
// ✅ 올바른 방법
const phoneNumber = usePhoneNumberInput({
  initialValue: existingData.phoneNumber
});

// ❌ 잘못된 방법 - 렌더링 후 설정
useEffect(() => {
  phoneNumber.setValue(existingData.phoneNumber);
}, []);
```

### Q: 유효성 검증이 너무 엄격해요
A: 검증 조건을 조정하세요:

```typescript
// 더 관대한 검증
{phoneNumber.value.length >= 10 && !phoneNumber.isValid && (
  <p className="error">올바른 형식이 아닙니다</p>
)}
```

---

## 📝 체인지로그

- **v1.0.0** (2024.12): 초기 구현
  - 기본 포맷팅 및 유효성 검증
  - 010 자동 접두사 기능
  - TypeScript 지원

---

**👨‍💻 개발자**: CheckUS Team  
**�� 최종 수정**: 2024년 12월 