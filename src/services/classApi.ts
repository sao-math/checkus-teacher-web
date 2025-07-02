import { Class } from '@/types/class';
import { mockClasses } from '@/data/mockClasses';

/**
 * Class API 서비스
 * Mock 데이터를 기반으로 CRUD 작업을 시뮬레이션합니다.
 */
class ClassApiService {
  private classes: Class[] = [...mockClasses];
  private nextId = Math.max(...mockClasses.map(c => c.id)) + 1;

  /**
   * 모든 클래스 목록을 조회합니다.
   * @param params 조회 파라미터 (status 등)
   */
  async getClasses(params?: { status?: string }): Promise<Class[]> {
    // API 호출 시뮬레이션 (지연)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let result = [...this.classes];
    
    // 상태 필터링
    if (params?.status && params.status !== 'all') {
      result = result.filter(cls => cls.status === params.status);
    }
    
    return result;
  }

  /**
   * 특정 클래스를 조회합니다.
   * @param id 클래스 ID
   */
  async getClass(id: number): Promise<Class | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const cls = this.classes.find(c => c.id === id);
    return cls || null;
  }

  /**
   * 새로운 클래스를 생성합니다.
   * @param classData 클래스 생성 데이터
   */
  async createClass(classData: Partial<Class>): Promise<Class> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newClass: Class = {
      id: this.nextId++,
      name: classData.name || '',
      teacher: classData.teacher || '',
      schedule: classData.schedule || '',
      status: classData.status || 'active',
      studentCount: classData.studentCount || 0,
      maxStudents: classData.maxStudents,
      description: classData.description,
    };
    
    this.classes.push(newClass);
    return newClass;
  }

  /**
   * 클래스 정보를 수정합니다.
   * @param id 클래스 ID
   * @param classData 수정할 클래스 데이터
   */
  async updateClass(id: number, classData: Partial<Class>): Promise<Class> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = this.classes.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`클래스를 찾을 수 없습니다. ID: ${id}`);
    }
    
    this.classes[index] = {
      ...this.classes[index],
      ...classData,
      id, // ID는 변경 불가
    };
    
    return this.classes[index];
  }

  /**
   * 클래스를 삭제합니다.
   * @param id 클래스 ID
   */
  async deleteClass(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.classes.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`클래스를 찾을 수 없습니다. ID: ${id}`);
    }
    
    this.classes.splice(index, 1);
  }

  /**
   * 클래스 이름 중복 확인
   * @param name 클래스 이름
   * @param excludeId 제외할 클래스 ID (수정 시)
   */
  async checkClassNameExists(name: string, excludeId?: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return this.classes.some(cls => 
      cls.name === name && cls.id !== excludeId
    );
  }

  /**
   * 클래스 상태를 변경합니다.
   * @param id 클래스 ID
   * @param status 새로운 상태
   */
  async updateClassStatus(id: number, status: 'active' | 'inactive'): Promise<Class> {
    return this.updateClass(id, { status });
  }
}

// 싱글톤 인스턴스 생성
export const classApi = new ClassApiService();

// 편의를 위한 개별 함수들 export
export const {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  checkClassNameExists,
  updateClassStatus,
} = classApi; 