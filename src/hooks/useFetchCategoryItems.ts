import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';
import { LearningPathItem, CategoryItemFromAPI, FetchCategoryItemsResponse } from '@/types/learningPath';

const useFetchCategoryItems = () => {
  const [isLoading, setIsLoadingLocal] = useState(false);
  const { setIsLoading: setGlobalLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryItems = useCallback(
    async (pathCategoryId: number): Promise<LearningPathItem[]> => {
      if (!pathCategoryId) {
        throw new Error('Invalid category ID');
      }
      
      setIsLoadingLocal(true);
      setGlobalLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.get<FetchCategoryItemsResponse>(
          `/learning-path/category/${pathCategoryId}/items`
        );
        
        if (response.data.success) {
          // The new API response directly contains items in the expected format
          const items: LearningPathItem[] = response.data.data.items.map(item => ({
            id: item.id,
            sequence_order: item.sequence_order,
            is_active: item.is_active,
            learning_path_category_id: item.learning_path_category_id,
            name: item.name,
            reading_id: item.reading_id,
            game_id: item.game_id,
            image_url: item.image_url || '',
            prerequisite_reading_id: item.prerequisite_reading_id
          }));
          
          return items;
        } else {
          throw new Error(response.data.message || 'Failed to fetch category items');
        }
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err?.message || MESSAGE.SERVER_CONNECTION_ERROR;
        toast.error(`Failed to fetch category items: ${errorMsg}`);
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoadingLocal(false);
        setGlobalLoading(false);
      }
    },
    [setGlobalLoading]
  );

  const refetchCategoryItems = useCallback(
    async (
      pathCategoryId: number,
      onSuccess?: (items: LearningPathItem[]) => void,
      onError?: (error: string) => void
    ) => {
      try {
        const items = await fetchCategoryItems(pathCategoryId);
        if (onSuccess) {
          onSuccess(items);
        }
        return items;
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to refetch category items';
        if (onError) {
          onError(errorMsg);
        }
        throw err;
      }
    },
    [fetchCategoryItems]
  );

  return { 
    fetchCategoryItems,
    refetchCategoryItems,
    isLoading,
    error 
  };
};

export default useFetchCategoryItems;