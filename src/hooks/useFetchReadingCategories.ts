import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';
import { ReadingCategoriesResponse, ReadingCategory } from '@/types/readingModal';
import { ENDPOINT } from '@/routers/endpoint';

const useFetchReadingCategories = () => {
  const [categories, setCategories] = useState<ReadingCategory[]>([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const { setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ReadingCategoriesResponse>(
        ENDPOINT.READING_CATEGORY_LIST
      );
      if (response.data.success) {
        setCategories(response.data.data.categories);
        setTotalCategories(response.data.data.totalCategories);
      }
    } catch (err: any) {
      const errorMsg = err?.message || MESSAGE.SERVER_CONNECTION_ERROR;
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    categories, 
    totalCategories, 
    error, 
    refetch: fetchData 
  };
};

export default useFetchReadingCategories;