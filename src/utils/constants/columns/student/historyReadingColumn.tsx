import user from '../../../../assets/no-image-available.png'
export const HistoryReadingColumns = [
  {
    key: 'image',
    label: 'Image',
    format: (value: string) =>
      value ? <img src={value} height={80} alt="ebook" /> : user,
  },
  { key: "title", label: "Title", format: (value: any) => value || "N/A" },
  { key: "is_completed", label: "Completed", format: (value: any) => value ? "Yes" : "No" },
  { key: "is_passed", label: "Passed", format: (value: any) => value ? "Yes" : "No" },
  { key: "duration", label: "Duration", format: (value: any) => value || "N/A" },
  { key: "star", label: "Star", format: (value: any) => value || "0" },
  { key: "score", label: "Score ", format: (value: any) => value || "0" },
  {
    key: 'date',
    label: 'Date',
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
