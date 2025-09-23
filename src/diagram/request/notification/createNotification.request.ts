export interface ICreateNotificationRequest {
  title: string;
  content: string;
  type_target: number;
  is_active: boolean;
  send_date: Date | null;
  parents: number[] | null;
  students: number[] | null;
}