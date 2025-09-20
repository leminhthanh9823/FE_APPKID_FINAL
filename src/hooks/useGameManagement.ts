import { useState, useEffect } from 'react';
import { useGameContext } from '../stores/contexts/GameContext';
import { Game, GameStatus, CreateGameDto, UpdateGameDto } from '../types/game';
import apiClient from '../apis/apiRequest';
import { useParams } from 'react-router-dom';

export const useGameManagement = () => {
  const { state, dispatch } = useGameContext();
  const [loading, setLoading] = useState(false);
  const { id: readingId } = useParams();
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  const fetchGames = async (page: number = 1) => {
    if (!readingId) {
      throw new Error('Reading ID is required to fetch games');
    }
    try {
      setLoading(true);
      const response = await apiClient.get(`/game/teacher/readings/${readingId}/games`, {
        params: {
          page,
          limit: pagination.limit
        }
      });
      const { games, pagination: newPagination } = response.data.data;
      dispatch({ type: 'SET_GAMES', payload: games });
      setPagination(newPagination);
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to fetch games',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (readingId) {
      fetchGames();
    }
  }, [readingId]);

  const createGame = async (gameData: CreateGameDto) => {
    if (!readingId) {
      throw new Error('Reading ID is required to create a game');
    }
    try {
      setLoading(true);
      const response = await apiClient.post(`/game/teacher/readings/${readingId}/games`, {
        ...gameData,
        name: gameData.name.trim(),
      });
      const newGame = response.data.data;
      dispatch({ type: 'SET_GAMES', payload: [...state.games, newGame] });
      return newGame;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to create game',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateGame = async (gameId: number, updates: UpdateGameDto) => {
    try {
      setLoading(true);
      if (updates.name) {
        updates.name = updates.name.trim();
      }
      const response = await apiClient.put(`/game/teacher/games/${gameId}`, updates);
      const updatedGame = response.data.data;
      dispatch({ type: 'UPDATE_GAME', payload: updatedGame });
      return updatedGame;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to update game',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteGame = async (gameId: number) => {
    try {
      setLoading(true);
      await apiClient.delete(`/game/teacher/games/${gameId}`);
      dispatch({ type: 'DELETE_GAME', payload: gameId });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to delete game',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changeGameStatus = async (gameId: number, status: GameStatus) => {
    try {
      setLoading(true);
      const response = await apiClient.patch(`/game/teacher/games/${gameId}/status`, { status });
      const updatedGame = response.data.data;
      dispatch({ type: 'UPDATE_GAME', payload: updatedGame });
      return updatedGame;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to update game status',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchGames(page);
  };

  return {
    games: state.games,
    selectedGame: state.selectedGame,
    loading,
    error: state.error,
    pagination,
    onPageChange: handlePageChange,
    createGame,
    updateGame,
    deleteGame,
    changeGameStatus,
  };
};

export default useGameManagement;