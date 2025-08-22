import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';

interface DashboardCardData {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalReadings: number;
  totalELibraries: number;
  totalFeedbacks: number;
}

interface MonthlyUserData {
  month: number;
  total: number;
}

interface LeaderboardUser {
  userId: string;
  name: string;
  email: string;
  total_score?: number;
  pass_count?: number;
}

const useFetchDashboard = () => {
  const [cardData, setCardData] = useState<DashboardCardData | null>(null);
  const [monthlyUsers, setMonthlyUsers] = useState<MonthlyUserData[]>([]);
  const [topByScore, setTopByScore] = useState<LeaderboardUser[]>([]);
  const [topByPassCount, setTopByPassCount] = useState<LeaderboardUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { setIsLoading } = useLoading();

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [summaryRes, monthlyRes, scoreRes, passRes] = await Promise.all([
        apiClient.get('/dashboard/summary'),
        apiClient.get('/dashboard/users-monthly'),
        apiClient.get('/dashboard/leaderboard/score'),
        apiClient.get('/dashboard/leaderboard/pass'),
      ]);

      setCardData(summaryRes.data);
      setMonthlyUsers(monthlyRes.data);
      setTopByScore(scoreRes.data);
      setTopByPassCount(passRes.data);
    } catch (err: any) {
      toast.error(err || MESSAGE.SERVER_CONNECTION_ERROR);
      setError(err || MESSAGE.SERVER_CONNECTION_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);
  return {
    cardData,
    monthlyUsers,
    topByScore,
    topByPassCount,
    error,
    refresh: fetchDashboard,
  };
};

export default useFetchDashboard;
