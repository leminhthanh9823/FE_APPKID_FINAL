import { useState, useEffect } from 'react';
import apiRequest from '@/apis/apiRequest';
import { ReportStats } from '@/types/report.d';
import { toast } from 'react-toastify';
import { MESSAGE } from '@/utils/constants/errorMessage';

interface UseFetchStudentStatisticsProps {
  studentId: string;
  type: 'week' | 'month' | 'year';
  currentPeriod?: number;
}

const useFetchStudentStatistics = ({
  studentId,
  type,
  currentPeriod = 0,
}: UseFetchStudentStatisticsProps) => {
  const [data, setData] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    if (!studentId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest({
        method: 'GET',
        url: `/student-reading/${studentId}/statistics`,
        params: { type, period: currentPeriod },
      });

      if (response.data.success) {
        setData(response.data.data);
      } 
    } catch (err: any) {
      toast.error(err || MESSAGE.SERVER_CONNECTION_ERROR);
      setError(err || MESSAGE.SERVER_CONNECTION_ERROR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [studentId, type, currentPeriod]);

  return { data, loading, error, refetch: fetchReport };
};

export default useFetchStudentStatistics;
