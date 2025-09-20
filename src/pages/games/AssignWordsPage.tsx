import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Input, Tabs, Space, Tag, message, Spin, Modal, Form, Select, Upload } from 'antd';
import { SearchOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import useGameEdit from '../../hooks/useGameEdit';
import { Word, getWordTypeName } from '../../types/word';
import { Game } from '../../types/game';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import useCreateWord from '../../hooks/useCreateWord';
import styled from 'styled-components';

const WordItemStyled = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isDragging',
})<{ isDragging?: boolean }>`
  padding: 12px;
  margin-bottom: 8px;
  background: ${props => props.isDragging ? '#2c2c2c' : '#252525'};
  border: 1px solid #404040;
  border-radius: 4px;
  cursor: grab;
  color: #fff;
  
  &:hover {
    background: #2c2c2c;
  }

  .ant-tag {
    margin-left: 8px;
  }

  .ant-space {
    width: 100%;
    justify-content: space-between;
  }
`;

const WordItem = React.memo<{ word: Word; index: number }>(({ word, index }) => (
  <Draggable key={word.id} draggableId={word.id.toString()} index={index}>
    {(provided, snapshot) => (
      <WordItemStyled
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        isDragging={snapshot.isDragging}
      >
        <Space>
          <span>{word.word}</span>
          <Tag color="blue">{getWordTypeName(word.type)}</Tag>
        </Space>
      </WordItemStyled>
    )}
  </Draggable>
));

const WordContainer = styled.div`
  min-height: 400px;
  padding: 16px;
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 4px;
  margin-top: 16px;
  color: #fff;
`;

