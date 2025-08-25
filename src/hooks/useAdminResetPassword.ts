import { useState } from 'react';
import { resetPasswordByAdmin } from '../apis/resetPasswordByAdmin';

export const useAdminResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetPassword = async (id: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await resetPasswordByAdmin(id, newPassword);
      if (res.data.success) {
        setSuccess(true);
      } else {
        setError(res.data.message || 'Reset failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading, error, success };
};
