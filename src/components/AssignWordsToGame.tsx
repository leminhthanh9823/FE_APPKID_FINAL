import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Input, Button, Typography, Spin } from 'antd';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { SearchOutlined, DownOutlined } from '@ant-design/icons';
import { Word, GameWord, WordType, getWordTypeName } from '../types/word';
import { useAssignWords } from '../hooks/useAssignWords';

const { Text } = Typography;

interface Props {
  gameTitle: string;
  gameId: number;
  allWords: Word[];
  selectedWords: GameWord[];
  onSave?: (words: Array<{word_id: number; level: number; order: number}>) => void;
  onCancel: () => void;
  maxLevel?: number;
}

interface LocalGameWord extends Word {
  order: number;
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: #1e1e1e;
  color: #fff;
  display: flex;
  flex-direction: column;
  border: 1px solid #333;
  height: 100vh;
`;

const Header = styled.div`
  border-bottom: 1px solid #333;
  padding: 8px;
  text-align: center;
  font-weight: bold;
  font-size: 14px;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const InfoBar = styled.div`
  padding: 12px;
  border-bottom: 1px solid #333;
  display: flex;
  gap: 24px;
  align-items: center;

  .reading-info {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .filter-info {
    display: flex;
    gap: 8px;
    align-items: center;
    color: #888;
  }

  .show-all {
    color: #1890ff;
    cursor: pointer;
  }
`;

const WordsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  flex: 1;
  background: #333;
`;

const WordPanel = styled.div`
  background: #1e1e1e;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .header {
    text-transform: uppercase;
    font-weight: bold;
    font-size: 14px;
    color: #d8d8d8;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .search-area {
    display: flex;
  gap: 12px;
  align-items: center;    .search-input {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border: 1px solid #333;
      border-radius: 2px;
      background: transparent;

      .ant-input {
        background: transparent;
        border: none;
        color: #fff;
        &::placeholder {
          color: #666;
        }
        &:focus {
          box-shadow: none;
        }
      }
    }

    .filter-buttons {
      display: flex;
      gap: 4px;
    }

    .filter-button {
      padding: 4px 8px;
      border: 1px solid #333;
      background: #2d2d2d;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
    }
  }

  .words-list {
    flex: 1;
    border: 1px solid #333;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
  }
`;

const WordBox = styled.div<{ isDragging?: boolean }>`
  border: 1px solid ${props => props.isDragging ? '#1890ff' : '#333'};
  background: #2d2d2d;
  padding: 8px;

  .word-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .word-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .word-info {
    display: flex;
    gap: 4px;
    align-items: center;

    .word-index {
      color: #888;
      margin-right: 4px;
    }

    .word-icon {
      margin-right: 4px;
    }

    .word-type {
      color: #888;
      font-size: 13px;
    }
  }

  .word-definition {
    color: #888;
    font-size: 13px;
    margin-top: 4px;
  }

  .action-button {
    padding: 2px 8px;
    color: ${props => props.isDragging ? '#1890ff' : '#fff'};
    cursor: pointer;
    font-size: 13px;

    &:hover {
      color: #1890ff;
    }

    &.remove {
      color: #ff4d4f;
    }
  }
`;

const Footer = styled.div`
  border-top: 1px solid #333;
  padding: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  button {
    padding: 6px 16px;
    border: 1px solid #333;
    background: #2d2d2d;
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      border-color: #1890ff;
    }

    &.primary {
      background: #1890ff;
      border-color: #1890ff;

      &:hover {
        background: #40a9ff;
      }
    }
  }
`;

const Navigation = styled.div`
  padding: 8px 12px;
  border-top: 1px solid #333;
  color: #888;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;

  .page-buttons {
    display: flex;
    gap: 4px;

    button {
      padding: 2px 8px;
      border: 1px solid #333;
      background: #2d2d2d;
      color: #888;
      cursor: pointer;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &.active {
        background: #1890ff;
        color: #fff;
      }
    }
  }
