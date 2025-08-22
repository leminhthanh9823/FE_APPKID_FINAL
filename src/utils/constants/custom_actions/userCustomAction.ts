import { CustomAction } from '@/types/customAction';

export const UserChangePassAction: CustomAction[] = [
  {
    action: 'Change password',
    customFields: [
      {
        name: 'passwordNew',
        camelName: 'passwordNew',
        label: 'New Password',
        type: 'password',
        value: '',
        rowGroup: '1',
        colSpan: 12,
        isRequired: true,
      },
    ],
    customPath: '/change-password-admin',
  },
];
