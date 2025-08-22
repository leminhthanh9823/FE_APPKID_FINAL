export const StudentReportColumns = [
  { key: "student_name", label: "Student Name" },
  { key: "parent_name", label: "Parent Name" },
  { key: "grade_id", label: "Grade" },
  { key: "total_reading", label: "Total Reading" },
  { key: "total_passes", label: "Total Passes" },
  {
    key: "completion_rate",
    label: "Completion Rate",
    format: (value: number) => `${value.toFixed(1)}%`,
  },
];
