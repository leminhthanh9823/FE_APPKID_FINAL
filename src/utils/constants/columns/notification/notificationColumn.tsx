import { TYPE_NOTIFY_UC_OPTIONS } from "../../options";

export const NotificationColumn = [
  {
    key: 'title',
    label: 'Title',
    format: (value: any) => value || "N/A",
  },
  { key: "content", label: "Content", format: (value: any) => value || "N/A" },
  { key: "target_type", label: "Target Type", format: (value: any) => value || "N/A" },
  {
    key: "is_active",
    label: "Status",
    format: (value: number) => (
      <span
        style={{
          backgroundColor: value === 1 ? "#198754" : "#dc3545",
          color: "white",
          padding: "2px 10px",
          borderRadius: "10px",
          fontWeight: "bold",
          fontSize: "13px",
          display: "inline-block",
        }}
      >
        {value === 1 ? "Active" : "Deactive"}
      </span>
    ),
  },
  {
    key: 'send_date',
    label: 'Send date',
    format: (value: string) => {
      const date = new Date(value.replace(' ', 'T'));
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString('vi-VN', {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    },
  },
];
