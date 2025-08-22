import React from 'react';
import { formatDateTime } from "@/utils/helper/formatDateTime";
import defaultImage from '@/assets/engkid_logo.png';
import TruncatedText from '@/components/ui/TruncatedText';
import { FEEDBACK_IMPORTANCE_OPTIONS, FEEDBACK_STATUS_OPTIONS, FEEDBACK_STATUS_SOLVE_OPTIONS } from '@/utils/constants/options';

interface Column {
  key: string;
  label: string;
  format?: (value: any) => React.ReactNode;
}
export const FeedbackColumns: Column[] = [
  {
    key: 'category',
    label: 'Category',
  },
  {
    key: 'is_important',
    label: 'Important level',
    format: (value: number) => {
      const option = FEEDBACK_IMPORTANCE_OPTIONS.find(opt => opt.value === value);
      if (!option) return '';
      
      // Định nghĩa màu sắc cho từng mức độ quan trọng
      let badgeClass = '';
      let customStyle = {};
      
      switch (value) {
        case 0: // Low
          badgeClass = 'badge bg-success';
          break;
        case 1: // Medium
          badgeClass = 'badge bg-warning text-dark';
          break;
        case 2: // High
          badgeClass = 'badge bg-danger';
          break;
        case 3: // Urgent
          badgeClass = 'badge';
          customStyle = { backgroundColor: '#6f42c1', color: 'white' };
          break;
        default:
          badgeClass = 'badge bg-secondary';
      }
      
      return React.createElement('span', { 
        className: badgeClass, 
        style: customStyle 
      }, option.label);
    },
  },
  {
    key: 'status_feedback',
    label: 'Status',
    format: (value: number) => {
      const option = FEEDBACK_STATUS_OPTIONS.find(opt => opt.value === value);
      if (!option) return '';
      
      // Định nghĩa màu sắc cho từng mức độ quan trọng
      let badgeClass = '';
      let customStyle = {};
      
      switch (value) {
        case 0: // Low
          badgeClass = 'badge';
          customStyle = { backgroundColor: '#555555ff', color: 'white' };
          break;
        case 1: // Medium
          badgeClass = 'badge';
          customStyle = { backgroundColor: '#0011ffff', color: 'white' };
          break;
        case 2: // High
          badgeClass = 'badge';
          customStyle = { backgroundColor: '#33ff00ff', color: 'white' };   
          break;
        case 3: // Urgent
          badgeClass = 'badge';
          customStyle = { backgroundColor: '#940000ff', color: 'white' };
          break;
        default:
          badgeClass = 'badge bg-secondary';
      }
      
      return React.createElement('span', { 
        className: badgeClass, 
        style: customStyle 
      }, option.label);
    },
  },
  {
    key: 'parent',
    label: 'Parent',
  },
  {
    key: 'rating',
    label: 'Rating',
  },
  {
    key: 'reading',
    label: 'Reading',
    format: (value : string) => value ?? "", 
  },
  {
    key: 'solver',
    label: 'Solver',
    format: (value : string) => value ?? "", 
  },
  {
    key: 'status_solve',
    label: 'Status solve',
    format: (value: number) => {
      const option = FEEDBACK_STATUS_SOLVE_OPTIONS.find(opt => opt.value === value);
      if (!option) return '';
      
      // Định nghĩa màu sắc cho từng mức độ quan trọng
      let badgeClass = '';
      let customStyle = {};
      
      switch (value) {
        case 0: // Low
          badgeClass = 'badge';
          customStyle = { backgroundColor: '#555555ff', color: 'white' };
          break;
        case 1: // In Progress
          badgeClass = 'badge';
          customStyle = { backgroundColor: '#0011ffff', color: 'white' };
          break;
        case 2: // Solve
          badgeClass = 'badge bg-success';
          break;
        case 3: // Closed
          badgeClass = 'badge';
          customStyle = { backgroundColor: '#940000ff', color: 'white' };
          break;
        default:
          badgeClass = 'badge bg-secondary';
      }
      
      return React.createElement('span', { 
        className: badgeClass, 
        style: customStyle 
      }, option.label);
    },
  },
  {
    key: 'confirmer',
    label: 'Confirmer',
    format: (value : string) => value ?? "", 
  },
  {
    key: 'status_confirm',
    label: 'Status confirm',
    format: (value: number) => {
      const option = FEEDBACK_STATUS_SOLVE_OPTIONS.find(opt => opt.value === value);
      if (!option) return '';
      
      // Định nghĩa màu sắc cho từng mức độ quan trọng
      let badgeClass = '';
      let customStyle = {};
      
      switch (value) {
        case 0: // Low
          badgeClass = 'badge';
          customStyle = { backgroundColor: '#555555ff', color: 'white' };
          break;
        case 1: // Medium
          badgeClass = 'badge';
          customStyle = { backgroundColor: '#0011ffff', color: 'white' };
          break;
        case 2: // High
          badgeClass = 'badge bg-success';
          break;
        case 3: // Urgent
          badgeClass = 'badge';
          customStyle = { backgroundColor: '#940000ff', color: 'white' };
          break;
        default:
          badgeClass = 'badge bg-secondary';
      }
      
      return React.createElement('span', { 
        className: badgeClass, 
        style: customStyle 
      }, option.label);
    },
  },
  {
    key: 'deadline',
    label: 'Deadline',
    format: (value : string) => value ? formatDateTime(value) : "",
  },
  {
    key: 'is_active',
    label: 'Active',
    format: (value: boolean) => {
      return value ? 
        React.createElement('span', { className: 'badge bg-success' }, 'Solved') :
        React.createElement('span', { className: 'badge bg-danger' }, 'Not Solved');
    },
  },
];