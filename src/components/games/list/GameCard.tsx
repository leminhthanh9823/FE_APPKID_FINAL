import { Card, Tag, Button, Dropdown, MenuProps, Statistic, Space, Divider } from 'antd';
import { EllipsisOutlined, PictureOutlined, UserOutlined, BookOutlined, ReadOutlined } from '@ant-design/icons';
import { Game, GameType, GameStatus } from '../../../types/game';
import styled from 'styled-components';

interface GameCardProps {
  game: Game;
  onEdit: (game: Game) => void;
  onDelete: (gameId: number) => void;
  isDragging?: boolean;
}

const StyledCard = styled(Card)<{ $isDragging?: boolean }>`
  transition: all 0.2s ease;
  cursor: ${props => props.$isDragging ? 'grabbing' : 'grab'};
  box-shadow: ${props => props.$isDragging 
    ? '0 10px 30px rgba(0,0,0,0.3)' 
    : '0 2px 8px rgba(0,0,0,0.1)'};
  width: 320px;
  min-width: 320px;
  max-width: 320px;
  height: 420px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  box-sizing: border-box;
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: none;
  }
  .ant-card-body {
    padding: 16px;
  }
  .game-image {
    width: 100%;
    height: 160px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 0;
    display: block;
  }
  .game-image-placeholder {
    width: 100%;
    height: 160px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #8c8c8c;
    .anticon {
      font-size: 32px;
      margin-bottom: 8px;
    }
  }
  .hidden {
    display: none;
  }
  .game-description {
    color: #666;
    margin-bottom: 0;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    min-height: 24px;
    display: flex;
    align-items: center;
  }
  .game-stats {
    min-height: 56px;
    margin-bottom: 0;
    display: flex;
    align-items: center;
  }
  .game-meta {
    min-height: 32px;
    margin-bottom: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .game-meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  .game-stats {
    background: #f8f9fa;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 12px;
    .ant-statistic {
      text-align: center;
      .ant-statistic-content {
        font-size: 16px;
        font-weight: 600;
      }
      .ant-statistic-title {
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
      }
    }
  }
  .prerequisite-info {
    background: #e6f4ff;
    border: 1px solid #91caff;
    border-radius: 6px;
    padding: 8px;
    margin-bottom: 12px;
    .prerequisite-title {
      font-size: 12px;
      color: #0958d9;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
`;

const GameCard: React.FC<GameCardProps> = ({
  game,
  onEdit,
  onDelete,
  isDragging = false,
}) => {
  const getStatusColor = (isActive: number) => {
    return isActive ? 'green' : 'red';
  };

  const getStatusText = (isActive: number) => {
    return isActive ? 'Active' : 'Inactive';
  };

  const getGameTypeName = (type: number) => {
    const gameTypes = Object.values(GameType);
    return gameTypes[type] || 'Unknown';
  };

  const menuItems = [
    {
      key: 'edit',
      label: 'Edit',
      onClick: () => onEdit(game),
    } as const,
    {
      key: 'delete',
      label: 'Remove',
      danger: true,
      onClick: () => onDelete(game.id),
    } as const,
    {
      type: 'divider',
    } as const,
  ] as MenuProps['items'];

  return (
    <StyledCard
      $isDragging={isDragging}
      className="game-card"
      title={game.name}
      extra={
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>
      }
    >
      <div style={{ position: 'relative', marginBottom: 12 }}>
        {game.image ? (
          <img
            src={game.image}
            alt={game.name}
            className="game-image"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const placeholder = target.nextElementSibling as HTMLElement;
              if (placeholder) {
                placeholder.classList.remove('hidden');
              }
            }}
          />
        ) : null}
        <div className={`game-image-placeholder ${game.image ? 'hidden' : ''}`}>
          <PictureOutlined />
          <span>No Image</span>
        </div>
      </div>
      <p className="game-description">{game.description || ''}</p>
      <div className="game-stats">
        <Space split={<Divider type="vertical" />} style={{ width: '100%', justifyContent: 'center' }}>
          <Statistic
            title="Students"
            value={game.studentCompletionCount || 0}
            prefix={<UserOutlined />}
          />
          <Statistic
            title="Words"
            value={game.wordCount || 0}
            prefix={<BookOutlined />}
          />
        </Space>
      </div>
      
      <div className="game-meta">
        <Tag>{getGameTypeName(game.type).replace(/_/g, ' ')}</Tag>
        <Tag color={getStatusColor(game.is_active)}>{getStatusText(game.is_active)}</Tag>
      </div>
    </StyledCard>
  );
};

export default GameCard;