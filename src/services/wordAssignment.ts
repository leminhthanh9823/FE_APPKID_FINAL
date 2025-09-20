import apiClient from '../apis/apiRequest';

interface WordAssignment {
  wordId: number;
  sequenceOrder: number;
}

interface AssignWordsRequest {
  assignments: WordAssignment[];
}

export const wordAssignmentService = {
  // Assign words to a game
  async assignWordsToGame(gameId: number, assignments: WordAssignment[]) {
    try {
      const response = await apiClient.post(`word/game/${gameId}/words`, { assignments });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to assign words to game');
    }
  },

  // Remove all words from a game
  async removeWordsFromGame(gameId: number) {
    try {
      const response = await apiClient.delete(`word/game/${gameId}/words`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to remove words from game');
    }
  }
};