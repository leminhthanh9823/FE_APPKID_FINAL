import { formatTimestamp } from '@/utils/helper/formatTimeStamp';
import TruncatedText from '@/components/ui/TruncatedText';

const roleNameMap: Record<number, string> = {
  1: 'admin',
  2: 'teacher',
  3: 'parent',
  4: 'student',
};

export const getUserColumns = (isAdmin: boolean = true) => [
  {
    key: 'name',
    label: 'Fullname',
    format: (value: any) => (
      <TruncatedText text={value} maxLength={20} maxWidth="120px" />
    ),
  },
  {
    key: 'email',
    label: 'Email',
    format: (value: any) => (
      <TruncatedText text={value} maxLength={25} maxWidth="150px" />
    ),
  },
  {
    key: 'username',
    label: 'Username',
    format: (value: any) => (
      <TruncatedText text={value} maxLength={15} maxWidth="100px" />
    ),
  },
  {
    key: 'phone',
    label: 'Phone number',
    format: (value: any) => (
      <TruncatedText text={value} maxLength={15} maxWidth="100px" />
    ),
  },
  {
    key: 'dob',
    label: 'DOB',
    format: (value: any) => (
      <TruncatedText text={value} maxLength={12} maxWidth="90px" />
    ),
  },
  {
    key: 'role_id',
    label: 'Role',
    format: (value: number) => (
      <TruncatedText text={roleNameMap[value]} maxLength={10} maxWidth="80px" />
    ),
  },
  {
    key: 'status',
    label: 'Status',
    format: isAdmin
      ? undefined // Admin sẽ thấy toggle button (default behavior)
      : (
          value: any // Teacher chỉ thấy text
        ) => (
          <span className={`badge ${value === 1 ? 'bg-success' : 'bg-danger'}`}>
            {value === 1 ? 'Active' : 'Inactive'}
          </span>
        ),
  },
  {
    key: 'created_at',
    label: 'Registered at',
    format: (value: any) => (
      <TruncatedText text={value} maxLength={20} maxWidth="130px" />
    ),
  },
];

// Backward compatibility
export const UserColumns = getUserColumns(true);
