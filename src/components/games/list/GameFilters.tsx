import { useState } from 'react';
import { Input, Select, Card } from 'antd';
import { GameStatus, GameType, GameFilters as IGameFilters } from '../../../types/game';

const { Search } = Input;

interface GameFiltersProps {
  onFiltersChange: (filters: IGameFilters) => void;
  initialFilters?: IGameFilters;
}

const GameFilters: React.FC<GameFiltersProps> = ({
  onFiltersChange,
  initialFilters,
}) => {
  const [filters, setFilters] = useState<IGameFilters>(
    initialFilters || {
      search: ''
    }
  );

  const handleFilterChange = (
    key: keyof IGameFilters,
    value: string | GameType | GameStatus | undefined
  ) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const gameTypes = Object.values(GameType).map(type => ({
    value: type,
    label: type.replace(/_/g, ' ')
  }));

  return (
    <Card className="game-filters mb-4">
      <div className="flex flex-wrap gap-4">
        <Search
          placeholder="Search games..."
          allowClear
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          style={{ width: 200 }}
        />

        <Select
          placeholder="Game Type"
          allowClear
          style={{ width: 150 }}
          value={filters.type}
          onChange={(value) => handleFilterChange('type', value)}
        >
          {gameTypes.map((type) => (
            <Select.Option key={type.value} value={type.value}>
              {type.label}
            </Select.Option>
          ))}
        </Select>

        <Select
          placeholder="Status"
          allowClear
          style={{ width: 150 }}
          value={filters.status}
          onChange={(value) => handleFilterChange('status', value)}
        >
          {Object.values(GameStatus).map((status) => (
            <Select.Option key={status} value={status}>
              {status}
            </Select.Option>
          ))}
        </Select>
      </div>
    </Card>
  );
};

export default GameFilters;