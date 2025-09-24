export enum WordType {
  Noun = 1,
  Verb = 2,
  Adjective = 3,
  Adverb = 4,
  Preposition = 5,
}

export interface Word {
  id: number;
  word: string;
  image?: string;
  level: number;
  note?: string;
  type: WordType;
  is_active: number;
  created_at: string;
  updated_at: string;
  games?: any[];
}

export interface GameWord {
  id: number;
  game_id: number;
  word_id: number;
  level: number;
  order: number;
  created_at: string;
  updated_at: string;
  word?: Word;
}

export interface CreateGameWordDto {
  word_id: number;
  game_id: number;
  level: number;
  order: number;
}

export interface UpdateGameWordDto {
  level?: number;
  order?: number;
}

export function getWordTypeName(type: WordType): string {
  switch (type) {
    case WordType.Noun:
      return 'Noun';
    case WordType.Verb:
      return 'Verb';
    case WordType.Adjective:
      return 'Adjective';
    case WordType.Adverb:
      return 'Adverb';
    case WordType.Preposition:
      return 'Preposition';
    default:
      return 'Unknown';
  }
}