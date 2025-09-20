import { useState } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';
import { ReorderCategoriesRequest, ReorderCategoriesResponse, Category } from '@/types/learningPath';
import { ENDPOINT } from '@/routers/endpoint';

const useReorderCategories = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);

  const reorderCategories = async (
    learningPathId: number,
    categories: Category[],
    onSuccess?: () => void,
    onError?: (originalCategories: Category[]) => void
  ) => {
    if (!learningPathId || categories.length === 0) {
      toast.warning('Invalid learning path or categories');
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);
    setError(null);

    // Store original categories for rollback
    const originalCategories = [...categories];

    try {
      // Build the request body with new sequence orders
      const categoryOrders = categories.map((category, index) => ({
        category_id: category.category_id,
        sequence_order: index + 1 // 1-based indexing
      }));

      const requestBody: ReorderCategoriesRequest = {
        categoryOrders
      };

      const url = ENDPOINT.LEARNING_PATH_REORDER_CATEGORIES.replace(':pathId', learningPathId.toString());
      const response = await apiClient.put<ReorderCategoriesResponse>(url, requestBody);

      if (response.data.success) {
        toast.success('Category order updated successfully!');
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(response.data.message || 'Failed to reorder categories');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || MESSAGE.SERVER_CONNECTION_ERROR;
      toast.error(`Failed to update category order: ${errorMessage}`);
      setError(errorMessage);
      
      // Call error callback to restore original order
      if (onError) {
        onError(originalCategories);
      }
      
      throw err; // Re-throw to let the caller handle it if needed
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  return {
    reorderCategories,
    isSubmitting,
    error
  };
};

export default useReorderCategories;