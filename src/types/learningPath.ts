export interface LearningPathItem {
  id: number;
  sequence_order: number;
  is_active: boolean;
  learning_path_category_id: number;
  name: string;
  reading_id: number | null;
  game_id: number | null;
  image_url: string;
  prerequisite_reading_id: number | null;
}

export interface Category {
  learning_path_category_id: number;
  category_id: number;
  category_name: string;
  items: LearningPathItem[];
}

export interface LearningPath {
  id: number;
  name: string;
  difficulty_level: number;
}

export interface LearningPathItemsResponse {
  success: boolean;
  message: string;
  status: number;
  errors: null | any;
  data: {
    learningPath: LearningPath;
    categories: Category[];
    totalItems: number;
  };
}

export interface DragDropResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  } | null;
  reason: string;
}

export interface CategoryOrder {
  category_id: number;
  sequence_order: number;
}

export interface ReorderCategoriesRequest {
  categoryOrders: CategoryOrder[];
}

export interface ReorderCategoriesResponse {
  success: boolean;
  message: string;
  status: number;
  errors: null | any;
  data: any;
}

export interface ItemOrder {
  reading_id: number | null;
  game_id: number | null;
  sequence_order: number;
}

export interface ReorderItemsRequest {
  readingOrders: ItemOrder[];
}

export interface ReorderItemsResponse {
  success: boolean;
  message: string;
  status: number;
  errors: null | any;
  data: any;
}

export interface DeleteReadingResponse {
  success: boolean;
  message: string;
  status: number;
  errors: null | any;
  data: {
    deleted_reading_id: number;
    deleted_dependent_games: number[];
    reordered_items_count: number;
    category_id: number;
  };
}

export interface DeleteGameResponse {
  success: boolean;
  message: string;
  status: number;
  errors: null | any;
  data: {
    deleted_game_id: number;
    reordered_items_count: number;
    category_id: number;
  };
}

export interface ReadingDetails {
  id: number;
  title: string;
  image: string;
  difficulty_level: number;
}

export interface GameDetails {
  id: number;
  name: string;
  image: string;
  prerequisite_reading_id: number;
}

export interface CategoryItemFromAPI {
  id: number;
  sequence_order: number;
  is_active: boolean;
  learning_path_category_id: number;
  name: string;
  reading_id: number | null;
  game_id: number | null;
  image_url: string | null;
  prerequisite_reading_id: number | null;
}

export interface FetchCategoryItemsResponse {
  success: boolean;
  message: string;
  status: number;
  errors: null | any;
  data: {
    items: CategoryItemFromAPI[];
  };
}