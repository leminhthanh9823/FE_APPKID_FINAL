import defaultImage from '@/assets/engkid_logo.png';
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.src !== defaultImage) {
    img.src = defaultImage;
  }
};
export const LearningPathColumns = [
  {
    key: 'image',
    label: 'Image',
    format: (value: string) => (
      <img
        src={value || defaultImage}
        height={80}
        alt="ebook"
        onError={handleImageError}
      />
    ),
  },
  {
    key: 'name',
    label: 'Name',
    format: (value: any) => value || "N/A",
  },

  {
    key: "difficulty_level",
    label: "Difficulty",
    format: (value: number | null | undefined) => {
      return <>{value}</>
    },
  },
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
    key: "active_items_count",
    label: "Items count",
    format: (value: number) => (
      <><span>{value ?? 0}</span></>
    ),
  },
];
