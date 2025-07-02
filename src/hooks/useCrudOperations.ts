import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';

/**
 * CRUD 작업을 위한 설정 인터페이스
 */
export interface CrudConfig<T> {
  // API endpoints
  endpoints: {
    list: (params?: any) => Promise<T[]>;
    create?: (item: Partial<T>) => Promise<T>;
    update?: (id: string | number, item: Partial<T>) => Promise<T>;
    delete?: (id: string | number) => Promise<void>;
  };
  
  // Navigation 라우트
  routes?: {
    detail?: (item: T) => string;
    edit?: (item: T) => string;
    create?: string;
  };
  
  // 필터링 설정
  searchFields?: (keyof T)[];
  statusField?: keyof T;
  statusOptions?: Array<{value: string; label: string}>;
  
  // 메시지 설정
  messages?: {
    deleteSuccess?: (item: T) => string;
    deleteError?: string;
    fetchError?: string;
  };
  
  // 초기 필터 상태
  initialFilter?: string;
  
  // 자동 로드 여부
  autoLoad?: boolean;
}

/**
 * CRUD 작업 결과 인터페이스
 */
export interface CrudOperations<T> {
  // 상태
  items: T[];
  loading: boolean;
  error: string | null;
  
  // 검색 및 필터링
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filteredItems: T[];
  
  // CRUD 작업
  fetchItems: (params?: any) => Promise<void>;
  createItem?: (item: Partial<T>) => Promise<T>;
  updateItem?: (id: string | number, item: Partial<T>) => Promise<T>;
  deleteItem: (item: T) => Promise<void>;
  refreshItems: () => Promise<void>;
  
  // Navigation 헬퍼
  handleView: (item: T) => void;
  handleEdit: (item: T) => void;
  handleCreate: () => void;
  
  // 삭제 확인 메시지 생성
  getDeleteConfirmation: (item: T) => {
    title: string;
    description: string;
  };
}

/**
 * 공통 CRUD 작업을 관리하는 훅
 * 
 * @param config CRUD 설정
 * @returns CRUD 작업과 상태들
 */
export const useCrudOperations = <T extends {id: string | number; name?: string}>(
  config: CrudConfig<T>
): CrudOperations<T> => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // 상태 관리
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(config.initialFilter || 'all');

  // API 호출: 목록 조회
  const fetchItems = useCallback(async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      const data = await config.endpoints.list(params);
      setItems(data);
    } catch (err) {
      const errorMessage = config.messages?.fetchError || '데이터를 불러오는데 실패했습니다.';
      setError(errorMessage);
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [config.endpoints.list, config.messages?.fetchError, toast]);

  // API 호출: 생성
  const createItem = config.endpoints.create ? useCallback(async (item: Partial<T>) => {
    const result = await config.endpoints.create!(item);
    await fetchItems(); // 목록 새로고침
    return result;
  }, [config.endpoints.create, fetchItems]) : undefined;

  // API 호출: 수정
  const updateItem = config.endpoints.update ? useCallback(async (id: string | number, item: Partial<T>) => {
    const result = await config.endpoints.update!(id, item);
    await fetchItems(); // 목록 새로고침
    return result;
  }, [config.endpoints.update, fetchItems]) : undefined;

  // API 호출: 삭제
  const deleteItem = useCallback(async (item: T) => {
    if (!config.endpoints.delete) {
      throw new Error('Delete endpoint가 설정되지 않았습니다.');
    }

    try {
      await config.endpoints.delete(item.id);
      
      // UI에서 즉시 제거 (낙관적 업데이트)
      setItems(prev => prev.filter(i => i.id !== item.id));
      
      const successMessage = config.messages?.deleteSuccess 
        ? config.messages.deleteSuccess(item)
        : `${item.name || '항목'}이 삭제되었습니다.`;
        
      toast({
        title: "삭제 완료",
        description: successMessage,
      });
    } catch (err) {
      const errorMessage = config.messages?.deleteError || '삭제에 실패했습니다. 다시 시도해주세요.';
      toast({
        title: "삭제 실패",
        description: errorMessage,
        variant: "destructive",
      });
      
      // 실패 시 목록 새로고침으로 원상복구
      await fetchItems();
      throw err;
    }
  }, [config.endpoints.delete, config.messages, toast, fetchItems]);

  // 목록 새로고침
  const refreshItems = useCallback(() => fetchItems(), [fetchItems]);

  // 필터링 로직
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // 상태 필터
      const statusMatch = filterStatus === 'all' || 
        (config.statusField && item[config.statusField] === filterStatus);
      
      // 검색어 필터
      const searchMatch = !searchTerm || (config.searchFields || ['name']).some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        if (typeof value === 'number') {
          return value.toString().includes(searchTerm);
        }
        return false;
      });
      
      return statusMatch && searchMatch;
    });
  }, [items, filterStatus, searchTerm, config.statusField, config.searchFields]);

  // Navigation 헬퍼들
  const handleView = useCallback((item: T) => {
    if (config.routes?.detail) {
      navigate(config.routes.detail(item));
    }
  }, [config.routes?.detail, navigate]);

  const handleEdit = useCallback((item: T) => {
    if (config.routes?.edit) {
      navigate(config.routes.edit(item));
    }
  }, [config.routes?.edit, navigate]);

  const handleCreate = useCallback(() => {
    if (config.routes?.create) {
      navigate(config.routes.create);
    }
  }, [config.routes?.create, navigate]);

  // 삭제 확인 메시지 생성
  const getDeleteConfirmation = useCallback((item: T) => ({
    title: '정말 삭제하시겠습니까?',
    description: `${item.name || '이 항목'}의 모든 정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`
  }), []);

  // 초기 로드
  useEffect(() => {
    if (config.autoLoad !== false) {
      fetchItems();
    }
  }, [fetchItems, config.autoLoad]);

  // 필터 상태가 변경되면 다시 로드 (상태별 API 호출이 필요한 경우)
  useEffect(() => {
    if (config.statusField && filterStatus !== 'all') {
      fetchItems({ status: filterStatus });
    } else if (filterStatus === 'all') {
      fetchItems();
    }
  }, [filterStatus, config.statusField, fetchItems]);

  return {
    // 상태
    items,
    loading,
    error,
    
    // 검색 및 필터링
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredItems,
    
    // CRUD 작업
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    refreshItems,
    
    // Navigation 헬퍼
    handleView,
    handleEdit,
    handleCreate,
    getDeleteConfirmation,
  };
}; 