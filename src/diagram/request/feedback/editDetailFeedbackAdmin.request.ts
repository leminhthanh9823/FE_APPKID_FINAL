export interface IEditDetailFeedbackAdminRequest {
  id: number;
  is_important?: number;
  feedback_category_id?: number;
  solver_id?: number | null;
  confirmer_id?: number | null;
  deadline?: Date | null;
  status_feedback?: number;
  is_active?: number;
  comment_solve?: string;
  comment_confirm?: string;
  status_solve?: number;
  status_confirm?: number;
}