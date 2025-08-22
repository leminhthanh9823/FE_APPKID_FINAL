import { formatTimestamp } from "@/utils/helper/formatTimeStamp";

export const RoleColumns = [
  { key: "name", label: "Role Name" },
  { key: "description", label: "Description" },
  { key: "active", label: "Active" },
  { key: "last_updated", label: "Last Updated", format: ( value: number ) => value ? formatTimestamp(value) : ""  },
];