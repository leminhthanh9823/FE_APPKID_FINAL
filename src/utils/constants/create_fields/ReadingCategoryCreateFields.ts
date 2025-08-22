// src/utils/constants/create_fields/ebookCategoryCreateFields.ts

import Field from '@/types/field';
import { GRADE_UC_OPTIONS, STATUS_UC_OPTIONS } from '../options';

export const ReadingCategoryCreateFields: Field[] = [
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    value: '',
    isRequired: true,
    colSpan: 12,
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    value: '',
    isRequired: false,
    colSpan: 12,
  },
  {
    name: 'image',
    label: 'Image',
    type: 'file',
    value: '',
    isRequired: true,
    colSpan: 12,
  },
  {
    name: 'grade_id',
    label: 'Grade',
    isRequired: true,
    type: 'select',
    value: '',
    colSpan: 12,
    options: GRADE_UC_OPTIONS,
  },
  {
    name: 'is_active',
    label: 'Status',
    type: 'select',
    value: 1,
    isRequired: true,
    colSpan: 12,
    options: STATUS_UC_OPTIONS,
  },
];
