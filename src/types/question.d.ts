export interface QuestionRecord {
  id: number;
  question_level_id: number;
  kid_reading_id: number;
  grade_id: number;
  question_category_id: number;
  question: string;
  question_type: string;
  number_of_options: number;
  number_of_ans: number;
  number_of_qs: number;
  connection: string;
  is_active: boolean; 
  created_at: string; 
  updated_at: string; 
}