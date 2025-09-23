import defaultImage from '@/assets/engkid_logo.png';
export const ParentSelectColumns = [
  {
    key: 'image',
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
    key: 'name',
    label: 'Parent',
    format: (value: any) => value || "N/A"
  },
  { key: "phone", label: "Phone number", format: (value: any) => value || "N/A" },
  { key: "email", label: "Email", format: (value: any) => value || "N/A" },
];
