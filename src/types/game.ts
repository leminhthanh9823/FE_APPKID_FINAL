export enum GameType {
  Wordle = 1,
  // Puzzle = 2,
  MemoryGame = 3,
  MissingWord = 4,
  ImagePuzzle = 5,
  FourPicturesOneWord = 6,
}

export const GAME_TYPE_LABELS: Record<GameType, string> = {
  [GameType.Wordle]: 'Wordle',
  // [GameType.Puzzle]: 'Puzzle',
  [GameType.MemoryGame]: 'Memory Game',
  [GameType.MissingWord]: 'Missing Word',
  [GameType.ImagePuzzle]: 'Image Puzzle',
  [GameType.FourPicturesOneWord]: 'Four Pictures One Word',
};

export interface PrerequisiteReading {
  id: number;
  title: string;
}

export interface Game {
  id: number;
  name: string;
  description?: string;
  type: number; // now number, not string
  image: string;
  prerequisite_reading_id?: number;
  sequence_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  prerequisiteReading?: PrerequisiteReading;
  studentCompletionCount?: number;
  wordCount?: number;
}

export interface CreateGameDto {
  name: string;
  description?: string;
  type: number;
  image: string;
}

export interface UpdateGameDto {
  name?: string;
  description?: string;
  type?: number;
  image: string;
}

export enum GameStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export interface GameFilters {
  search?: string;
  type?: number; // now number, to match value in GAME_TYPES
  status?: GameStatus;
  readingId?: string;
}

export interface GameState {
  games: Game[];
  selectedGame: Game | null;
  loading: boolean;
  error: string | null;
}

export interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface GameWord {
  word_id: number;
  level: number;
  order: number;
  isActive: boolean;
}