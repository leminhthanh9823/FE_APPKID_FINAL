import Field from '../../../types/field';
import { DIFFICULTY_OPTIONS_UC } from '../options';

const LearningPathCreateFields: Field[] = [
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
    rowGroup: '5',
  },
];

export default LearningPathCreateFields;
