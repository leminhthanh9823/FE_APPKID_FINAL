import { toast } from 'react-toastify';
import { ROUTES } from '../routers/routes';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { PLATFORM } from '@/utils/constants/constants';

const useLogin = () => {
  const { setIsLoading } = useLoading();

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const platform = PLATFORM.WEB;
      const { data } = await apiClient.post('/auth/login', {
        username,
        password,
        platform,
      });
      if (data.success && data.user) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('displayName', data.user.username);
        localStorage.setItem('email', data.user.email);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error: any) {
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return { login };
};

export default useLogin;
