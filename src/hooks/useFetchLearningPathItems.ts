import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';
import { LearningPathItemsResponse, Category, LearningPath } from '@/types/learningPath';

const useFetchLearningPathItems = (learningPathId: number | null) => {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const { setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async () => {
      if (!learningPathId) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<LearningPathItemsResponse>(
          `/learning-path/${learningPathId}/items`, {}
        );
        if (response.data.success) {
          setLearningPath(response.data.data.learningPath);
          setCategories(response.data.data.categories);
          setTotalItems(response.data.data.totalItems);
        }
      } catch (err: any) {
        const errorMsg = err?.message || MESSAGE.SERVER_CONNECTION_ERROR;
        toast.error(errorMsg);
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [learningPathId, setIsLoading]
  );

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    learningPath, 
    categories, 
    setCategories,
    totalItems, 
    error, 
    refetch 
  };
};

export default useFetchLearningPathItems;