const AssignWordsPage: React.FC = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('1');
  const [currentReadingId, setCurrentReadingId] = useState<string>('');

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);
  
  const [availableWords, setAvailableWords] = useState<Word[]>([]);
  const [assignedWords, setAssignedWords] = useState<Word[]>([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { createWord, loading: creating } = useCreateWord();

  const {
    game,
    allWords,
    gameWords,
    loading,
    updateGameWords
  } = useGameEdit(gameId || '');

  // Set currentReadingId when game data is loaded
  useEffect(() => {
    if (game && game.prerequisite_reading_id) {
      const readingId = game.prerequisite_reading_id.toString();
      console.log('Setting currentReadingId:', readingId);
      setCurrentReadingId(readingId);
    }
  }, [game]);

  // Initialize lists
  useEffect(() => {
    console.log('Debug - Data received:', {
      allWords: allWords?.length,
      gameWords: gameWords?.length,
      selectedLevel,
      game
    });

    if (allWords && gameWords) {
      console.log('Raw gameWords (assigned words from API):', gameWords);
      console.log('Raw allWords:', allWords);
      
      // gameWords is actually words that are already assigned to this game
      // We need to extract the assigned word IDs from gameWords
      const assignedWordIds = new Set(gameWords.map((word: any) => word.id));
      console.log('Assigned word IDs from API:', Array.from(assignedWordIds));
      
      // Filter words by level
      const currentLevelWords = allWords.filter(w => w.level <= parseInt(selectedLevel));
      console.log('Current level words:', currentLevelWords.map(w => ({ id: w.id, word: w.word, level: w.level })));
      
      // Available words = all current level words that are NOT assigned
      const available = currentLevelWords.filter(w => !assignedWordIds.has(w.id));
      console.log('Available words after filtering:', available.map(w => ({ id: w.id, word: w.word })));
      
      // Assigned words = gameWords filtered by current level and sorted by sequence_order
      const assignedWordsData = gameWords
        .filter((word: any) => word.level <= parseInt(selectedLevel))
        .sort((a: any, b: any) => {
          // Sort by sequence_order from game_words relation
          const aOrder = a.games?.[0]?.game_words?.sequence_order || 999;
          const bOrder = b.games?.[0]?.game_words?.sequence_order || 999;
          return aOrder - bOrder;
        });

      console.log('Debug - Processed data:', {
        currentLevelWords: currentLevelWords.length,
        available: available.length,
        assigned: assignedWordsData.length,
        assignedIds: Array.from(assignedWordIds)
      });

      setAvailableWords(available);
      setAssignedWords(assignedWordsData);
    }
  }, [allWords, gameWords, selectedLevel, game]);

  // Filter available words based on search text
  const filteredAvailableWords = React.useMemo(() => 
    availableWords.filter(word => 
      word.word.toLowerCase().includes(debouncedSearchText.toLowerCase())
    ), [availableWords, debouncedSearchText]
  );

  // Handle drag end
  const handleDragEnd = React.useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Reordering within the same list
      if (source.droppableId === 'available') {
        setAvailableWords(prev => {
          const items = Array.from(prev);
          const [reorderedItem] = items.splice(result.source.index, 1);
          items.splice(result.destination!.index, 0, reorderedItem);
          return items;
        });
      } else {
        setAssignedWords(prev => {
          const items = Array.from(prev);
          const [reorderedItem] = items.splice(result.source.index, 1);
          items.splice(result.destination!.index, 0, reorderedItem);
          return items;
        });
      }
    } else {
      // Moving between lists
      if (source.droppableId === 'available') {
        const movedItem = availableWords[source.index];
        setAvailableWords(prev => prev.filter((_, index) => index !== source.index));
        setAssignedWords(prev => {
          const newItems = Array.from(prev);
          newItems.splice(destination.index, 0, movedItem);
          return newItems;
        });
      } else {
        const movedItem = assignedWords[source.index];
        setAssignedWords(prev => prev.filter((_, index) => index !== source.index));
        setAvailableWords(prev => {
          const newItems = Array.from(prev);
          newItems.splice(destination.index, 0, movedItem);
          return newItems;
        });
      }
    }
  }, [availableWords, assignedWords]);

  // Handle save
  const handleSave = async () => {
    try {
      // Get all existing words for other levels
      const otherLevelsWords = gameWords
        .filter(word => word.level !== parseInt(selectedLevel))
        .map((word, index) => ({
          wordId: word.id,
          level: word.level,
          isActive: true,
          order: word.games?.[0]?.game_words?.sequence_order || index + 1
        }));

      // Add new assignments for current level
      const currentLevelAssignments = assignedWords.map((word, index) => ({
        wordId: word.id,
        level: parseInt(selectedLevel),
        isActive: true,
        order: index + 1
      }));

      // Combine both arrays
      await updateGameWords([...otherLevelsWords, ...currentLevelAssignments]);
      message.success('Words assigned successfully');
      if (currentReadingId) {
        navigate(`/reading/${currentReadingId}/games/${gameId}/edit`);
      } else {
        navigate('/games');
      }
    } catch (error) {
      message.error('Failed to assign words');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!game) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Game not found</h2>
      </div>
    );
  }

  return (
    <main className="main" id="main">
      <div className="pagetitle">
        <h1>Assign Words - {game.name}</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/dashboard">CMS</a></li>
            {currentReadingId ? (
              <>
                <li className="breadcrumb-item"><a href={`/reading/${currentReadingId}`}>Reading Management</a></li>
                <li className="breadcrumb-item"><a href={`/reading/${currentReadingId}/games`}>View Game</a></li>
              </>
            ) : (
              <li className="breadcrumb-item"><a href="/games">Games</a></li>
            )}
            <li className="breadcrumb-item active">Assign Words</li>
          </ol>
        </nav>
      </div>

      <Card
        title="Manage Words"
        extra={
          <Space>
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
            >
              Add Word
            </Button>
            <Button onClick={() => {
              if (currentReadingId) {
                navigate(`/reading/${currentReadingId}/games/${gameId}/edit`);
              } else {
                navigate('/games');
              }
            }}>
              Back to Game
            </Button>
          </Space>
        }
      >
        <Tabs
          activeKey={selectedLevel}
          onChange={key => setSelectedLevel(key)}
          items={[
            { key: '1', label: 'Level 1' },
            { key: '2', label: 'Level 2' },
            { key: '3', label: 'Level 3' },
            { key: '4', label: 'Level 4' },
            { key: '5', label: 'Level 5' },
          ]}
        />

        <Input
          placeholder="Search words..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ marginBottom: 16, width: 300 }}
        />

        <DragDropContext onDragEnd={handleDragEnd}>
          <Space size="large" style={{ width: '100%', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <h3>Available Words ({filteredAvailableWords.length})</h3>
              <Droppable droppableId="available">
                {(provided) => (
                  <WordContainer ref={provided.innerRef} {...provided.droppableProps}>
                    {filteredAvailableWords.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                        {loading ? 'Loading...' : 'No available words found'}
                        {!loading && allWords.length === 0 && (
                          <div style={{ marginTop: '10px', fontSize: '12px' }}>
                            Debug: Total words loaded = {allWords.length}
                          </div>
                        )}
                      </div>
                    ) : (
                      filteredAvailableWords.map((word, index) => (
                        <WordItem key={word.id} word={word} index={index} />
                      ))
                    )}
                    {provided.placeholder}
                  </WordContainer>
                )}
              </Droppable>
            </div>

            <div style={{ flex: 1 }}>
              <h3>Selected Words ({assignedWords.length})</h3>
              <Droppable droppableId="assigned">
                {(provided) => (
                  <WordContainer ref={provided.innerRef} {...provided.droppableProps}>
                    {assignedWords.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                        {loading ? 'Loading...' : 'No words selected'}
                        {!loading && gameWords.length === 0 && (
                          <div style={{ marginTop: '10px', fontSize: '12px' }}>
                            Debug: Game words loaded = {gameWords.length}
                          </div>
                        )}
                      </div>
                    ) : (
                      assignedWords.map((word, index) => (
                        <WordItem key={word.id} word={word} index={index} />
                      ))
                    )}
                    {provided.placeholder}
                  </WordContainer>
                )}
              </Droppable>
            </div>
          </Space>
        </DragDropContext>

        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Space>
            <Button onClick={() => {
              if (currentReadingId) {
                navigate(`/reading/${currentReadingId}/games/${gameId}/edit`);
              } else {
                navigate('/games');
              }
            }}>
              Cancel
            </Button>
            <Button type="primary" onClick={handleSave}>
              Save
            </Button>
          </Space>
        </div>
      </Card>

      <Modal
        title="Create New Word"
        open={isCreateModalVisible}
        onOk={form.submit}
        onCancel={() => {
          setIsCreateModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={creating}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              const formData = new FormData();
              
              // Append word data fields
              formData.append('word', values.word);
              formData.append('type', values.type.toString());
              formData.append('level', values.level.toString());
              formData.append('note', values.note || '');
              formData.append('is_active', '1');
              
              // Append file if exists
              if (values.image) {
                formData.append('image', values.image);
              }

              const newWord = await createWord(formData);
              message.success('Word created successfully');
              setIsCreateModalVisible(false);
              form.resetFields();
              
              // Add new word to available words list
              if (newWord.level <= parseInt(selectedLevel)) {
                setAvailableWords(prev => [...prev, newWord]);
              }
            } catch (error) {
              message.error('Failed to create word');
            }
          }}
        >
          <Form.Item
            name="word"
            label="Word"
            rules={[{ required: true, message: 'Please input the word' }]}
          >
            <Input maxLength={100} showCount />
          </Form.Item>

          <Form.Item
            name="type"
            label="Word Type"
            rules={[{ required: true, message: 'Please select word type' }]}
          >
            <Select>
              <Select.Option value={1}>Noun</Select.Option>
              <Select.Option value={2}>Verb</Select.Option>
              <Select.Option value={3}>Adjective</Select.Option>
              <Select.Option value={4}>Adverb</Select.Option>
              <Select.Option value={5}>Preposition</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="level"
            label="Level"
            rules={[{ required: true, message: 'Please select level' }]}
          >
            <Select>
              <Select.Option value={1}>Level 1</Select.Option>
              <Select.Option value={2}>Level 2</Select.Option>
              <Select.Option value={3}>Level 3</Select.Option>
              <Select.Option value={4}>Level 4</Select.Option>
              <Select.Option value={5}>Level 5</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="image"
            label="Image"
            valuePropName="file"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList?.[0]?.originFileObj;
            }}
          >
            <Upload
              accept="image/*"
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="note"
            label="Note"
          >
            <Input.TextArea rows={3} maxLength={1000} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
};

export default AssignWordsPage;