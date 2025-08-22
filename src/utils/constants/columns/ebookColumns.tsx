import React from 'react';
import { formatTimestamp } from '@/utils/helper/formatTimeStamp';
import defaultImage from '@/assets/engkid_logo.png';
import TruncatedText from '@/components/ui/TruncatedText';

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

export const EBookColumns: Column[] = [
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
      <TruncatedText text={value} maxLength={30} maxWidth="150px" />
    ),
  },
  {
    key: 'categories',
    label: 'Category',
    format: (value: any) => {
      let displayText = 'N/A';
      if (value) {
        if (Array.isArray(value)) {
          displayText = value.map((v) => v.title).join(', ');
        } else {
          displayText = typeof value === 'object' ? value.title : value;
        }
      }
      return (
        <TruncatedText text={displayText} maxLength={210} maxWidth="300px" />
      );
    },
  },
  {
    key: 'is_active',
    label: 'Status',
    format: (value: number) => (
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
        {value === 1 ? 'Active' : 'Deactive'}
      </span>
    ),
  },
  {
    key: 'updated_at',
    label: 'Last Updated',
    format: (value: string) => {
      if (!value) return 'N/A';
      const date = new Date(value.replace(' ', 'T'));
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString('vi-VN', {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    },
  },
];