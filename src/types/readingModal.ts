export interface ReadingCategory {
  id: number;
  title: string;
  description: string;
  image: string;
  is_active: number;
  reading_count: number;
}

export interface ReadingCategoriesResponse {
  success: boolean;
  message: string;
  status: number;
  errors: null | any;
  data: {
    categories: ReadingCategory[];
    totalCategories: number;
  };
}

export interface AvailableReading {
  id: number;
  title: string;
  image_url: string;
  difficulty_level: number;
  is_active: boolean;
  availability_learning_path_id: number | null;
  availability_name: "Available" | "In Learning Path";
}

export interface CategoryReadingsResponse {
  success: boolean;
  message: string;
  data: {
    category: {
      id: number;
      title: string;
      description: string;
    };
    readings: AvailableReading[];
    totalReadings: number;
  };
}

export interface AddReadingModalProps {
  isOpen: boolean;
  onClose: (wasSuccessful?: boolean) => void;
  onSelect: (selectedReadings: AvailableReading[]) => void;
  selectedCategoryId?: number | null; // If provided, only show this category
  learningPathId: number;
}

export interface ReadingFilters {
  difficulty?: number | null;
  status?: 'all' | 'available' | 'in_path';
  searchTerm?: string;
  available?: boolean | null;
}

export interface AddReadingToPathRequest {
  readingIds: number[];
  isContinueOnDuplicate: boolean;
}

export interface AddReadingToPathResponse {
  success: boolean;
  message: string;
  status: number;
  errors: null;
  data: {
    added_items: Array<{ reading_id: number }>;
    skipped_duplicates: Array<{ reading_id: number }>;
  };
}