import { useState } from 'react';
import apiClient from '../apis/apiRequest';
import { toast } from 'react-toastify';
import { MESSAGE } from '@/utils/constants/errorMessage';

interface UseToggleStatusProps {
  endpoint: string;
  onSuccess?: () => void;
}

interface ValidationError {
  field: string;
  message: string;
}

interface ToggleStatusResponse {
  success: boolean;
  message?: string;
  errors?: ValidationError[];
  status?: number;
}

const useToggleStatus = ({ endpoint, onSuccess }: UseToggleStatusProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const toggleStatus = async (id: number | string, currentStatus: boolean) => {
    setIsLoading(true);
    try {
      const response = await apiClient.put<ToggleStatusResponse>(
        `${endpoint}/${id}/update-status`,
        { is_active: !currentStatus }
      );

      if (response.data.success) {
        toast.success(
          `Status is updated to ${!currentStatus ? 'Active' : 'Inactive'} successfully!`
        );
        if (onSuccess) {
          onSuccess();
        }
        return true;
      } else {
        toast.error(response.data.message || 'Failed to update status.');
        return false;
      }
    } catch (error: any) {
      toast.error(error || MESSAGE.SERVER_CONNECTION_ERROR);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { toggleStatus, isLoading };
};

export default useToggleStatus;
