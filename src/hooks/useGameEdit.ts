import { useState, useEffect } from 'react';
import apiClient from '../apis/apiRequest';
import { message } from 'antd';
import { Game } from '../types/game';
import { Word, GameWord } from '../types/word';
import { ApiResponse } from '../types/api';

interface WordsResponse {
  words: Word[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

interface GameWordAssignment {
  wordId: number;
  level: number;
  isActive: boolean;
  order: number;
}

export const useGameEdit = (gameId: string) => {
  const [game, setGame] = useState<Game | null>(null);
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [gameWords, setGameWords] = useState<Word[]>([]); // Changed to Word[] as API returns assigned words
  const [loading, setLoading] = useState(true);  // Start with loading true

  // Ensure data is always an array
  const ensureArray = <T>(data: any): T[] => {
    console.log('ensureArray input:', data);
    console.log('data type:', typeof data, Array.isArray(data));
    console.log('data.words:', data?.words, Array.isArray(data?.words));
    console.log('data.items:', data?.items, Array.isArray(data?.items));
    
    if (Array.isArray(data)) {
      console.log('Returning data directly');
      return data;
    }
    if (data?.words && Array.isArray(data.words)) {
      console.log('Returning data.words');
      return data.words;
    }
    if (data?.items && Array.isArray(data.items)) {
      console.log('Returning data.items');
      return data.items;
    }
    console.log('Returning empty array');
    return [];
  };

  // Fetch game details
  const fetchGame = async () => {
    try {
      const response = await apiClient.get(`/game/teacher/games/${gameId}`);
      console.log('Fetch game response:', response.data);
      if (response.data.success) {
        const gameData = response.data.data;
        console.log('Game data loaded:', gameData);
        setGame(gameData);
        
        // Check if game has words data included
        if (gameData.words && Array.isArray(gameData.words)) {
          console.log('Game includes words:', gameData.words);
          setGameWords(gameData.words);
        }
      } else {
        message.error('Failed to load game details');
        setGame(null);
      }
    } catch (error) {
      console.error('Failed to load game:', error);
      message.error('Failed to load game details');
      setGame(null);
    }
  };

  // Fetch all available words
  const fetchAllWords = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/word');
      console.log('Fetch all words response:', response.data);
      console.log('Response data structure:', response.data.data);
      if (response.data.success) {
        const words = ensureArray<Word>(response.data.data);
        console.log('All words loaded:', words.length, words);
        setAllWords(words);
      } else {
        console.error('Failed to load words - success false');
        setAllWords([]);
      }
    } catch (error) {
      console.error('Failed to load words:', error);
      message.error('Failed to load words');
      setAllWords([]);
    }
  };

  // Fetch words assigned to this game
  const fetchGameWords = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/word/game/${gameId}/words`);
      console.log('Fetch game words response:', response.data);
      if (response.data.success) {
        const gameWords = ensureArray<Word>(response.data.data);
        console.log('Game words loaded:', gameWords.length);
        setGameWords(gameWords);
      } else {
        console.error('Failed to load game words - success false');
        setGameWords([]);
      }
    } catch (error) {
      console.error('Failed to load game words:', error);
      // Don't show error message as this endpoint might not exist yet
      setGameWords([]);
    }
  };

  // Update game details
  const updateGame = async (values: Partial<Game>) => {
    try {
      setLoading(true);
      const response = await apiClient.put(`/game/teacher/games/${gameId}`, values);
      if (response.data.success) {
        setGame(response.data.data);
        message.success('Game updated successfully');
      }
    } catch (error) {
      message.error('Failed to update game');
    } finally {
      setLoading(false);
    }
  };

  // Add/Update word assignments
  const updateGameWords = async (wordAssignments: Array<{
    wordId: number;
    level: number;
    isActive: boolean;
    order: number;
  }>) => {
    try {
      setLoading(true);
      
      // Convert to format expected by backend
      const assignments = wordAssignments.map(wa => ({
        wordId: wa.wordId,
        sequenceOrder: wa.order
      }));

      const response = await apiClient.post(`word/game/${gameId}/words`, {
        assignments
      });
      
      if (response.data.success) {
        await fetchGameWords();
        message.success('Words updated successfully');
      }
    } catch (error) {
      console.error('Failed to update words:', error);
      message.error('Failed to update words');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (gameId) {
        setLoading(true);
        try {
          await Promise.all([
            fetchGame(),
            fetchAllWords(),
            fetchGameWords()
          ]);
        } catch (error) {
          message.error('Failed to load data');
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [gameId]);

  return {
    game,
    allWords,
    gameWords,
    loading,
    updateGame,
    updateGameWords,
    refreshGameWords: fetchGameWords,
  } as const;
};

export type GameEditHookReturn = ReturnType<typeof useGameEdit>;
export default useGameEdit;