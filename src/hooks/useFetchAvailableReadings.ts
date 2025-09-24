import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';
import { CategoryReadingsResponse, AvailableReading, ReadingFilters } from '@/types/readingModal';
import { SEARCH_AVAILABLE_READING } from '@/utils/constants/options';
import { ENDPOINT } from '@/routers/endpoint';

const useFetchAvailableReadings = (categoryId: number | null) => {
  const [category, setCategory] = useState<{ id: number; title: string; description: string } | null>(null);
  const [readings, setReadings] = useState<AvailableReading[]>([]);
  const [totalReadings, setTotalReadings] = useState(0);
  const { setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (filters?: ReadingFilters) => {
    if (!categoryId) return;
    setIsLoading(true);
    setError(null);
    try {
      // Build query parameters for filters as plain object
      const params: Record<string, any> = {};
      if (filters?.difficulty) {
        params.difficulty = filters.difficulty;
      }
      if (filters?.searchTerm) {
        params.search = filters.searchTerm;
      }

      const url = ENDPOINT.CATEGORY_AVAILABLE_READINGS.replace(':categoryId', categoryId.toString());
      const response = await apiClient.get<CategoryReadingsResponse>(url, { params });
      if (response.data.success) {
        setCategory(response.data.data.category);
        let filteredReadings = response.data.data.readings;
        
        // Filter by availability status
        if (filters?.available === true) {
          // Show only readings that are not in any learning path
          filteredReadings = filteredReadings.filter(r => r.availability_learning_path_id === null);
        } else if (filters?.available === false) {
          // Show only readings that are already in some learning path
          filteredReadings = filteredReadings.filter(r => r.availability_learning_path_id !== null);
        }
        // If filters?.available is null, show all readings (no filtering)
        
        setReadings(filteredReadings);
        setTotalReadings(filteredReadings.length);
      }
    } catch (err: any) {
      const errorMsg = err?.message || MESSAGE.SERVER_CONNECTION_ERROR;
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, setIsLoading]);

  // Remove automatic fetching on categoryId change
  // Data will only be fetched when explicitly called via refetch or refetchWithFilters

  const refetchWithFilters = useCallback((filters: ReadingFilters) => {
    if (categoryId) {
      fetchData(filters);
    }
  }, [categoryId, setIsLoading]);

  return { 
    category, 
    readings, 
    totalReadings, 
    error, 
    refetch: fetchData,
    refetchWithFilters
  };
};

export default useFetchAvailableReadings;