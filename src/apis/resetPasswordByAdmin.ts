import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL as string;

export const resetPasswordByAdmin = async (id: string, newPassword: string) => {
  return axios.post(`${API_URL}/auth/admin/reset-password`, { id, newPassword });
};
