import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { Word, GameWord, CreateGameWordDto, getWordTypeName } from '../../../types/word';

const Container = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 16px;
`;

const Column = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ColumnHeader = styled.div`
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
`;

const SearchWrapper = styled.div`
  position: relative;
  .ant-input-prefix {
    margin-right: 8px;
  }
`;

const WordList = styled.div`
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 8px;
  min-height: 400px;
  background: white;
  overflow-y: auto;
`;

const WordItem = styled.div<{ isDragging?: boolean }>`
  padding: 12px;
  margin-bottom: 8px;
  background: ${props => props.isDragging ? '#f0f0f0' : 'white'};
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: grab;
  
  &:hover {
    background: #f5f5f5;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const WordText = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const WordMeta = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const WordType = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  background: #e6f7ff;
  color: #1890ff;
  font-size: 11px;
`;

const GameInfo = styled.div`
  margin-bottom: 16px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
`;

const InfoItem = styled.div`
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-weight: bold;
  margin-right: 8px;
`;

const LevelSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const LevelButton = styled(Button)<{ $active?: boolean }>`
  &&& {
    background: ${props => props.$active ? '#1890ff' : 'white'};
    color: ${props => props.$active ? 'white' : 'inherit'};
  }
`;

interface AssignWordsModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (wordAssignments: CreateGameWordDto[]) => void;
  allWords: Word[];
  selectedGameWords: GameWord[];
  loading?: boolean;
  game: {
    id: number;
    name: string;
  };
  reading?: {
    name: string;
    difficulty: number;
  };
}

const AssignWordsModal: React.FC<AssignWordsModalProps> = ({
  visible,
  onCancel,
  onSave,
  allWords = [],
  selectedGameWords = [],
  loading = false,
  game,
  reading
}) => {
  const [availableWords, setAvailableWords] = useState<Word[]>([]);
  const [assignedWords, setAssignedWords] = useState<Word[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  useEffect(() => {
    // Initialize available and assigned words
    setAvailableWords(allWords.filter(word => 
      !selectedGameWords.some(gameWord => gameWord.word_id === word.id)
    ));
    // Convert GameWord[] to Word[] for assigned words
    setAssignedWords(selectedGameWords
      .map(gameWord => allWords.find(w => w.id === gameWord.word_id))
      .filter((word): word is Word => word !== undefined)
    );
  }, [allWords, selectedGameWords]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredAvailableWords = availableWords.filter(word => 
    word.word.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    // Create new arrays to avoid mutating state directly
    const newAvailable = Array.from(availableWords);
    const newAssigned = Array.from(assignedWords);

    let itemToMove;
    if (source.droppableId === 'available') {
      [itemToMove] = newAvailable.splice(source.index, 1);
      newAssigned.splice(destination.index, 0, itemToMove);
      setAvailableWords(newAvailable);
      setAssignedWords(newAssigned);
    } else {
      [itemToMove] = newAssigned.splice(source.index, 1);
      newAvailable.splice(destination.index, 0, itemToMove);
      setAssignedWords(newAssigned);
      setAvailableWords(newAvailable);
    }
  };

  const handleSave = () => {
    const wordAssignments = assignedWords.map((word, index) => ({
      word_id: word.id,
      game_id: game.id,
      level: selectedLevel,
      order: index + 1,
    }));
    onSave(wordAssignments);
  };

  return (
    <Modal
      title="Assign Words"
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={handleSave}
          loading={loading}
        >
          Save
        </Button>
      ]}
    >
      <GameInfo>
        {game && (
          <InfoItem>
            <InfoLabel>Game:</InfoLabel>
            {game.name}
          </InfoItem>
        )}
        {reading && (
          <>
            <InfoItem>
              <InfoLabel>Reading:</InfoLabel>
              {reading.name}
            </InfoItem>
            <InfoItem>
              <InfoLabel>Difficulty Level:</InfoLabel>
              {reading.difficulty}
            </InfoItem>
          </>
        )}
      </GameInfo>

      <LevelSelector>
        {[1, 2, 3].map(level => (
          <LevelButton
            key={level}
            $active={selectedLevel === level}
            onClick={() => setSelectedLevel(level)}
          >
            Level {level}
          </LevelButton>
        ))}
      </LevelSelector>

      <Container>
        <Column>
          <ColumnHeader>Available Words</ColumnHeader>
          <SearchWrapper>
            <Input
              placeholder="Search words..."
              prefix={<SearchOutlined />}
              onChange={e => handleSearch(e.target.value)}
              value={searchText}
            />
          </SearchWrapper>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="available">
              {(provided, snapshot) => (
                <WordList
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {filteredAvailableWords.map((word, index) => (
                    <Draggable 
                      key={word.id} 
                      draggableId={word.id.toString()} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <WordItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          isDragging={snapshot.isDragging}
                        >
                          <WordText>{word.word}</WordText>
                          <WordMeta>
                            <WordType>{getWordTypeName(word.type)}</WordType>
                            {word.note && <span>·</span>}
                            {word.note && <span>{word.note}</span>}
                          </WordMeta>
                        </WordItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </WordList>
              )}
            </Droppable>
          </DragDropContext>
        </Column>

        <Column>
          <ColumnHeader>Selected Words</ColumnHeader>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="assigned">
              {(provided, snapshot) => (
                <WordList
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {assignedWords.map((word, index) => (
                    <Draggable 
                      key={word.id} 
                      draggableId={word.id.toString()} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <WordItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          isDragging={snapshot.isDragging}
                        >
                          <WordText>{word.word}</WordText>
                          <WordMeta>
                            <WordType>{getWordTypeName(word.type)}</WordType>
                            {word.note && <span>·</span>}
                            {word.note && <span>{word.note}</span>}
                          </WordMeta>
                        </WordItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </WordList>
              )}
            </Droppable>
          </DragDropContext>
        </Column>
      </Container>
    </Modal>
  );
};

export default AssignWordsModal;