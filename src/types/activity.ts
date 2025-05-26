export interface Activity {
  id: number;
  name: string;
  type: '학원' | '자습';
  isStudyAssignable: boolean;
}
