# CheckUS Teacher Web

CheckUS 교사 웹 애플리케이션 - 학생 관리 및 교육 운영을 위한 통합 플랫폼

## 🎯 프로젝트 소개

CheckUS는 교육 기관에서 학생 관리, 교사 관리, 수업 관리 등을 효율적으로 처리할 수 있는 웹 애플리케이션입니다.

### 주요 기능
- **👩‍🎓 학생 관리**: 학생 정보 등록, 수정, 조회
- **👨‍🏫 교사 관리**: 교사 프로필 및 수업 배정 관리
- **📚 수업 관리**: 수업 일정 및 커리큘럼 관리
- **🏫 학교 관리**: 학교 정보 및 조직 관리
- **📊 대시보드**: 실시간 통계 및 현황 확인

## 🛠️ 기술 스택

### Frontend
- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **Tailwind CSS** (스타일링)
- **Shadcn/ui** (UI 컴포넌트)

### Backend API
- RESTful API 연동
- Axios 기반 HTTP 클라이언트

### 개발 도구
- **ESLint** + **Prettier**
- **Git** 버전 관리

## 🚀 시작하기

### 설치
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

### 개발 환경
- Node.js 18+
- npm 또는 yarn

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
├── pages/              # 페이지 컴포넌트
├── hooks/              # Custom React 훅
├── services/           # API 서비스
├── types/              # TypeScript 타입 정의
├── lib/                # 유틸리티 함수
└── styles/             # 전역 스타일
```

## 🔧 주요 컴포넌트

### 페이지
- **학생 관리**: 학생 목록, 등록, 수정, 상세보기
- **교사 관리**: 교사 프로필 관리
- **수업 관리**: 수업 생성 및 관리
- **대시보드**: 전체 현황 및 통계

### Custom 훅
- **useForm**: 폼 상태 관리 및 검증
- **useAsyncForm**: 비동기 폼 제출 처리
- **useApiCall**: API 호출 상태 관리
- **usePhoneNumberInput**: 전화번호 입력 처리

## 📚 문서

### 개발 문서
- [리팩토링 일지](./docs/REFACTORING.md) - 코드 개선 현황
- [Hook 사용법](./docs/hooks/) - Custom 훅 문서

### API 문서
- 서버 API 문서는 별도 제공

## 🤝 기여하기

1. 이 저장소를 Fork합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/새기능`)
3. 변경사항을 커밋합니다 (`git commit -am '새 기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feature/새기능`)
5. Pull Request를 생성합니다

### 개발 가이드라인
- 모든 코드는 TypeScript로 작성
- ESLint 규칙 준수
- 컴포넌트는 재사용 가능하게 설계
- API 호출 시 Custom 훅 사용

## 📊 현재 상태

- ✅ **기본 CRUD 기능** 구현 완료
- ✅ **폼 관리 시스템** 리팩토링 완료
- 🔄 **API 호출 패턴** 표준화 진행 중
- ⏳ **UI 컴포넌트** 확장 예정

## 📞 연락처

프로젝트 관련 문의: CheckUS 개발팀

---

**📝 최종 수정**: 2024년 12월  
**🛠️ 버전**: v1.0.0
