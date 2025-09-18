import { UserRole } from '@/routers/PrivateRoute';

export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: {
    canManageUsers: true,
    canManageTeachers: false,
    canManageStudents: false,
    canViewReports: true,
    canManageDashboard: true,
    canManageFeedbackAdmin: true,
    canManageFeedbackTeacher: false,
    canManageNotifications: true,
    canManageEbooks: false,
    canManageEbookCategories: false,
    canManageReadings: false,
    canManageReadingCategories: false,
    canManageTests: false,
    canManageQuestions: false,
    canViewLearningHistories: false,
    canUpdateProfile: true,
    canManageLearningPaths: false,
  },

  // Teacher permissions - Manage students, teachers (view only), teacher feedback, notifications and books
  [UserRole.TEACHER]: {
    canManageUsers: false,
    canManageTeachers: true,
    canManageStudents: true,
    canViewReports: true,
    canManageDashboard: true,
    canManageFeedbackAdmin: false,
    canManageFeedbackTeacher: true,
    canManageNotifications: true,
    canManageEbooks: true,
    canManageEbookCategories: true,
    canManageReadings: true,
    canManageReadingCategories: true,
    canManageTests: true,
    canManageQuestions: true,
    canViewLearningHistories: true,
    canUpdateProfile: true,
    canManageLearningPaths: true,
  },
};

export const hasPermission = (
  userRole: UserRole,
  permission: keyof (typeof ROLE_PERMISSIONS)[UserRole.ADMIN]
): boolean => {
  return ROLE_PERMISSIONS[userRole]?.[permission] || false;
};
