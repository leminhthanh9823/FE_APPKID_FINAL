import Field from "../../../types/field";

export const RoleEditFields: Field[] = [
  { name: "name", camelName: "name", label: "Role Name", type: "text", value: "", rowGroup: "1", colSpan: 6 },
  { name: "description", camelName: "description", label: "Description", type: "text", value: "", rowGroup: "1", colSpan: 6 },
  { name: "functions", camelName: "functions", label: "Access Rights", type: "checkbox", value: [], options: [], rowGroup: "2", colSpan: 12}
];
