import React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Category as CategoryType, LearningPathItem } from '@/types/learningPath';

interface CategoryProps {
  category: CategoryType;
  index: number;
  onEditReading: (item: LearningPathItem) => void;
  onRemoveReading: (item: LearningPathItem) => void;
  onEditGame: (item: LearningPathItem) => void;
  onRemoveGame: (item: LearningPathItem) => void;
  onAddReading: (categoryId: number) => void;
  onAddGame: (readingId: number) => void;
  onAddGameFromLibrary: (readingId: number) => void;
}

const CategoryComponent: React.FC<CategoryProps> = ({
  category,
  index,
  onEditReading,
  onRemoveReading,
  onEditGame,
  onRemoveGame,
  onAddReading,
  onAddGame,
  onAddGameFromLibrary
}) => {
  const readings = category.items.filter(item => item.reading_id && !item.game_id);
  const games = category.items.filter(item => item.game_id);

  return (
    <Draggable draggableId={`category-${category.category_id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`card mb-4 shadow-sm ${snapshot.isDragging ? 'opacity-75' : ''}`}
        >
          <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div
                {...provided.dragHandleProps}
                className="me-3 text-muted cursor-grab"
                style={{ cursor: 'grab' }}
                title="Drag to reorder"
              >
                <i className="bi bi-grip-vertical"></i>
              </div>
              <i className="bi bi-folder-fill text-warning me-2"></i>
              <h5 className="mb-0 fw-bold">
                {index+1}. Topic: {category.category_name}
              </h5>
              <button
                className="btn btn-sm btn-light ms-2"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#category-${category.category_id}`}
                aria-expanded="true"
              >
                <i className="bi bi-chevron-down"></i>
              </button>
            </div>
            <button
              className="btn btn-info btn-sm"
              onClick={() => onAddReading(category.category_id)}
            >
              <i className="bi bi-plus-lg me-1"></i>
              Add reading to current topic
            </button>
          </div>

          <div className="collapse show" id={`category-${category.category_id}`}>
            <Droppable
              droppableId={`category-${category.category_id}-readings`}
              type="reading"
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`card-body ${snapshot.isDraggingOver ? 'bg-light' : ''}`}
                  style={{ minHeight: '100px' }}
                >
                  {readings.map((reading, readingIndex) => (
                    <ReadingItem
                      key={reading.id}
                      reading={reading}
                      index={readingIndex}
                      games={games.filter(game => game.prerequisite_reading_id === reading.reading_id)}
                      onEditReading={onEditReading}
                      onRemoveReading={onRemoveReading}
                      onEditGame={onEditGame}
                      onRemoveGame={onRemoveGame}
                      onAddGame={onAddGame}
                      onAddGameFromLibrary={onAddGameFromLibrary}
                    />
                  ))}
                  {provided.placeholder}
                  {readings.length === 0 && (
                    <div className="text-center py-3 text-muted">
                      <i className="bi bi-book me-2"></i>
                        Let add readings to this topic.
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      )}
    </Draggable>
  );
};

interface ReadingItemProps {
  reading: LearningPathItem;
  index: number;
  games: LearningPathItem[];
  onEditReading: (item: LearningPathItem) => void;
  onRemoveReading: (item: LearningPathItem) => void;
  onEditGame: (item: LearningPathItem) => void;
  onRemoveGame: (item: LearningPathItem) => void;
  onAddGame: (readingId: number) => void;
  onAddGameFromLibrary: (readingId: number) => void;
}

