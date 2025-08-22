import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ROUTES } from './routes';

export enum UserRole {
  ADMIN = 1,
  TEACHER = 2,
}

const getUserRoles = (): UserRole[] => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return [];

    const user = JSON.parse(userData);
    if (user.role_id) {
      return [user.role_id as UserRole];
    }
  } catch (error) {
    return [];
  }
  return [];
};

interface PrivateRouteProps {
  allowedRoles: UserRole[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const userRoles = getUserRoles();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const hasPermission = userRoles.some((role) => allowedRoles.includes(role));

  if (!hasPermission) {
    toast.error('You do not have permission to access this page!');
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
