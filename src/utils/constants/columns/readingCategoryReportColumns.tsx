import React from 'react';
import defaultImage from '@/assets/engkid_logo.png';
import TruncatedText from '@/components/ui/TruncatedText';

interface Column {
  key: string;
  label: string;
  format?: (value: any, row?: any) => React.ReactNode;
}

export const ReadingCategoryReportColumns: Column[] = [
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
          alt="reading category image"
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
      <TruncatedText text={value} maxLength={40} maxWidth="220px" />
    ),
  },
  {
    key: 'statistics',
    label: 'Total Readings',
    format: (statisticsValue: any) => {
      const totalReadings = statisticsValue?.total_readings ?? 0;
      return (
        <span
          style={{
            backgroundColor: '#17a2b8',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '15px',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'inline-block',
          }}
        >
          {totalReadings}
        </span>
      );
    },
  },
  {
    key: 'statistics',
    label: 'Total Attempts',
    format: (statisticsValue: any) => {
      const totalAttempts = statisticsValue?.total_attempts ?? 0;
      return (
        <span
          style={{
            backgroundColor: '#ffc107',
            color: 'black',
            padding: '4px 12px',
            borderRadius: '15px',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'inline-block',
          }}
        >
          {totalAttempts}
        </span>
      );
    },
  },
  {
    key: 'statistics',
    label: 'Pass Rate',
    format: (statisticsValue: any) => {
      const passRateNumber = statisticsValue?.pass_rate ?? 0;
      const passRateDisplay = `${passRateNumber}%`;

      // Chọn màu dựa trên tỷ lệ thành công
      let backgroundColor = '#dc3545'; // Đỏ cho tỷ lệ thấp
      if (passRateNumber >= 80) {
        backgroundColor = '#28a745'; // Xanh lá cho tỷ lệ cao
      } else if (passRateNumber >= 60) {
        backgroundColor = '#fd7e14'; // Cam cho tỷ lệ trung bình
      }

      return (
        <span
          style={{
            backgroundColor,
            color: 'white',
            padding: '4px 12px',
            borderRadius: '15px',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'inline-block',
          }}
        >
          {passRateDisplay}
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
