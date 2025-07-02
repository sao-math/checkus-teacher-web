import { useState, useCallback } from 'react';

/**
 * usePhoneNumberInput 훅의 매개변수 인터페이스
 * @public
 */
export interface UsePhoneNumberInputProps {
  /** 초기 전화번호 값 */
  initialValue?: string;
  /** 010으로 시작하도록 강제할지 여부 (기본값: true) */
  startsWith010?: boolean;
}

/**
 * usePhoneNumberInput 훅의 반환값 인터페이스
 * @public
 */
export interface UsePhoneNumberInputReturn {
  /** 현재 포맷된 전화번호 값 (예: "010-1234-5678") */
  value: string;
  /** input의 onChange 핸들러 함수 */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** 프로그래밍 방식으로 값을 설정하는 함수 */
  setValue: (value: string) => void;
  /** 현재 전화번호가 유효한 형식인지 여부 (010-xxxx-xxxx) */
  isValid: boolean;
}

/**
 * 전화번호 입력 필드를 위한 재사용 가능한 React 훅
 * 
 * 자동으로 010 접두사를 추가하고, 하이픈을 삽입하여 사용자 친화적인
 * 전화번호 입력 경험을 제공합니다. 실시간 유효성 검증도 포함됩니다.
 * 
 * @example
 * ```typescript
 * // 기본 사용 (010 자동 시작)
 * const phoneNumber = usePhoneNumberInput({
 *   startsWith010: true
 * });
 * 
 * return (
 *   <input
 *     value={phoneNumber.value}
 *     onChange={phoneNumber.onChange}
 *     placeholder="010-1234-5678"
 *   />
 * );
 * ```
 * 
 * @example
 * ```typescript
 * // 기존 데이터 수정
 * const phoneNumber = usePhoneNumberInput({
 *   initialValue: "010-1234-5678",
 *   startsWith010: true
 * });
 * 
 * // 프로그래밍 방식으로 값 설정
 * phoneNumber.setValue("010-9876-5432");
 * ```
 * 
 * @param props - 훅 설정 옵션
 * @param props.initialValue - 초기 전화번호 값 (기본값: '')
 * @param props.startsWith010 - 010으로 자동 시작 여부 (기본값: true)
 * 
 * @returns 전화번호 입력을 위한 상태와 핸들러들
 * 
 * @since 1.0.0
 * @author CheckUS Team
 * 
 * @see {@link ../docs/hooks/usePhoneNumberInput.md} 상세 문서
 * 
 * @public
 */
export const usePhoneNumberInput = ({
  initialValue = '',
  startsWith010 = true
}: UsePhoneNumberInputProps = {}): UsePhoneNumberInputReturn => {
  
  /**
   * 전화번호를 한국 형식(010-xxxx-xxxx)으로 포맷팅하는 함수
   * 
   * @param value - 포맷팅할 원본 값
   * @param enforcePrefix - 010 접두사를 강제할지 여부
   * @returns 포맷팅된 전화번호 문자열
   * 
   * @internal
   */
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
      
      // 포맷팅: 3-4-4 패턴으로 하이픈 삽입
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

  // 초기값 포맷팅 후 상태 초기화
  const [value, setValue] = useState(() => {
    if (!initialValue) {
      return startsWith010 ? '010' : '';
    }
    return formatPhoneNumber(initialValue, startsWith010);
  });

  /**
   * input 요소의 onChange 이벤트 핸들러
   * 사용자 입력을 자동으로 포맷팅하여 상태에 반영
   */
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = formatPhoneNumber(e.target.value, startsWith010);
    setValue(newValue);
  }, [formatPhoneNumber, startsWith010]);

  /**
   * 프로그래밍 방식으로 전화번호 값을 설정하는 함수
   * API에서 받은 데이터나 기본값 설정 시 사용
   */
  const setValueDirectly = useCallback((newValue: string) => {
    const formattedValue = formatPhoneNumber(newValue, startsWith010);
    setValue(formattedValue);
  }, [formatPhoneNumber, startsWith010]);

  /**
   * 현재 전화번호가 유효한 한국 휴대폰 번호 형식인지 검증
   * 
   * @returns 010-xxxx-xxxx 형식에 맞으면 true, 아니면 false
   */
  const isValid = useCallback(() => {
    // 한국 휴대폰 번호 정규식: 010-xxxx-xxxx
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