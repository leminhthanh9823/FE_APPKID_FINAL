export interface UserRecord {
  id: number;
  role_id: number;
  name: string;
  email: string;
  image?: string; 
  email_verified_at?: Date; 
  gender?: string;
  status: boolean; 
  username: string;
  phone?: string;
  city?: number;
  country?: string;
  dob?: string; 
  about?: string;
  short_details?: string;
  created_at?: Date;
  updated_at?: Date;
}

