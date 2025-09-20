import { useState } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';
import { ReorderItemsRequest, ReorderItemsResponse, Category, LearningPathItem } from '@/types/learningPath';
import { ENDPOINT } from '@/routers/endpoint';

const useReorderItems = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);

  const reorderItems = async (
    learningPathId: number,
    categoryId: number,
    items: LearningPathItem[],
    onSuccess?: () => void,
    onError?: (originalItems: LearningPathItem[]) => void
  ) => {
    if (!learningPathId || !categoryId || items.length === 0) {
      toast.warning('Invalid learning path, category or items');
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);
    setError(null);

    // Store original items for rollback
    const originalItems = [...items];

    try {
      // Build the request body with new sequence orders
      const readingOrders = items.map((item, index) => ({
        reading_id: item.reading_id,
        game_id: item.game_id,
        sequence_order: index + 1 // 1-based indexing
      }));

      const requestBody: ReorderItemsRequest = {
        readingOrders
      };

      const url = ENDPOINT.LEARNING_PATH_REORDER_ITEMS
        .replace(':pathId', learningPathId.toString())
        .replace(':categoryId', categoryId.toString());
      
      const response = await apiClient.put<ReorderItemsResponse>(url, requestBody);

      if (response.data.success) {
        toast.success('Items order updated successfully!');
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(response.data.message || 'Failed to reorder items');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || MESSAGE.SERVER_CONNECTION_ERROR;
      toast.error(`Failed to update items order: ${errorMessage}`);
      setError(errorMessage);
      
      // Call error callback to restore original order
      if (onError) {
        onError(originalItems);
      }
      
      throw err; // Re-throw to let the caller handle it if needed
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  return {
    reorderItems,
    isSubmitting,
    error
  };
};

export default useReorderItems;