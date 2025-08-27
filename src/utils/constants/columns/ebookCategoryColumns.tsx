import React from 'react';
import { formatTimestamp } from '@/utils/helper/formatTimeStamp';
import defaultImage from '@/assets/engkid_logo.png';
import TruncatedText from '@/components/ui/TruncatedText';
interface Column {
  key: string;
  label: string;
  format?: (value: any) => React.ReactNode;
}

export const EBookCategoryColumns: Column[] = [
  {
    key: 'icon',
    label: 'Icon',
    format: (value: string) =>
      value ? (
        <img
          src={value}
          height={80}
          alt="ebook icon"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = defaultImage;
          }}
        />
      ) : (
        <img src={defaultImage} width={50} alt="fallback icon" />
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
  // {
  //   key: 'updated_at',
  //   label: 'Last Updated',
  //   format: (value: string) => {
  //     if (!value) return 'N/A';
  //     const date = new Date(value);
  //     if (isNaN(date.getTime())) return 'Invalid Date';
  //     return date.toLocaleString('vi-VN', {
  //       hour12: false,
  //       year: 'numeric',
  //       month: '2-digit',
  //       day: '2-digit',
  //       hour: '2-digit',
  //       minute: '2-digit',
  //       second: '2-digit',
  //       timeZone: 'Asia/Ho_Chi_Minh',
  //     });
  //   },
  // },
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
        {value === 1 ? 'Active' : 'Deactive'}
      </span>
    ),
  },
];
