import { IGetOptionsInQuestionResponse } from "./getOptionsInQuestion.response";

export interface IGetEditQuestionResponse {
  id: number;
  kid_reading_id: number;
  question_level_id: number;
  grade_id: number;
  question: string;
  question_type: string;
  number_of_options: number;
  number_of_ans: number;
  number_of_qus: number;
  connection: string;
  is_active: number;
  options: IGetOptionsInQuestionResponse[];
}