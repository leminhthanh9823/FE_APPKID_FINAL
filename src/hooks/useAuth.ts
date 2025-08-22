import { useState, useEffect } from 'react';
import { UserRole } from '@/routers/PrivateRoute';
import { UserRecord } from '@/types/user';

export const useAuth = () => {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const getUserRoles = (): UserRole[] => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return [];

      const user = JSON.parse(userData);

      if (user.role_id) {
        return [user.role_id as UserRole];
      }
      return [];
    } catch (error) {
      return [];
    }
  };

  const getUserInfo = (): UserRecord | null => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some((role) => userRoles.includes(role));
  };

  const isAdmin = (): boolean => {
    return hasRole(UserRole.ADMIN);
  };

  const isTeacher = (): boolean => {
    return hasRole(UserRole.TEACHER);
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = getUserInfo();
    const roles = getUserRoles();

    setIsAuthenticated(!!token);
    setUser(userData);
    setUserRoles(roles);
  }, []);

  return {
    user,
    userRoles,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isAdmin,
    isTeacher,
  };
};
