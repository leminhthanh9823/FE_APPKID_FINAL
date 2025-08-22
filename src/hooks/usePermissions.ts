import { toast } from 'react-toastify';
import { UserRole } from '@/routers/PrivateRoute';
import { ROLE_PERMISSIONS } from '@/utils/constants/rolePermissions';
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { userRoles, isAdmin, isTeacher } = useAuth();

  const hasPermission = (
    permission: keyof (typeof ROLE_PERMISSIONS)[UserRole.ADMIN]
  ): boolean => {
    if (userRoles.length === 0) return false;

    return userRoles.some(
      (role) => ROLE_PERMISSIONS[role]?.[permission] || false
    );
  };

  const checkPermissionWithToast = (
    permission: keyof (typeof ROLE_PERMISSIONS)[UserRole.ADMIN]
  ): boolean => {
    const hasAccess = hasPermission(permission);

    if (!hasAccess) {
      toast.error('You do not have permission to access this feature!');
    }

    return hasAccess;
  };

  const getMenuPermissions = () => {
    return {
      canAccessDashboard: hasPermission('canManageDashboard'),

      canAccessEbooks: hasPermission('canManageEbooks'),
      canAccessEbookCategories: hasPermission('canManageEbookCategories'),
      canAccessReadings: hasPermission('canManageReadings'),
      canAccessReadingCategories: hasPermission('canManageReadingCategories'),
      canAccessQuestions: hasPermission('canManageQuestions'),

      canAccessUsers: hasPermission('canManageUsers'),
      canAccessStudents: hasPermission('canManageStudents'),
      canAccessTeachers: hasPermission('canManageTeachers'),

      canAccessReports: hasPermission('canViewReports') && isAdmin(),

      canAccessNotifications: hasPermission('canManageNotifications'),

      canAccessFeedbackAdmin: hasPermission('canManageFeedbackAdmin'),
      canAccessFeedbackTeacher: hasPermission('canManageFeedbackTeacher'),
    };
  };

  return {
    hasPermission,
    checkPermissionWithToast,
    getMenuPermissions,
    isAdmin,
    isTeacher,
  };
};
