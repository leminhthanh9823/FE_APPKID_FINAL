import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, message, Spin } from 'antd';
import { GameProvider } from '../../stores/contexts/GameContext';
import GameCreationForm from '../../components/games/creation/GameCreationForm';
import WordAssignmentPanel from '../../components/games/words/WordAssignmentPanel';
import useGameManagement from '../../hooks/useGameManagement';
import apiClient from '../../apis/apiRequest';
import { Game } from '../../types/game';
import { GameWord, Word, CreateGameWordDto } from '../../types/word';

interface CreateGameDto {
  name: string;
  type: number;
  description?: string;
  readingId: number;
  isActive: number;
}

interface GameFormData {
  name: string;
  type: number;
  description?: string;
}

// Helper to create word assignments for saving
const createWordAssignment = (word: GameWord, index: number, gameId: number) => ({
  wordId: word.word_id,
  level: word.level,
  isActive: 1,
  order: index + 1,
  gameId: gameId
});

const CreateGamePage: React.FC = () => {
  const navigate = useNavigate();
  const { createGame } = useGameManagement();
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [selectedWords, setSelectedWords] = useState<GameWord[]>([]);
  const [loading, setLoading] = useState(false);

  const { id: readingId } = useParams();

  const handleGameCreation = async (formData: GameFormData) => {
    setLoading(true);
    try {
      const newGame = await createGame({
        ...formData,
        readingId: parseInt(readingId || '0'),
        isActive: 1
      } as CreateGameDto);
      message.success('Game created successfully');
      // Navigate to games list in reading after creation
      if (readingId) {
        navigate(`/kid-reading/${readingId}/games`);
      } else {
        navigate('/kid-reading');
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Failed to create game');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWordSelection = (word: Word) => {
    const gameWord: GameWord = {
      id: Math.random(),
      word_id: word.id,
      game_id: currentGame?.id || 0,
      level: word.level,
      order: selectedWords.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      word: word // Include the original word for display purposes
    };
    setSelectedWords([...selectedWords, gameWord]);
  };

  const handleWordDeselection = (wordId: number) => {
    setSelectedWords(selectedWords.filter((w) => w.word_id !== wordId));
  };

  const handleBatchAssign = (words: Word[]) => {
    const newGameWords = words.map(word => ({
      id: Math.random(),
      word_id: word.id,
      game_id: currentGame?.id || 0,
      level: word.level,
      order: selectedWords.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      word: word // Include the original word for display purposes
    }));
    setSelectedWords([...selectedWords, ...newGameWords]);
  };

  const handleFinish = async () => {
    if (currentGame?.id) {
      try {
        setLoading(true);
        const wordAssignments = selectedWords.map((word, index) => 
          createWordAssignment(word, index, currentGame.id)
        );
        
        await apiClient.post(`/games/${currentGame.id}/words`, {
          words: wordAssignments
        });
        
        message.success('Words assigned successfully');
        // Navigate back to appropriate games view
        if (readingId) {
          navigate(`/kid-reading/${readingId}/games`);
        } else {
          navigate('/games');
        }
      } catch (error) {
        if (error instanceof Error) {
          message.error(error.message);
        } else {
          message.error('Failed to assign words to game');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <main className="main" id="main">
      <div className="pagetitle">
        <h1>{currentGame ? 'Assign Words' : 'Create New Game'}</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/dashboard">CMS</a>
            </li>
            <li className="breadcrumb-item"><a href={`/kid-reading`}>Reading Management</a></li>
            <li className="breadcrumb-item active">
              {currentGame ? 'Assign Words' : 'Create New Game'}
            </li>
          </ol>
        </nav>
      </div>

      <div
        style={{
          padding: '2%',
          backgroundColor: '#fff',
          boxShadow: '0px 0px 20px #8c98a4',
        }}
      >
        {!currentGame ? (
          <div className="create-game-section">
            <GameCreationForm onSubmit={handleGameCreation} />
          </div>
        ) : (
          <div className="assign-words-section">
            <div className="d-flex justify-content-end mb-3 gap-2">
              <button 
                className="btn btn-outline-secondary"
                onClick={() => {
                  // Navigate back to games view without assigning words
                  if (readingId) {
                    navigate(`/kid-reading/${readingId}/games`);
                  } else {
                    navigate('/kid-reading');
                  }
                }}
              >
                Skip Words Assignment
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleFinish} 
                disabled={selectedWords.length === 0}
              >
                Finish & Assign Words
              </button>
            </div>
            <WordAssignmentPanel
              availableWords={[]}
              selectedWords={selectedWords.map(gw => gw.word!)} // Map GameWord back to Word for display
              onWordSelect={handleWordSelection}
              onWordDeselect={handleWordDeselection}
              onBatchAssign={handleBatchAssign}
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default CreateGamePage;