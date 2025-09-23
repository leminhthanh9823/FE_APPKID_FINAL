import defaultImage from '@/assets/engkid_logo.png';
export const StudentManageColumns = [
  {
    key: 'student_image',
    label: 'Image',
    format: (value: string) =>
      value ? (
        <img
          src={value}
          height={80}
          alt={'no image'}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = defaultImage;
          }}
        />
      ) : (
        <img src={defaultImage} width={50} alt="fallback icon" />
      ),
  },
  {
    key: 'student_name',
    label: 'Student',
    format: (value: any) => value || "N/A" 
  },
  { key: "completed_count", label: "Total completed readings", format: (value: any) => value || "0" },
  { key: "parent_name", label: "Parent", format: (value: any) => value || "N/A" },
  { key: "parent_phone", label: "Phone number", format: (value: any) => value || "N/A" },
  { key: "parent_email", label: "Email", format: (value: any) => value || "N/A" },
];
