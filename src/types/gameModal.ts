export interface AvailableGame {
  id: number;
  title: string;
  description: string | null;
  type: number;
  image: string;
  sequence_order: number;
  is_active: number;
  availability_learning_path_id: number | null;
  availability_name: string | null;
}

export interface ReadingGamesResponse {
  success: boolean;
  message: string;
  status: number;
  errors: null | any;
  data: AvailableGame[];
}

export interface AddGameModalProps {
  isOpen: boolean;
  onClose: (wasSuccessful?: boolean) => void;
  onSelect: (selectedGames: AvailableGame[]) => void;
  readingId: number;
  learningPathId: number;
  learningPathCategoryId: number;
}

export interface GameFilters {
  searchTerm: string;
}

export interface AddGamesToReadingRequest {
  gameIds: number[];
}

export interface AddGamesToReadingResponse {
  success: boolean;
  message: string;
  status: number;
  errors: null;
  data: {
    added_games: Array<{ game_id: number }>;
    skipped_duplicates: Array<{ game_id: number }>;
  };
}