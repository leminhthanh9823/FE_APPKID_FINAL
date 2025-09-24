import { useState } from 'react';
import { Row, Col, Button, Pagination, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
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
  onReorderGames?: (games: Game[]) => void;
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
  onReorderGames,
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
    if (filters.readingId && game.prerequisite_reading_id && game.prerequisite_reading_id !== parseInt(filters.readingId)) {
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

  // Sort by sequence_order
  const sortedGames = [...filteredGames].sort((a, b) => {
    return (a.sequence_order || 0) - (b.sequence_order || 0);
  });

  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (!onReorderGames) return;

    const items = Array.from(sortedGames);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update sequence_order for all games
    const updatedGames = items.map((game, index) => ({
      ...game,
      sequence_order: index + 1
    }));

    onReorderGames(updatedGames);
    message.success('Game order updated successfully');
  };

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

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="games-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <Row gutter={[16, 16]}>
                {sortedGames.map((game, index) => (
                  <Draggable 
                    key={game.id} 
                    draggableId={game.id.toString()} 
                    index={index}
                    isDragDisabled={!onReorderGames}
                  >
                    {(provided, snapshot) => (
                      <Col 
                        xs={24} sm={12} lg={8} xl={6}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          opacity: snapshot.isDragging ? 0.8 : 1,
                          transform: provided.draggableProps.style?.transform
                        }}
                      >
                        <GameCard
                          game={game}
                          onEdit={onEditGame}
                          onDelete={onDeleteGame}
                          isDragging={snapshot.isDragging}
                        />
                      </Col>
                    )}
                  </Draggable>
                ))}
              </Row>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

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