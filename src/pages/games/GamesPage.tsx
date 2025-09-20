import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, message } from 'antd';
import { GameProvider } from '../../stores/contexts/GameContext';
import GameList from '../../components/games/list/GameList';
import useGameManagement from '../../hooks/useGameManagement';
import { Game, GameStatus } from '../../types/game';

const GamesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    games,
    loading,
    error,
    createGame,
    updateGame,
    deleteGame,
    changeGameStatus,
  } = useGameManagement();

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleCreateGame = () => {
    if (!readingId) {
      message.error('Reading ID is required to create a game');
      return;
    }
    navigate(`/reading/${readingId}/games/create`);
  };

  const handleEditGame = (game: Game) => {
    // Use absolute path to avoid appending to current URL
    navigate(`/reading/${game.prerequisite_reading_id}/games/${game.id}/edit`);
  };

  const handleDeleteGame = async (gameId: number) => {
    try {
      await deleteGame(gameId);
      message.success('Game deleted successfully');
    } catch (error) {
      message.error('Failed to delete game');
    }
  };

  const handleStatusChange = async (gameId: number, status: GameStatus) => {
    try {
      await changeGameStatus(gameId, status);
      message.success('Game status updated successfully');
    } catch (error) {
      message.error('Failed to update game status');
    }
  };

  const { id } = useParams();
  const readingId = id;

  const pageTitle = readingId ? "Reading Games" : "Game Management";
  const cardTitle = readingId ? `Games for Reading #${readingId}` : "All Games";

  return (
    <main className="main" id="main">
      <div className="pagetitle">
        <h1>{pageTitle}</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/dashboard">CMS</a>
            </li>
            {readingId && (
              <li className="breadcrumb-item">
                <a href="/reading">Reading</a>
              </li>
            )}
            <li className="breadcrumb-item active">{pageTitle}</li>
          </ol>
        </nav>
      </div>
      <div style={{
        padding: '2%',
        backgroundColor: '#fff',
        boxShadow: '0px 0px 20px #8c98a4',
      }}>
        <GameList
          games={games}
          onCreateGame={handleCreateGame}
          onEditGame={handleEditGame}
          onDeleteGame={handleDeleteGame}
          onStatusChange={handleStatusChange}
        />
      </div>
    </main>
  );
};

export default GamesPage;