`;



const AssignWordsToGame: React.FC<Props> = ({
  gameTitle,
  gameId,
  allWords,
  selectedWords,
  onSave,
  onCancel,
  maxLevel = 2
}) => {
  const { assignWordsToGame, loading: apiLoading } = useAssignWords();
  const [search, setSearch] = useState('');
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [localSelectedWords, setLocalSelectedWords] = useState<LocalGameWord[]>(
    selectedWords.map(sw => ({
      ...(sw.word || {}),
      order: sw.order,
    } as LocalGameWord))
  );
  const [showAllLevels, setShowAllLevels] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredWords = allWords.filter(word => {
    if (!showAllLevels && word.level > maxLevel) return false;
    if (localSelectedWords.some(sw => sw.id === word.id)) return false;
    return word.word.toLowerCase().includes(search.toLowerCase());
  });

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(localSelectedWords);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setLocalSelectedWords(items.map((item, index) => ({
      ...item,
      order: index + 1
    })));
  }, [localSelectedWords]);

  const addWordToGame = (word: Word) => {
    if (localSelectedWords.find(w => w.id === word.id)) return;
    
    setLocalSelectedWords([
      ...localSelectedWords,
      {
        ...word,
        order: localSelectedWords.length + 1
      }
    ]);
  };

  const removeWord = (wordId: number) => {
    setLocalSelectedWords(localSelectedWords.filter(w => w.id !== wordId));
  };

  const paginatedWords = filteredWords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredWords.length / itemsPerPage);

  const handleSave = async () => {
    try {
      const assignments = localSelectedWords.map(word => ({
        wordId: word.id,
        sequenceOrder: word.order
      }));

      await assignWordsToGame(gameId, assignments);
      
      // Call the original onSave if provided
      if (onSave) {
        onSave(localSelectedWords.map(word => ({
          word_id: word.id,
          level: word.level,
          order: word.order
        })));
      }
      
      onCancel(); // Close the modal after successful save
    } catch (error) {
      // Error is already handled by the hook
      console.error('Error saving word assignments:', error);
    }
  };

  return (
    <Container>
      <Header>
        ✏️ Assign Words to Game: "{gameTitle}"
      </Header>

      <ContentArea>
        <InfoBar>
          <div className="reading-info">
            <span>📖</span>
            <Text>Reading: "{gameTitle}" (Difficulty: Level {maxLevel})</Text>
          </div>
          <div className="filter-info">
            <span>⚙️</span>
            <Text>Auto-filter: Showing words Level ≤ {maxLevel}</Text>
            {!showAllLevels && (
              <span 
                className="show-all"
                onClick={() => setShowAllLevels(true)}
              >
                [⬚ Show All Levels]
              </span>
            )}
          </div>
        </InfoBar>

        <WordsContainer>
          <WordPanel>
            <div className="header">
              <span>AVAILABLE WORDS</span>
            </div>
            
            <div className="search-area">
              <div className="search-input">
                <SearchOutlined style={{ color: '#666' }} />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  bordered={false}
                />
              </div>
              <div className="filter-buttons">
                <div className="filter-button">
                  Level <DownOutlined style={{ fontSize: 10 }} />
                </div>
                <div className="filter-button">
                  Type <DownOutlined style={{ fontSize: 10 }} />
                </div>
              </div>
            </div>

            <div className="words-list">
              {paginatedWords.map(word => (
                <WordBox key={word.id} onClick={() => addWordToGame(word)}>
                  <div className="word-header">
                    <div className="word-info">
                      {word.type === WordType.Noun ? '🎯' : '💭'}
                      <span className="word-name">{word.word}</span>
                      <span className="word-type">(Level {word.level}, {getWordTypeName(word.type)})</span>
                    </div>
                    <span className="action-button">[Add to Game →]</span>
                  </div>
                  <div className="word-definition">{word.note || 'No definition available'}</div>
                </WordBox>
              ))}
            </div>

            <Navigation>
              <span>Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredWords.length)} of {filteredWords.length} words</span>
              <div className="page-buttons">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={currentPage === i + 1 ? 'active' : ''}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
              </div>
            </Navigation>
          </WordPanel>

          <WordPanel>
            <div className="header">
              <span>SELECTED WORDS</span>
              <span>({localSelectedWords.length} selected)</span>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="selected-words">
                {(provided) => (
                  <div 
                    className="words-list"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {localSelectedWords.map((word, index) => (
                      <Draggable
                        key={word.id}
                        draggableId={word.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <WordBox
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            isDragging={snapshot.isDragging}
                          >
                            <div className="word-header">
                              <div className="word-info">
                                <span className="word-index">{index + 1}.</span>
                                {word.type === WordType.Noun ? '🎯' : '💭'}
                                <span className="word-name">{word.word}</span>
                                <span className="word-type">({getWordTypeName(word.type)})</span>
                              </div>
                              <span 
                                className="action-button remove"
                                onClick={() => removeWord(word.id)}
                              >
                                [Remove]
                              </span>
                            </div>
                          </WordBox>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <div style={{ padding: '8px', color: '#888', fontSize: '13px' }}>
              💡 Drag words to reorder sequence
            </div>
          </WordPanel>
        </WordsContainer>

        <Footer>
          <button onClick={onCancel}>
            [Cancel]
          </button>
          <button 
            className="primary"
            onClick={handleSave}
            disabled={apiLoading}
          >
            {apiLoading ? <Spin size="small" /> : '[Save Changes]'}
          </button>
        </Footer>
      </ContentArea>
    </Container>
  );
};

export default AssignWordsToGame;