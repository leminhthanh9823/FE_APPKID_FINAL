export interface IGetDetailAssignFeedbackResponse {
  id: number;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  reading_id: number | null;
  reading_name: string | null;
  comment: string | null;
  rating: number | null;
  is_important: number;
  feedback_category_id: number;
  status_feedback: number;
  is_active: boolean;
  created_by: number;
  created_at: Date;
  solver_id: number | null;
  solver_name: string | null;
  status_solve: number;
  comment_solve: string | null;
  confirmer_id: number | null;
  confirmer_name: string | null;
  status_confirm: number;
  comment_confirm: string | null;
  deadline: Date | null;
}