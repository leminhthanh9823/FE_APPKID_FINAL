import Field from "@/types/field";

export const RoleCreateFields: Field[] = [
  { name: "name", camelName: "name", label: "Tên nhóm quyền", type: "text", value: "", rowGroup: "1", colSpan: 6, isRequired: true },
  { name: "description", camelName: "description", label: "Mô tả", type: "text", value: "", rowGroup: "1", colSpan: 6, isRequired: true },
]