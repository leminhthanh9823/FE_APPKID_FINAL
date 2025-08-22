
export interface IGetEditNotificationResponse {
  id: number;
  title: string | null;
  content: string | null;
  type_target: number;
  is_active: number;
  send_date: Date | null;
  grades: number[] | null;
  students: number[] | null;
}