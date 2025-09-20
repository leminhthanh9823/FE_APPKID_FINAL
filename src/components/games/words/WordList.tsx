import { useDrag, useDrop } from 'react-dnd';
import { List, Tag } from 'antd';
import { Word, WordType, getWordTypeName } from '../../../types/word';

interface WordListProps {
  words: Word[];
  onWordClick: (word: Word) => void;
  onWordDrag: (word: Word) => void;
  droppable: boolean;
}

interface DragItem {
  type: string;
  word: Word;
}

const WordList: React.FC<WordListProps> = ({
  words,
  onWordClick,
  onWordDrag,
  droppable,
}) => {
  const [, drop] = useDrop({
    accept: 'word',
    drop: (item: DragItem) => {
      onWordDrag(item.word);
    },
    canDrop: () => droppable,
  });

  const renderWordItem = (word: Word) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'word',
      item: { type: 'word', word },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <List.Item
        ref={drag}
        onClick={() => onWordClick(word)}
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: 'move',
        }}
      >
        <div className="word-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="word-text" style={{ marginRight: '8px' }}>{word.word}</span>
            <Tag color="blue">{getWordTypeName(word.type)}</Tag>
            <Tag color={word.level <= 2 ? 'green' : word.level <= 4 ? 'orange' : 'red'}>
              Level {word.level}
            </Tag>
          </div>
          {word.note && (
            <span className="word-context" style={{ color: '#888', fontSize: '0.9em' }}>{word.note}</span>
          )}
        </div>
      </List.Item>
    );
  };

  return (
    <div ref={drop} className="word-list">
      <List
        size="small"
        dataSource={words}
        renderItem={renderWordItem}
        className={droppable ? 'droppable' : ''}
      />
    </div>
  );
};

export default WordList;