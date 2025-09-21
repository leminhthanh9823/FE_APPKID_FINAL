export enum GameType {
  WordMatch = 'Word Match',
  WordOrder = 'Word Order',
  MemoryGame = 'Memory Game',
  SpellingGame = 'Spelling Game',
}

export interface PrerequisiteReading {
  id: number;
  title: string;
}

export interface Game {
  id: number;
  name: string;
  description?: string;
  type: number;
  image?: string;
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
  image?: string;
}

export interface UpdateGameDto {
  name?: string;
  description?: string;
  type?: number;
  image?: string;
}

export enum GameStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export interface GameFilters {
  search?: string;
  type?: GameType;
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