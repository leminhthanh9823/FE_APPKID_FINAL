// src/utils/constants/create_fields/ebookCategoryCreateFields.ts

import Field from '@/types/field';
import { STATUS_UC_OPTIONS } from '../options';

export const EBookCategoryCreateFields: Field[] = [
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    value: '',
    isRequired: true,
    colSpan: 12,
    rowGroup: '0',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    value: '',
    isRequired: false,
    colSpan: 12,
    rowGroup: '1',
  },
  {
    name: 'image',
    label: 'Image',
    type: 'file',
    value: '',
    isRequired: false,
    colSpan: 6,
    rowGroup: '2',
  },
  {
    name: 'icon',
    label: 'Icon',
    type: 'file',
    value: '',
    isRequired: false,
    colSpan: 6,
    rowGroup: '2',
  },
  {
    name: 'is_active',
    label: 'Active?',
    type: 'select',
    value: '',
    isRequired: true,
    rowGroup: '3',
    colSpan: 6,
    options: STATUS_UC_OPTIONS,
  },
];
