export interface ICreateNotificationRequest {
  title: string;
  content: string;
  type_target: number;
  is_active: boolean;
  send_date: Date | null;
  grades: number[] | null;
  students: number[] | null;
}