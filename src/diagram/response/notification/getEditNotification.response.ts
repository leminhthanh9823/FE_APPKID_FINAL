
export interface IGetEditNotificationResponse {
  id: number;
  title: string | null;
  content: string | null;
  type_target: number;
  is_active: number;
  send_date: Date | null;
  students: number[] | null;
  parents: number[] | null;
}