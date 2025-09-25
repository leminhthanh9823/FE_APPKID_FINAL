import { useState, useEffect } from 'react';
import apiClient from '../apis/apiRequest';
import { message } from 'antd';
import { Game } from '../types/game';
import { Word, GameWord } from '../types/word';
import { ApiResponse } from '../types/api';
import { toast } from 'react-toastify';

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
  const [gameWords, setGameWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  const ensureArray = <T>(data: any): T[] => {
    
    if (Array.isArray(data)) {
      return data;
    }
    if (data?.words && Array.isArray(data.words)) {
      return data.words;
    }
    if (data?.items && Array.isArray(data.items)) {
      return data.items;
    }
    return [];
  };

  const fetchGame = async () => {
    try {
      const response = await apiClient.get(`/game/teacher/games/${gameId}`);
      if (response.data.success) {
        const gameData = response.data.data;
        setGame(gameData);
        
        if (gameData.words && Array.isArray(gameData.words)) {
          setGameWords(gameData.words);
        }
      } else {
        toast.error('Failed to load game details');
        setGame(null);
      }
    } catch (error) {
      console.error('Failed to load game:', error);
      toast.error('Failed to load game details');
      setGame(null);
    }
  };

  // Fetch all available words
  const fetchAllWords = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/word');
      if (response.data.success) {
        const words = ensureArray<Word>(response.data.data);
        setAllWords(words);
      } else {
        setAllWords([]);
      }
    } catch (error) {
      console.error('Failed to load words:', error);
      toast.error('Failed to load words');
      setAllWords([]);
    }
  };

  // Fetch words assigned to this game
  const fetchGameWords = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/word/game/${gameId}/words`);
      if (response.data.success) {
        const gameWords = ensureArray<Word>(response.data.data);
        setGameWords(gameWords);
      } else {
        setGameWords([]);
      }
    } catch (error) {
      setGameWords([]);
    }
  };

  // Update game details
  const updateGame = async (values: any) => {
    try {
      setLoading(true);
      
      // Create FormData for handling file uploads
      const formData = new FormData();
      
      // Add all form values to FormData
      Object.keys(values).forEach(key => {
        if (key === 'image' && values[key]) {
          // Handle image upload - get the file from fileList
          const fileList = values[key];
          if (fileList && fileList.length > 0) {
            const file = fileList[0].originFileObj || fileList[0];
            if (file instanceof File) {
              formData.append('image', file);
            }
          }
        } else if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      const response = await apiClient.put(`/game/teacher/games/${gameId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setGame(response.data.data);
        toast.success('Game updated successfully');
      }
    } catch (error) {
      console.error('Failed to update game:', error);
      toast.error('Failed to update game');
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
      }
    } catch (error) {
      toast.error('Failed to update words');
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
          toast.error('Failed to load data');
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