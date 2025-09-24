import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiClient from '@/apis/apiRequest';
import { AvailableGame, ReadingGamesResponse, GameFilters } from '@/types/gameModal';

const useFetchReadingGames = (readingId: number | null) => {
  const [games, setGames] = useState<AvailableGame[]>([]);
  const [filteredGames, setFilteredGames] = useState<AvailableGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    if (!readingId) {
      setGames([]);
      setFilteredGames([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<ReadingGamesResponse>(
        `/game/reading/${readingId}/games`
      );

      if (response.data.success) {
        setGames(response.data.data);
        setFilteredGames(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch games');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch games';
      setError(errorMessage);
      toast.error(errorMessage);
      setGames([]);
      setFilteredGames([]);
    } finally {
      setLoading(false);
    }
  }, [readingId]);

  const filterGames = useCallback((filters: GameFilters) => {
    let filtered = [...games];

    // Apply search filter
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(searchTerm) ||
        (game.description && game.description.toLowerCase().includes(searchTerm))
      );
    }

    setFilteredGames(filtered);
  }, [games]);

  const refetch = useCallback(() => {
    fetchGames();
  }, [fetchGames]);

  // Remove automatic fetching on readingId change
  // Data will only be fetched when explicitly called via refetch

  return {
    games: filteredGames,
    allGames: games,
    loading,
    error,
    refetch,
    filterGames
  };
};

export default useFetchReadingGames;