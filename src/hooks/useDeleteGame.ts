import { useState } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';
import { DeleteGameResponse } from '@/types/learningPath';

const useDeleteGame = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);

  const deleteGame = async (
    learningPathId: number,
    gameId: number,
    onSuccess?: (data: DeleteGameResponse['data']) => void,
    onError?: (error: string) => void
  ) => {
    if (!learningPathId || !gameId) {
      toast.warning('Invalid learning path or game ID');
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.delete<DeleteGameResponse>(
        `/learning-path/${learningPathId}/game/${gameId}`
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Game deleted successfully!');

        // Call success callback with response data
        if (onSuccess) {
          onSuccess(response.data.data);
        }
      } else {
        throw new Error(response.data.message || 'Failed to delete game');
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        MESSAGE.SERVER_CONNECTION_ERROR;
      toast.error(`Failed to delete game: ${errorMessage}`);
      setError(errorMessage);

      // Call error callback
      if (onError) {
        onError(errorMessage);
      }

      throw err; // Re-throw to let the caller handle it if needed
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  return {
    deleteGame,
    isSubmitting,
    error,
  };
};

export default useDeleteGame;
