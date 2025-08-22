export interface RoleRecord {
  role_id: string;
  name: string;
  description: string;
  active: boolean;
  last_updated: string | null;
  functions: number[];
}
