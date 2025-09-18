import Field from "./field";

export interface CustomAction {
  action: string;
  link?: (row: any) => string;
  onClick?: (item: any) => void;
  customFields?: Field[];
  customPath?: string;
  openModal?: boolean;
}