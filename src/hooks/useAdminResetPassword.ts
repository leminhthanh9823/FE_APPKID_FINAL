import { useState } from 'react';
import { useLoading } from './useLoading';
import apiClient from '@/apis/apiRequest';
import { toast } from 'react-toastify';

interface ApiResponse{
  success: boolean;
  data: {
  };
  status: number;
}

export const useAdminResetPassword = () => {
  const { setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetPassword = async (id: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      let response = await apiClient.post<ApiResponse>(
        '/auth/admin/reset-password',
        {
          id,
          newPassword
        }
      );  

      if (response.data.success) {
        toast.success("Password reset successfully!");
      }
    } catch (err: any) {
      toast.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { resetPassword, error, success };
};
