import { useState } from 'react';
import { Row, Col, Button, Pagination } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Game, GameType, GameStatus, GameFilters as IGameFilters, PaginationInfo } from '../../../types/game';
import GameFilters from './GameFilters';
import GameCard from './GameCard';

interface GameListProps {
  games: Game[];
  loading?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onCreateGame: () => void;
  onEditGame: (game: Game) => void;
  onDeleteGame: (gameId: number) => void;
  onStatusChange?: (gameId: number, status: GameStatus) => void;
}

const GameList: React.FC<GameListProps> = ({
  games,
  loading = false,
  pagination,
  onPageChange,
  onCreateGame,
  onEditGame,
  onDeleteGame,
  onStatusChange,
}) => {
  const [filters, setFilters] = useState<IGameFilters>({
    search: '',
    readingId: window.location.pathname.split('/')[2] || undefined,
  });

  const handleFiltersChange = (newFilters: IGameFilters) => {
    setFilters(newFilters);
  };

  const filteredGames = games.filter((game) => {
    // Filter by reading ID if specified
    if (filters.readingId && game.prerequisite_reading_id !== parseInt(filters.readingId)) {
      return false;
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const nameMatch = game.name.toLowerCase().includes(searchLower);
      const descriptionMatch = game.description ? 
        game.description.toLowerCase().includes(searchLower) : 
        false;
      
      if (!nameMatch && !descriptionMatch) {
        return false;
      }
    }

    if (filters.type && game.type !== Object.values(GameType).indexOf(filters.type)) {
      return false;
    }

    if (filters.status && filters.status === GameStatus.PUBLISHED && !game.is_active) {
      return false;
    }

    if (filters.status && filters.status === GameStatus.ARCHIVED && game.is_active) {
      return false;
    }

    return true;
  });

  return (
    <div className="game-list">
      <div className="game-list-header mb-4 flex justify-between items-center">
        <h2>Games</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreateGame}
        >
          Create New Game
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {filteredGames.map((game) => (
          <Col key={game.id} xs={24} sm={12} lg={8} xl={6}>
            <GameCard
              game={game}
              onEdit={onEditGame}
              onDelete={onDeleteGame}
            />
          </Col>
        ))}
      </Row>

      {pagination && (
        <div className="mt-4 flex justify-center">
          <Pagination
            current={pagination.currentPage}
            total={pagination.total}
            pageSize={pagination.limit}
            onChange={onPageChange}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
};

export default GameList;