export default interface Field {
  name: string;
  camelName?: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'textarea'
    | 'checkbox'
    | 'select'
    | 'multi-select'
    | 'date'
    | 'password'
    | 'datetime-local'
    | 'file';
  isVisible?: boolean;
  isRequired?: boolean;
  value: any;
  options?: { value: any; label: any }[];
  rowGroup?: string;
  colSpan?: number;
  isFileMultiple?: boolean;
  fileAccept?: string;
}
