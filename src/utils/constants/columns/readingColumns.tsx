import React from 'react';
import { formatTimestamp } from '@/utils/helper/formatTimeStamp';
import defaultImage from '@/assets/engkid_logo.png';
import TruncatedText from '@/components/ui/TruncatedText';
export interface Column {
  key: string;
  label: string;
  format?: (value: any) => React.ReactNode;
}

export const ReadingColumns: Column[] = [
  {
    key: 'image',
    label: 'Image',
    format: (value: string) => (
      <img
        src={value || defaultImage}
        height={80}
        alt="reading"
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== defaultImage) {
            target.src = defaultImage;
          }
        }}
      />
    ),
  },
  {
    key: 'title',
    label: 'Title',
    format: (value: any) => (
      <TruncatedText text={value} maxLength={30} maxWidth="150px" />
    ),
  },
  {
    key: 'category_title',
    label: 'Category',
    format: (value: any) => {
      return value || 'N/A';
    },
  },
  {
    key: 'is_active',
    label: 'Status',
    format: (value: any) => (
      <span
        style={{
          backgroundColor: value === true ? '#198754' : '#dc3545',
          color: 'white',
          padding: '2px 10px',
          borderRadius: '10px',
          fontWeight: 'bold',
          fontSize: '13px',
          display: 'inline-block',
        }}
      >
        {value === true ? 'Active' : 'Deactive'}
      </span>
    ),
  },
  {
    key: 'difficulty_level',
    label: 'Difficulty',
    format: (value: any) => {
      if (typeof value === 'number') {
        return `Level ${value}`;
      }
      return 'N/A';
    },
  },
];
