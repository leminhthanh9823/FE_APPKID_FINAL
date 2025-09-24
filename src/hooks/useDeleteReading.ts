import { useState } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';
import { DeleteReadingResponse } from '@/types/learningPath';

const useDeleteReading = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);

  const deleteReading = async (
    learningPathId: number,
    readingId: number,
    onSuccess?: (data: DeleteReadingResponse['data']) => void,
    onError?: (error: string) => void
  ) => {
    if (!learningPathId || !readingId) {
      toast.warning('Invalid learning path or reading ID');
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.delete<DeleteReadingResponse>(
        `/learning-path/${learningPathId}/reading/${readingId}`
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Reading deleted successfully!');
        
        // Call success callback with response data
        if (onSuccess) {
          onSuccess(response.data.data);
        }
      } else {
        throw new Error(response.data.message || 'Failed to delete reading');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || MESSAGE.SERVER_CONNECTION_ERROR;
      toast.error(`Failed to delete reading: ${errorMessage}`);
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
    deleteReading,
    isSubmitting,
    error
  };
};

export default useDeleteReading;