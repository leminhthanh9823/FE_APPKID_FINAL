import Field from '../../../types/field';
import { DIFFICULTY_OPTIONS_UC, STATUS_UC_OPTIONS } from '../options';

const LearningPathEditFields: Field[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    value: '',
    isRequired: true,
    rowGroup: '0',
    colSpan: 12,
  },
   {
    name: 'difficulty_level',
    label: 'Difficulty',
    type: 'select',
    value: 1,
    isRequired: true,
    colSpan: 12,
    options: DIFFICULTY_OPTIONS_UC,
    rowGroup: '1',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    value: '',
    isRequired: false,
    colSpan: 12,
    rowGroup: '2',
  },
  {
    name: 'image',
    label: 'Image',
    type: 'file',
    value: '',
    isRequired: true,
    colSpan: 12,
    rowGroup: '3',
  },

  {
    name: 'is_active',
    label: 'Status',
    type: 'select',
    value: 1,
    isRequired: true,
    colSpan: 12,
    options: STATUS_UC_OPTIONS,
    rowGroup: '4',
  },
];

export default LearningPathEditFields;
