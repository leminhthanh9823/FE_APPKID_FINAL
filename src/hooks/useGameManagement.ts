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

  const createGame = async (gameData: any) => {
    if (!readingId) {
      throw new Error('Reading ID is required to create a game');
    }
    try {
      setLoading(true);
      
      // Create FormData for handling file uploads
      const formData = new FormData();
      
      // Add all form values to FormData
      Object.keys(gameData).forEach(key => {
        if (key === 'image' && gameData[key]) {
          // Handle image upload - get the file from fileList
          const fileList = gameData[key];
          if (fileList && fileList.length > 0) {
            const file = fileList[0].originFileObj || fileList[0];
            if (file instanceof File) {
              formData.append('image', file);
            }
          }
        } else if (key === 'name') {
          formData.append(key, gameData[key].trim());
        } else if (gameData[key] !== undefined && gameData[key] !== null) {
          formData.append(key, gameData[key]);
        }
      });

      const response = await apiClient.post(`/game/teacher/readings/${readingId}/games`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const newGame = response.data.data;
      dispatch({ type: 'SET_GAMES', payload: [...state.games, newGame] });
      return newGame;
    } catch (error) {
      console.error('Failed to create game:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to create game',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateGame = async (gameId: number, updates: any) => {
    try {
      setLoading(true);
      
      // Create FormData for handling file uploads
      const formData = new FormData();
      
      // Add all form values to FormData
      Object.keys(updates).forEach(key => {
        if (key === 'image' && updates[key]) {
          // Handle image upload - get the file from fileList
          const fileList = updates[key];
          if (fileList && fileList.length > 0) {
            const file = fileList[0].originFileObj || fileList[0];
            if (file instanceof File) {
              formData.append('image', file);
            }
          }
        } else if (key === 'name') {
          formData.append(key, updates[key].trim());
        } else if (updates[key] !== undefined && updates[key] !== null) {
          formData.append(key, updates[key]);
        }
      });

      const response = await apiClient.put(`/game/teacher/games/${gameId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const updatedGame = response.data.data;
      dispatch({ type: 'UPDATE_GAME', payload: updatedGame });
      return updatedGame;
    } catch (error) {
      console.error('Failed to update game:', error);
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

  const reorderGames = async (reorderedGames: Game[]) => {
    try {
      setLoading(true);
      
      // Prepare bulk update data
      const updates = reorderedGames.map(game => ({
        id: game.id,
        sequence_order: game.sequence_order
      }));

      // Call API to update sequence orders
      await apiClient.put('/game/teacher/games/reorder', { games: updates });
      
      // Update local state
      dispatch({ type: 'SET_GAMES', payload: reorderedGames });
      
    } catch (error) {
      console.error('Failed to reorder games:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to reorder games',
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
    reorderGames,
  };
};

export default useGameManagement;