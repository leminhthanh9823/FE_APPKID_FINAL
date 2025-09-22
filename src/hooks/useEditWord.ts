import { useState } from 'react';
import apiClient from '../apis/apiRequest';
import { message } from 'antd';
import { Word } from '../types/word';

export const useEditWord = () => {
  const [loading, setLoading] = useState(false);

  const editWord = async (wordId: number, formData: FormData): Promise<Word> => {
    try {
      setLoading(true);
      
      const response = await apiClient.put(`/word/${wordId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to edit word');
      }
    } catch (error: any) {
      console.error('Failed to edit word:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    editWord,
    loading,
  };
};

export default useEditWord;