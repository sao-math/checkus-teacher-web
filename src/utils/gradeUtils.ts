/**
 * 학년 번호를 한국어 학년 표기로 변환하는 유틸리티 함수
 * @param grade 학년 번호 (1-13)
 * @returns 한국어 학년 표기 (예: "초2", "중3", "고3", "N수")
 */
export const getGradeText = (grade: number): string => {
  if (grade >= 1 && grade <= 6) {
    return `초${grade}`;
  } else if (grade >= 7 && grade <= 9) {
    return `중${grade - 6}`;
  } else if (grade >= 10 && grade <= 12) {
    return `고${grade - 9}`;
  } else if (grade === 13) {
    return 'N수';
  } else {
    return `${grade}학년`;
  }
};

/**
 * nullable한 학년을 안전하게 변환하는 함수
 * @param grade 학년 번호 또는 null/undefined
 * @returns 한국어 학년 표기 또는 빈 문자열
 */
export const getGradeTextSafe = (grade: number | null | undefined): string => {
  if (grade == null) return '';
  return getGradeText(grade);
}; 