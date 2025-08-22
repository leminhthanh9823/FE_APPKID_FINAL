import { ICreateOptionsInQuestionRequest } from "./createOptionsInQuestion.request";

export interface ICreateQuestionRequest{
  kid_reading_id: number;
  question_level_id: number;
  question: string;
  question_type: string;
  is_active: number;
  options: ICreateOptionsInQuestionRequest[];
}