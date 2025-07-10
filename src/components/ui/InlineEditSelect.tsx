import React, { useState, useEffect, useRef } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string | number;
  label: string;
  color?: string;
}

interface InlineEditSelectProps {
  value: string | number;
  options: Option[];
  onSave: (value: string | number) => Promise<void>;
  displayValue?: string | React.ReactNode;
  className?: string;
  disabled?: boolean;
  onOpen?: () => Promise<void> | void; // 드롭다운을 열 때 호출되는 콜백
}

export const InlineEditSelect: React.FC<InlineEditSelectProps> = ({
  value,
  options,
  onSave,
  displayValue,
  className,
  disabled = false,
  onOpen
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEditing]);

  const handleEdit = async () => {
    if (!disabled) {
      setIsEditing(true);
      
      // 드롭다운을 열기 전에 onOpen 콜백 실행 (학교 목록 갱신 등)
      if (onOpen) {
        try {
          setIsRefreshing(true);
          await onOpen();
        } catch (error) {
          console.error('Failed to refresh options:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
      
      setIsOpen(true);
    }
  };

  const handleSave = async () => {
    if (currentValue !== value) {
      setIsLoading(true);
      try {
        console.log('InlineEditSelect: Saving value', { 
          oldValue: value, 
          newValue: currentValue,
          onSave: onSave.toString()
        });
        await onSave(currentValue);
        console.log('InlineEditSelect: Save successful');
      } catch (error) {
        console.error('InlineEditSelect: Save failed', {
          oldValue: value,
          newValue: currentValue,
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined
        });
        setCurrentValue(value); // Revert on error
      } finally {
        setIsLoading(false);
      }
    }
    setIsEditing(false);
    setIsOpen(false);
  };

  const handleCancel = () => {
    console.log('InlineEditSelect: Cancelling edit', { 
      oldValue: value, 
      currentValue: currentValue 
    });
    setCurrentValue(value);
    setIsEditing(false);
    setIsOpen(false);
  };

  const handleSelect = (selectedValue: string | number) => {
    console.log('InlineEditSelect: Value selected', { 
      selectedValue,
      oldValue: value
    });
    setCurrentValue(selectedValue);
    setIsOpen(false);
    // Remove auto save - require explicit save button click
  };

  const currentOption = options.find(opt => opt.value === currentValue);
  const displayText = displayValue 
    ? (typeof displayValue === 'string' ? displayValue : currentOption?.label || String(currentValue))
    : currentOption?.label || String(currentValue);

  // 디버깅을 위한 로그 추가
  useEffect(() => {
    console.log('InlineEditSelect props:', {
      value,
      currentValue,
      options: options.slice(0, 3), // 처음 3개만 표시
      optionsCount: options.length,
      currentOption,
      displayText,
      displayValue
    });
  }, [value, currentValue, options, currentOption, displayText, displayValue]);

  if (isEditing) {
    return (
      <div ref={selectRef} className="relative inline-block min-w-32" onClick={(e) => e.stopPropagation()}>
        <div
          className={cn(
            "flex items-center justify-between w-full px-3 py-1 text-sm border border-blue-500 rounded cursor-pointer bg-white shadow-sm",
            className
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
        </div>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-50 max-h-48 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {isRefreshing ? (
              <div className="px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                목록 갱신 중...
              </div>
            ) : options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                옵션이 없습니다
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer",
                    currentValue === option.value && "bg-blue-50 text-blue-600"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option.value);
                  }}
                >
                  <span className={option.color}>{option.label}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Loading/Save/Cancel buttons */}
        <div className="absolute -right-16 top-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {isLoading || isRefreshing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                className="p-1 text-green-600 hover:bg-green-100 rounded"
                disabled={isLoading || isRefreshing}
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                className="p-1 text-red-600 hover:bg-red-100 rounded"
                disabled={isLoading || isRefreshing}
              >
                <X className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <span
      className={cn(
        "cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors",
        disabled && "cursor-default hover:bg-transparent",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        handleEdit();
      }}
      title={disabled ? undefined : "클릭하여 편집"}
    >
      {displayValue && typeof displayValue !== 'string' ? displayValue : (
        <span className={currentOption?.color}>{displayText}</span>
      )}
    </span>
  );
};

export default InlineEditSelect; 