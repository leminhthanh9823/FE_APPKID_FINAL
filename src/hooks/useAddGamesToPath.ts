import { useState } from 'react';
import { toast } from 'react-toastify';
import apiClient from '@/apis/apiRequest';
import { AddGamesToReadingRequest, AddGamesToReadingResponse } from '@/types/gameModal';

const useAddGamesToPath = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addGamesToPath = async (
    learningPathId: number,
    learningPathCategoryId: number,
    readingId: number,
    gameIds: number[],
    onSuccess?: (responseData: any) => void,
    onError?: (error: any) => void
  ) => {
    if (gameIds.length === 0) {
      toast.error('Please select at least one game');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData: AddGamesToReadingRequest = {
        gameIds: gameIds
      };

      const response = await apiClient.post<AddGamesToReadingResponse>(
        `/learning-path/${learningPathId}/${learningPathCategoryId}/${readingId}/add-games`,
        requestData
      );

      if (response.data.success) {
        const { added_games } = response.data.data;
        
        if (added_games.length > 0) {
          toast.success(`Successfully added game(s)`);
        }
      
        if (onSuccess) {
          onSuccess(response.data.data);
        }
      } else {
        throw new Error(response.data.message || 'Failed to add games');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to add games to reading';
      toast.error(errorMessage);
      
      if (onError) {
        onError(err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    addGamesToPath,
    isSubmitting
  };
};

export default useAddGamesToPath;