const ReadingItem: React.FC<ReadingItemProps> = ({
  reading,
  index,
  games,
  onEditReading,
  onRemoveReading,
  onEditGame,
  onRemoveGame,
  onAddGame,
  onAddGameFromLibrary
}) => {
  return (
    <Draggable draggableId={`reading-${reading.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`card mb-3 ${snapshot.isDragging ? 'opacity-75' : 'shadow-sm'}`}
        >
          <div className="card-header bg-info bg-opacity-10 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center flex-grow-1">
              <div
                {...provided.dragHandleProps}
                className="me-3 text-muted cursor-grab"
                style={{ cursor: 'grab' }}
                title="Drag to reorder"
              >
                <i className="bi bi-grip-vertical"></i>
              </div>
              <i className="bi bi-book-fill text-info me-2"></i>
              <h6 className="mb-0 fw-semibold flex-grow-1 d-flex align-items-center">
                {reading.sequence_order}. Reading: {reading.name}
                <button
                  className="btn btn-sm bg-transparent border-0 ms-2"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#reading-${reading.id}`}
                  aria-expanded="true"
                  style={{ height: 32 }}
                >
                  <i className="bi bi-chevron-down"></i>
                </button>
              </h6>
            </div>
            <div className="d-flex align-items-center gap-2 ms-3">
              <div className="dropdown">
                <button
                  className="btn btn-success btn-sm d-flex align-items-center"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ minWidth: 120 }}
                >
                  <i className="bi bi-plus-lg me-1"></i>
                  Add game
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => reading.reading_id && onAddGame(reading.reading_id)}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Create new game
                    </button>
                  </li>
                  <li>
                    <button 
                      className="dropdown-item"
                      onClick={() => reading.reading_id && onAddGameFromLibrary(reading.reading_id)}
                    >
                      <i className="bi bi-collection me-2"></i>
                      Select form Library
                    </button>
                  </li>
                </ul>
              </div>
              <button
                className="btn btn-warning btn-sm d-flex align-items-center"
                style={{ minWidth: 120 }}
                onClick={() => onEditReading(reading)}
                title="Edit reading"
              >
                <i className="bi bi-pencil-fill me-1"></i>
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm d-flex align-items-center"
                style={{ minWidth: 120 }}
                onClick={() => onRemoveReading(reading)}
                title="Remove reading"
              >
                <i className="bi bi-trash-fill me-1"></i>
                Remove
              </button>
            </div>
          </div>

          <div className="collapse show" id={`reading-${reading.id}`}>
            <Droppable
              droppableId={`reading-${reading.id}-games`}
              type="game"
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`card-body border-start border-2 border-secondary ms-4 ${snapshot.isDraggingOver ? 'bg-light' : ''}`}
                  style={{ minHeight: '60px' }}
                >
                  {games.map((game, gameIndex) => (
                    <GameItem
                      key={game.id}
                      game={game}
                      index={gameIndex}
                      onEditGame={onEditGame}
                      onRemoveGame={onRemoveGame}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      )}
    </Draggable>
  );
};

interface GameItemProps {
  game: LearningPathItem;
  index: number;
  onEditGame: (item: LearningPathItem) => void;
  onRemoveGame: (item: LearningPathItem) => void;
}

const GameItem: React.FC<GameItemProps> = ({
  game,
  index,
  onEditGame,
  onRemoveGame
}) => {
  return (
    <Draggable draggableId={`game-${game.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`card mb-2 ${snapshot.isDragging ? 'opacity-75' : ''}`}
        >
          <div className="card-body py-2 px-3 bg-light bg-opacity-50">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center flex-grow-1">
                <div
                  {...provided.dragHandleProps}
                  className="me-3 text-muted cursor-grab"
                  style={{ cursor: 'grab' }}
                  title="Drag to reorder within reading"
                >
                  <i className="bi bi-grip-vertical"></i>
                </div>
                <i className="bi bi-controller text-secondary me-2"></i>
                <small className="fw-medium text-dark">
                  {game.sequence_order}. Game: {game.name}
                </small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-warning btn-sm d-flex align-items-center"
                  style={{ minWidth: 100 }}
                  onClick={() => onEditGame(game)}
                  title="Edit game"
                >
                  <i className="bi bi-pencil me-1"></i>
                  Sửa
                </button>
                <button
                  className="btn btn-danger btn-sm d-flex align-items-center"
                  style={{ minWidth: 100 }}
                  onClick={() => onRemoveGame(game)}
                  title="Remove game"
                >
                  <i className="bi bi-trash me-1"></i>
                  Remove 
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export { CategoryComponent, ReadingItem, GameItem };