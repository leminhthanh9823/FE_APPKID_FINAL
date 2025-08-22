export interface IHistoryReadingStudent {
  id: number;
  image: string;
  title: string;
  is_completed?: boolean;
  is_passed?: boolean;
  duration?: string;
  star?: boolean; 
  score?: string; 
  date?: string; 
}