import React from 'react';
import defaultImage from '@/assets/engkid_logo.png';
import TruncatedText from '@/components/ui/TruncatedText';
import { getGradeText } from './readingCategoryReportColumns';

interface Column {
  key: string;
  label: string;
  format?: (value: any) => React.ReactNode;
}

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.src !== defaultImage) {
    img.src = defaultImage;
  }
};
export const ReadingCategoryColumns: Column[] = [
  {
    key: 'image',
    label: 'Image',
    format: (value: string) => (
      <img
        src={value || defaultImage}
        height={80}
        alt="ebook"
        onError={handleImageError}
      />
    ),
  },
  {
    key: 'title',
    label: 'Title',
    format: (value: string) => (
      <TruncatedText text={value} maxLength={25} maxWidth="150px" />
    ),
  },
  {
    key: 'description',
    label: 'Description',
    format: (value: string) => (
      <TruncatedText text={value} maxLength={40} maxWidth="200px" />
    ),
  },
  {
    key: 'grade_id',
    label: 'Grade',
    format: (value: number) => (
      <span
        style={{
          backgroundColor: '#28a745',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {getGradeText(value)}
      </span>
    ),
  },
  {
    key: 'is_active',
    label: 'Status',
    format: (value: any) => (
      <span
        style={{
          backgroundColor: value === 1 ? '#198754' : '#dc3545',
          color: 'white',
          padding: '2px 10px',
          borderRadius: '10px',
          fontWeight: 'bold',
          fontSize: '13px',
          display: 'inline-block',
        }}
      >
        {value === 1 ? 'Active' : 'Inactive'}
      </span>
    ),
  },
];
