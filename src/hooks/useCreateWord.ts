import { useState } from 'react';
import apiClient from '../apis/apiRequest';
import { Word } from '../types/word';

interface CreateWordResponse {
  success: boolean;
  data: Word;
  message: string;
}

interface CreateWordParams {
  word: string;
  type: number;
  level: number;
  image?: File;
  note?: string;
}

const useCreateWord = () => {
  const [loading, setLoading] = useState(false);

  const createWord = async (formData: FormData): Promise<Word> => {
    setLoading(true);
    try {
      const response = await apiClient.post('/word', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data as CreateWordResponse;
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create word');
      }

      return result.data;
    } catch (error) {
      console.error('Error creating word:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createWord,
    loading
  };
};

export default useCreateWord;