import { toast } from 'react-toastify';
import { ROUTES } from '../routers/routes';
import { useLoading } from './useLoading';

const useLogout = () => {
  const { setIsLoading } = useLoading();
  const logout = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('roleName');
      localStorage.removeItem('user');
      localStorage.removeItem('displayName');
      localStorage.removeItem('email');
      window.location.href = ROUTES.LOGIN;
    } catch (error: any) {
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return { logout };
};
export default useLogout;
