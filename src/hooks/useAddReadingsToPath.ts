import { useState } from 'react';
import { toast } from 'react-toastify';
// @ts-ignore
import Swal from 'sweetalert2';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';
import { AddReadingToPathRequest, AddReadingToPathResponse } from '@/types/readingModal';
import { ENDPOINT } from '@/routers/endpoint';

const useAddReadingsToPath = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);

  const addReadingsToPath = async (
    learningPathId: number,
    readingIds: number[],
    onSuccess?: () => void
  ) => {
    if (readingIds.length === 0) {
      toast.warning('Please select at least one reading');
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);
    setError(null);

    try {
      // First attempt with isContinueOnDuplicate = false
      await attemptAddReadings(learningPathId, readingIds, false, onSuccess);
    } catch (err: any) {
        
      // Check if this is a duplicate error
      if (err === "Some readings already exist in this learning path") {
        // Show confirmation dialog
        const result = await Swal.fire({
          title: 'Duplicate Readings Detected',
          text: 'Some readings already exist in this learning path. Do you want to continue adding the remaining readings?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, continue',
          cancelButtonText: 'Cancel',
          backdrop: true,
          allowOutsideClick: false,
          customClass: {
            container: 'swal-high-z-index'
          }
        });

        if (result.isConfirmed) {
          try {
            // Retry with isContinueOnDuplicate = true
            await attemptAddReadings(learningPathId, readingIds, true, onSuccess);
          } catch (retryErr: any) {
            toast.error(retryErr);
            setError(retryErr);
            throw retryErr; // Throw error to be caught by caller
          }
        } else {
          // User cancelled, throw error to prevent modal from closing
          throw new Error('Operation cancelled by user');
        }
      } else {
        toast.error(err);
        setError(err);
        throw err; // Throw error to be caught by caller
      }
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const attemptAddReadings = async (
    learningPathId: number,
    readingIds: number[],
    isContinueOnDuplicate: boolean,
    onSuccess?: () => void
  ) => {
    const requestBody: AddReadingToPathRequest = {
      readingIds,
      isContinueOnDuplicate
    };
    const url = ENDPOINT.LEARNING_PATH_ADD_ITEMS.replace(':pathId', learningPathId.toString());
    const response = await apiClient.post<AddReadingToPathResponse>(url, requestBody);
    if (response.data.success) {
      const { added_items, skipped_duplicates } = response.data.data;
      
      let successMessage = '';
      if (added_items.length > 0) {
        successMessage += `Successfully added ${added_items.length} reading(s)`;
      }

      toast.success(successMessage || 'Operation completed successfully');
      
      // Call success callback to refresh data
      if (onSuccess) {
        onSuccess();
      }
    } else {
      throw new Error(response.data.message || 'Failed to add readings');
    }
  };

  return {
    addReadingsToPath,
    isSubmitting,
    error
  };
};

export default useAddReadingsToPath;