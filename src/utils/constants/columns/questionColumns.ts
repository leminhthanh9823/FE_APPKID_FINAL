import React from 'react';
import { formatDateTime } from '@/utils/helper/formatDateTime';
import TruncatedText from '@/components/ui/TruncatedText';

export const QuestionColumns = [
  {
    key: 'question',
    label: 'Question',
    format: (value: any) =>
      React.createElement(TruncatedText, {
        text: value,
        maxLength: 50,
        maxWidth: '300px',
      }),
  },
  {
    key: 'question_type',
    label: 'Type',
    format: (value: any) =>
      React.createElement(TruncatedText, {
        text: value,
        maxLength: 15,
        maxWidth: '100px',
      }),
  },
  {
    key: 'question_level_id',
    label: 'Level ID',
    format: (value: any) =>
      React.createElement(TruncatedText, {
        text: value,
        maxLength: 10,
        maxWidth: '80px',
      }),
  },
  { key: 'is_active', label: 'Active' },
];
