import { Card, Tag, Button, Dropdown, MenuProps } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import { Game, GameType, GameStatus } from '../../../types/game';

interface GameCardProps {
  game: Game;
  onEdit: (game: Game) => void;
  onDelete: (gameId: number) => void;
}

const GameCard: React.FC<GameCardProps> = ({
  game,
  onEdit,
  onDelete,
}) => {
  const getStatusColor = (isActive: number) => {
    return isActive ? 'green' : 'red';
  };

  const getStatusText = (isActive: number) => {
    return isActive ? 'Published' : 'Archived';
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
      label: 'Delete',
      danger: true,
      onClick: () => onDelete(game.id),
    } as const,
    {
      type: 'divider',
    } as const,
  ] as MenuProps['items'];

  return (
    <Card
      className="game-card"
      title={game.name}
      extra={
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>
      }
    >
      <p className="game-description">{game.description}</p>
      <div className="game-meta">
        <Tag>{getGameTypeName(game.type).replace(/_/g, ' ')}</Tag>
        <Tag color={getStatusColor(game.is_active)}>{getStatusText(game.is_active)}</Tag>
      </div>
    </Card>
  );
};

export default GameCard;