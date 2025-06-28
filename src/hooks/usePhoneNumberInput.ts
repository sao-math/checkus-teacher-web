import { useState, useCallback } from 'react';

export interface UsePhoneNumberInputProps {
  initialValue?: string;
  startsWith010?: boolean; // 010으로 시작하도록 강제할지 여부
}

export interface UsePhoneNumberInputReturn {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setValue: (value: string) => void;
  isValid: boolean;
}

/**
 * 전화번호 입력 필드를 위한 훅
 * - 자동으로 010 접두사 추가
 * - 하이픈(-) 자동 삽입
 * - 유효성 검증
 */
export const usePhoneNumberInput = ({
  initialValue = '',
  startsWith010 = true
}: UsePhoneNumberInputProps = {}): UsePhoneNumberInputReturn => {
  
  const formatPhoneNumber = useCallback((value: string, enforcePrefix: boolean = startsWith010) => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, '');
    
    // 빈 값이면 010으로 시작하도록 설정 (startsWith010이 true인 경우)
    if (numbers.length === 0) {
      return enforcePrefix ? '010' : '';
    }
    
    // 010으로 강제 시작하는 경우
    if (enforcePrefix) {
      // 010으로 시작하지 않으면 010 추가
      let finalNumbers = numbers;
      if (!numbers.startsWith('010')) {
        finalNumbers = '010' + numbers;
      }
      
      // 최대 11자리 (010-xxxx-xxxx)
      finalNumbers = finalNumbers.slice(0, 11);
      
      // 포맷팅
      if (finalNumbers.length <= 3) {
        return finalNumbers;
      } else if (finalNumbers.length <= 7) {
        return `${finalNumbers.slice(0, 3)}-${finalNumbers.slice(3)}`;
      } else {
        return `${finalNumbers.slice(0, 3)}-${finalNumbers.slice(3, 7)}-${finalNumbers.slice(7)}`;
      }
    } else {
      // 일반적인 포맷팅 (010 강제 없음)
      if (numbers.length <= 3) {
        return numbers;
      } else if (numbers.length <= 7) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      } else {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
      }
    }
  }, [startsWith010]);

  // 초기값 포맷팅
  const [value, setValue] = useState(() => {
    if (!initialValue) {
      return startsWith010 ? '010' : '';
    }
    return formatPhoneNumber(initialValue, startsWith010);
  });

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = formatPhoneNumber(e.target.value, startsWith010);
    setValue(newValue);
  }, [formatPhoneNumber, startsWith010]);

  const setValueDirectly = useCallback((newValue: string) => {
    const formattedValue = formatPhoneNumber(newValue, startsWith010);
    setValue(formattedValue);
  }, [formatPhoneNumber, startsWith010]);

  // 유효성 검증
  const isValid = useCallback(() => {
    // 010-xxxx-xxxx 형태 검증
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    return phoneRegex.test(value);
  }, [value]);

  return {
    value,
    onChange,
    setValue: setValueDirectly,
    isValid: isValid()
  };
}; 