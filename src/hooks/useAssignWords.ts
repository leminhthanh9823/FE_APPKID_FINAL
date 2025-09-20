import { useState } from 'react';
import { message } from 'antd';
import { wordAssignmentService } from '../services/wordAssignment';

interface WordAssignment {
  wordId: number;
  sequenceOrder: number;
}

export const useAssignWords = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignWordsToGame = async (gameId: number, assignments: WordAssignment[]) => {
    setLoading(true);
    setError(null);

    try {
      // Convert to backend expected format
      const formattedAssignments = assignments.map(assignment => ({
        wordId: assignment.wordId,
        sequenceOrder: assignment.sequenceOrder
      }));

      const result = await wordAssignmentService.assignWordsToGame(gameId, formattedAssignments);
      
      message.success('Words assigned to game successfully!');
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to assign words to game';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeWordsFromGame = async (gameId: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await wordAssignmentService.removeWordsFromGame(gameId);
      message.success('Words removed from game successfully!');
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove words from game';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    assignWordsToGame,
    removeWordsFromGame,
    loading,
    error
  };
};