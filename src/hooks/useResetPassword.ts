import { toast } from 'react-toastify';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { ROUTES } from '@/routers/routes';
import { MESSAGE } from '@/utils/constants/errorMessage';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const useResetPassword = () => {
  const { setIsLoading } = useLoading();
  const [searchParams] = useSearchParams();

  const resetPassword = async (newPassword: string, token: string | null) => {
    setIsLoading(true);

    if (!token) {
      toast.error('Invalid authentication session, please try again!');
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await apiClient.post(
        '/auth/reset-password',
        { newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success(MESSAGE.CHANGE_PASS_SUCCESS);
        setTimeout(() => {
          window.location.href = ROUTES.LOGIN;
        }, 2000);
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error || MESSAGE.CHANGE_PASS_FAIL);
    } finally {
      setIsLoading(false);
    }
  };

  return { resetPassword };
};

export default useResetPassword;
