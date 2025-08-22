import React from 'react';
import defaultImage from '@/assets/engkid_logo.png';
import TruncatedText from '@/components/ui/TruncatedText';

interface Column {
  key: string;
  label: string;
  format?: (value: any, row?: any) => React.ReactNode;
}

export const EBookCategoryReportColumns: Column[] = [
  {
    key: 'id',
    label: 'ID',
  },
  {
    key: 'image',
    label: 'Image',
    format: (value: string) =>
      value ? (
        <img
          src={value}
          height={60}
          alt="e-book category image"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = defaultImage;
          }}
        />
      ) : (
        <img src={defaultImage} width={40} alt="fallback image" />
      ),
  },
  {
    key: 'icon',
    label: 'Icon',
    format: (value: string) =>
      value ? (
        <img
          src={value}
          height={40}
          alt="e-book icon"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = defaultImage;
          }}
        />
      ) : (
        <img src={defaultImage} width={30} alt="fallback icon" />
      ),
  },
  {
    key: 'title',
    label: 'Category Name',
    format: (value: string) => (
      <TruncatedText text={value} maxLength={30} maxWidth="200px" />
    ),
  },
  {
    key: 'description',
    label: 'Description',
    format: (value: string) => (
      <TruncatedText text={value} maxLength={50} maxWidth="250px" />
    ),
  },
  {
    key: 'statistics',
    label: 'Total E-books',
    format: (statisticsValue: any) => {
      const totalBooks = statisticsValue?.total_ebooks ?? 0;
      return (
        <span
          style={{
            backgroundColor: '#0d6efd',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '15px',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'inline-block',
          }}
        >
          {totalBooks}
        </span>
      );
    },
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
