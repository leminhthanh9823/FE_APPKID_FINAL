import React from 'react';
import TruncatedText from '@/components/ui/TruncatedText';

export const getTeacherColumns = (isAdmin: boolean = true) => [
  {
    key: 'id',
    label: 'ID',
    width: '80px',
    format: (value: any) =>
      React.createElement(TruncatedText, {
        text: value?.toString() || '',
        maxLength: 10,
      }),
  },
  {
    key: 'username',
    label: 'Username',
    width: '150px',
    format: (value: any) =>
      React.createElement(TruncatedText, {
        text: value?.toString() || '',
        maxLength: 20,
      }),
  },
  {
    key: 'name',
    label: 'Full Name',
    width: '200px',
    format: (value: any) =>
      React.createElement(TruncatedText, {
        text: value?.toString() || '',
        maxLength: 25,
      }),
  },
  {
    key: 'email',
    label: 'Email',
    width: '200px',
    format: (value: any) =>
      React.createElement(TruncatedText, {
        text: value?.toString() || '',
        maxLength: 30,
      }),
  },
  {
    key: 'phone',
    label: 'Phone',
    width: '130px',
    format: (value: any) =>
      React.createElement(TruncatedText, {
        text: value?.toString() || '',
        maxLength: 15,
      }),
  },
  {
    key: 'gender',
    label: 'Gender',
    width: '100px',
    format: (value: any) =>
      React.createElement(TruncatedText, {
        text: value?.toString() || '',
        maxLength: 10,
      }),
  },
  {
    key: 'status',
    label: 'Status',
    width: '100px',
    format: isAdmin
      ? undefined // Admin sẽ thấy toggle button (default behavior)
      : (
          value: any // Teacher chỉ thấy text
        ) =>
          React.createElement(
            'span',
            {
              className: `badge ${value === 1 ? 'bg-success' : 'bg-danger'}`,
            },
            value === 1 ? 'Active' : 'Inactive'
          ),
  },
  {
    key: 'created_at',
    label: 'Created At',
    width: '120px',
    format: (value: any) =>
      React.createElement(TruncatedText, {
        text: value?.toString().slice(0, 10) || '',
        maxLength: 12,
      }),
  },
];

// Backward compatibility
export const TeacherColumns = getTeacherColumns(true);
