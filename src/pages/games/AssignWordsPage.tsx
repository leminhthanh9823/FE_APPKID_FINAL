import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Input, Tabs, Space, Tag, Spin, Modal, Form, Select, Upload } from 'antd';
import { toast } from 'react-toastify';
import { SearchOutlined, PlusOutlined, UploadOutlined, EditOutlined } from '@ant-design/icons';
import useGameEdit from '../../hooks/useGameEdit';
import { Word, getWordTypeName } from '../../types/word';
import { Game } from '../../types/game';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import useCreateWord from '../../hooks/useCreateWord';
import useEditWord from '../../hooks/useEditWord';
import styled from 'styled-components';

const WordItemStyled = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isDragging',
})<{ isDragging?: boolean }>`
  padding: 16px;
  margin-bottom: 12px;
  background: ${props => props.isDragging ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  border: 2px solid ${props => props.isDragging ? '#667eea' : '#e8f4fd'};
  border-radius: 10px;
  cursor: grab;
  color: ${props => props.isDragging ? 'white' : '#333'};
  box-shadow: ${props => props.isDragging ? '0 8px 25px rgba(102, 126, 234, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  transition: all 0.2s ease;
  transform: ${props => props.isDragging ? 'rotate(2deg) scale(1.02)' : 'rotate(0deg) scale(1)'};
  
  &:hover {
    background: ${props => props.isDragging ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%)'};
    border-color: #667eea;
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2);
    transform: translateY(-2px);
  }

  .ant-tag {
    margin-left: 12px;
    border-radius: 20px;
    font-weight: 500;
    
    &.ant-tag-blue {
      background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
      border-color: transparent;
      color: white;
    }
  }

  .ant-space {
    width: 100%;
    justify-content: space-between;
  }
  
  .word-text {
    font-weight: 600;
    font-size: 15px;
  }
`;

const WordItem = React.memo<{ word: Word; index: number; onEdit?: (word: Word) => void }>(({ word, index, onEdit }) => (
  <Draggable key={word.id} draggableId={word.id.toString()} index={index}>
    {(provided, snapshot) => (
      <WordItemStyled
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        isDragging={snapshot.isDragging}
      >
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <span className="word-text">{word.word}</span>
            <Tag color="blue">{getWordTypeName(word.type)}</Tag>
          </Space>
          {onEdit && (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(word);
              }}
              style={{ 
                opacity: snapshot.isDragging ? 0 : 1,
                color: '#1890ff'
              }}
            />
          )}
        </Space>
      </WordItemStyled>
    )}
  </Draggable>
));

const WordContainer = styled.div`
  min-height: 500px;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border: 2px solid #e1e8ed;
  border-radius: 12px;
  margin-top: 20px;
  color: #333;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    border-color: #1890ff;
  }
`;

const StyledCard = styled(Card)`
  .ant-card-head {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px 12px 0 0;
    
    .ant-card-head-title {
      color: white;
      font-size: 20px;
      font-weight: 600;
    }
    
    .ant-card-extra {
      .ant-btn {
        border-radius: 8px;
        font-weight: 500;
        
        &.ant-btn-primary {
          background: #52c41a;
          border-color: #52c41a;
          
          &:hover {
            background: #73d13d;
            border-color: #73d13d;
          }
        }
        
        &:not(.ant-btn-primary) {
          background: white;
          color: #667eea;
          border-color: white;
          
          &:hover {
            background: #f0f0f0;
            border-color: #f0f0f0;
          }
        }
      }
    }
  }
  
  .ant-card-body {
    padding: 32px;
    background: white;
    border-radius: 0 0 12px 12px;
  }
  
  .ant-tabs-tab {
    font-size: 16px;
    font-weight: 500;
    padding: 12px 20px;
    
    &.ant-tabs-tab-active {
      .ant-tabs-tab-btn {
        color: #1890ff;
        font-weight: 600;
      }
    }
  }
  
  .ant-input-affix-wrapper {
    border-radius: 10px;
    border: 2px solid #e1e8ed;
    padding: 12px 16px;
    
    &:hover, &:focus {
      border-color: #1890ff;
      box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
    }
  }
`;

const WordSectionHeader = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  color: white;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
`;

const DragDropContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const ActionButtonsContainer = styled.div`
  margin-top: 32px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  text-align: right;
  
  .ant-btn {
    border-radius: 8px;
    font-weight: 500;
    padding: 8px 24px;
    height: auto;
    
    &:not(.ant-btn-primary) {
      border-color: #d9d9d9;
      
      &:hover {
        border-color: #40a9ff;
        color: #40a9ff;
      }
    }
    
    &.ant-btn-primary {
      background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
      border: none;
      
      &:hover {
        background: linear-gradient(135deg, #73d13d 0%, #52c41a 100%);
      }
    }
  }
`;

const AssignWordsPage: React.FC = () => {
  // Only allow 1 word for these types
  const SINGLE_WORD_TYPES = ['image_puzzle', 'four_pics_one_word'];
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('1');
  const [currentReadingId, setCurrentReadingId] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);
  
  const [availableWords, setAvailableWords] = useState<Word[]>([]);
  const [assignedWords, setAssignedWords] = useState<Word[]>([]);
  const [allLevelAssignments, setAllLevelAssignments] = useState<{ [level: string]: Word[] }>({});
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const { createWord, loading: creating } = useCreateWord();
  const { editWord, loading: editing } = useEditWord();

  const {
    game,
    allWords,
    gameWords,
    loading,
    updateGameWords
  } = useGameEdit(gameId || '');

  useEffect(() => {
    if (game && game.prerequisite_reading_id) {
      const readingId = game.prerequisite_reading_id.toString();
      console.log('Setting currentReadingId:', readingId);
      setCurrentReadingId(readingId);
    }
  }, [game]);

  useEffect(() => {
    if (allWords && gameWords) {
      const levelAssignments: { [level: string]: Word[] } = {};
      
      gameWords.forEach((word: any) => {
        const level = word.level.toString();
        if (!levelAssignments[level]) {
          levelAssignments[level] = [];
        }
        levelAssignments[level].push(word);
      });

      Object.keys(levelAssignments).forEach(level => {
        levelAssignments[level] = levelAssignments[level].sort((a: any, b: any) => {
          const aOrder = a.games?.[0]?.game_words?.sequence_order || 999;
          const bOrder = b.games?.[0]?.game_words?.sequence_order || 999;
          return aOrder - bOrder;
        });
      });

      setAllLevelAssignments(levelAssignments);
    }
  }, [allWords, gameWords]);

  useEffect(() => {
    if (allWords) {
      const allAssignedWordIds = new Set<number>();
      Object.values(allLevelAssignments).forEach(levelWords => {
        levelWords.forEach(word => allAssignedWordIds.add(word.id));
      });

      const currentLevelWords = allWords.filter(w => w.level === parseInt(selectedLevel));
      let assigned = allLevelAssignments[selectedLevel] || [];

      if (game && SINGLE_WORD_TYPES.includes(game.type)) {
        let firstAssigned: Word | undefined;
        for (const levelWords of Object.values(allLevelAssignments)) {
          if (levelWords && levelWords.length > 0) {
            firstAssigned = levelWords[0];
            break;
          }
        }
        assigned = firstAssigned ? [firstAssigned] : [];
        setAvailableWords(currentLevelWords.filter(w => !firstAssigned || w.id !== firstAssigned.id));
      } else {
        setAvailableWords(currentLevelWords.filter(w => !allAssignedWordIds.has(w.id)));
      }
      setAssignedWords(assigned);
    }
  }, [allWords, selectedLevel, allLevelAssignments, game]);

  const filteredAvailableWords = React.useMemo(() => 
    availableWords.filter(word => 
      word.word.toLowerCase().includes(debouncedSearchText.toLowerCase())
    ), [availableWords, debouncedSearchText]
  );

  const handleDragEnd = React.useCallback((result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (game && SINGLE_WORD_TYPES.includes(game.type)) {
      if (source.droppableId === 'available' && destination.droppableId === 'assigned') {
        if (assignedWords.length >= 1) {
          toast.error('This game type only allows 1 word.');
          return;
        }
      }
    }
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === 'available') {
        setAvailableWords(prev => {
          const items = Array.from(prev);
          const [reorderedItem] = items.splice(result.source.index, 1);
          items.splice(result.destination!.index, 0, reorderedItem);
          return items;
        });
      } else if (source.droppableId === 'assigned') {
        const newAssignedWords = Array.from(assignedWords);
        const [reorderedItem] = newAssignedWords.splice(result.source.index, 1);
        newAssignedWords.splice(result.destination!.index, 0, reorderedItem);
        setAssignedWords(newAssignedWords);
        setAllLevelAssignments(prev => ({
          ...prev,
          [selectedLevel]: newAssignedWords
        }));
      }
    } else {
      // Moving between lists
      if (source.droppableId === 'available' && destination.droppableId === 'assigned') {
        // Moving from available to assigned
        const movedItem = availableWords[source.index];
        const newAvailableWords = availableWords.filter((_, index) => index !== source.index);
        const newAssignedWords = Array.from(assignedWords);
        // If single-word type, only allow 1
        if (game && SINGLE_WORD_TYPES.includes(game.type) && newAssignedWords.length >= 1) {
          toast.error('This game type only allows 1 word.');
          return;
        }
        newAssignedWords.splice(destination.index, 0, movedItem);
        setAvailableWords(newAvailableWords);
        setAssignedWords(newAssignedWords);
        setAllLevelAssignments(prev => ({
          ...prev,
          [selectedLevel]: newAssignedWords
        }));
      } else if (source.droppableId === 'assigned' && destination.droppableId === 'available') {
        // Moving from assigned to available
        const movedItem = assignedWords[source.index];
        const newAssignedWords = assignedWords.filter((_, index) => index !== source.index);
        const newAvailableWords = Array.from(availableWords);
        newAvailableWords.splice(destination.index, 0, movedItem);
        setAssignedWords(newAssignedWords);
        setAvailableWords(newAvailableWords);
        setAllLevelAssignments(prev => ({
          ...prev,
          [selectedLevel]: newAssignedWords
        }));
      }
    }
  }, [availableWords, assignedWords, selectedLevel]);

  const handleEditWord = (word: Word) => {
    setEditingWord(word);
    editForm.setFieldsValue({
      word: word.word,
      type: word.type,
      level: word.level,
      note: word.note || '',
      image: word.image ? [{
        uid: '-1',
        name: 'word-image',
        status: 'done',
        url: word.image.startsWith('http') ? word.image : `https://s3.engkid.io.vn${word.image}`
      }] : []
    });
    setIsEditModalVisible(true);
  };

  const handleSave = async () => {
    try {
      // Build word assignments from all levels
      const allAssignments: Array<{
        wordId: number;
        level: number;
        isActive: boolean;
        order: number;
      }> = [];

      // Process all level assignments
      Object.keys(allLevelAssignments).forEach(level => {
        const levelWords = allLevelAssignments[level];
        levelWords.forEach((word, index) => {
          allAssignments.push({
            wordId: word.id,
            level: parseInt(level),
            isActive: true,
            order: index + 1
          });
        });
      });

      await updateGameWords(allAssignments);
  toast.success('Words assigned successfully');
      if (currentReadingId) {
        navigate(`/kid-reading/${currentReadingId}/games/${gameId}/edit`);
      } else {
        navigate('/games');
      }
    } catch (error) {
      toast.error('Failed to assign words');
      console.error('Save error:', error);
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
                <li className="breadcrumb-item"><a href={`/kid-reading`}>Reading Management</a></li>
                <li className="breadcrumb-item"><a href={`/kid-reading/${currentReadingId}/games`}>Reading Games</a></li>
              </>
            ) : (
              <li className="breadcrumb-item"><a href="/games">Games</a></li>
            )}
            <li className="breadcrumb-item"><a href={`/games/${gameId}/edit`}>Edit Game</a></li>
            <li className="breadcrumb-item active">Assign Words</li>
          </ol>
        </nav>
      </div>

      <StyledCard
        title="Manage Words"
        extra={
          <Space size="middle">
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
              size="large"
            >
              Add Word
            </Button>
          </Space>
        }
      >
        <Tabs
          activeKey={selectedLevel}
          onChange={key => setSelectedLevel(key)}
          items={[
            { 
              key: '1', 
              label: `Level 1 ${allLevelAssignments['1'] ? `(${allLevelAssignments['1'].length})` : '(0)'}` 
            },
            { 
              key: '2', 
              label: `Level 2 ${allLevelAssignments['2'] ? `(${allLevelAssignments['2'].length})` : '(0)'}` 
            },
            { 
              key: '3', 
              label: `Level 3 ${allLevelAssignments['3'] ? `(${allLevelAssignments['3'].length})` : '(0)'}` 
            },
            { 
              key: '4', 
              label: `Level 4 ${allLevelAssignments['4'] ? `(${allLevelAssignments['4'].length})` : '(0)'}` 
            },
            { 
              key: '5', 
              label: `Level 5 ${allLevelAssignments['5'] ? `(${allLevelAssignments['5'].length})` : '(0)'}` 
            },
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
          <DragDropContainer>
            <div>
              <WordSectionHeader>Available Words ({filteredAvailableWords.length})</WordSectionHeader>
              <Droppable droppableId="available">
                {(provided) => (
                  <WordContainer ref={provided.innerRef} {...provided.droppableProps}>
                    {filteredAvailableWords.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#8c8c8c' }}>
                        {loading ? (
                          <div>
                            <Spin size="large" />
                            <p style={{ marginTop: '16px', fontSize: '16px' }}>Loading words...</p>
                          </div>
                        ) : (
                          <div>
                            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No available words found</p>
                            {allWords.length === 0 && (
                              <p style={{ fontSize: '12px', color: '#bfbfbf' }}>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      filteredAvailableWords.map((word, index) => (
                        <WordItem key={word.id} word={word} index={index} onEdit={handleEditWord} />
                      ))
                    )}
                    {provided.placeholder}
                  </WordContainer>
                )}
              </Droppable>
            </div>

            <div>
              <WordSectionHeader>Selected Words ({assignedWords.length})</WordSectionHeader>
              <Droppable droppableId="assigned">
                {(provided) => (
                  <WordContainer ref={provided.innerRef} {...provided.droppableProps}>
                    {assignedWords.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#8c8c8c' }}>
                        {loading ? (
                          <div>
                            <Spin size="large" />
                            <p style={{ marginTop: '16px', fontSize: '16px' }}>Loading selected words...</p>
                          </div>
                        ) : (
                          <div>
                            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No words selected</p>
                            <p style={{ fontSize: '14px', color: '#bfbfbf' }}>
                              Drag words from Available Words to select them
                            </p>
                            {gameWords.length === 0 && (
                              <p style={{ fontSize: '12px', color: '#bfbfbf', marginTop: '8px' }}>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      assignedWords.map((word, index) => (
                        <WordItem key={word.id} word={word} index={index} onEdit={handleEditWord} />
                      ))
                    )}
                    {provided.placeholder}
                  </WordContainer>
                )}
              </Droppable>
            </div>
          </DragDropContainer>
        </DragDropContext>

        <ActionButtonsContainer>
          <Space size="large">
            <Button 
              onClick={() => {
                if (currentReadingId) {
                  navigate(`/kid-reading/${currentReadingId}/games/${gameId}/edit`);
                } else {
                  navigate('/games');
                }
              }}
              size="large"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              onClick={handleSave}
              size="large"
            >
              Save Changes
            </Button>
          </Space>
        </ActionButtonsContainer>
      </StyledCard>

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
              // Cập nhật lại allWords (nếu có API trả về đầy đủ thì nên fetch lại, ở đây chỉ cập nhật tạm)
              setAvailableWords(prev => {
                // Nếu từ mới thuộc level hiện tại và chưa được gán thì thêm vào availableWords
                if (newWord.level === parseInt(selectedLevel)) {
                  const allAssignedWordIds = new Set<number>();
                  Object.values(allLevelAssignments).forEach(levelWords => {
                    levelWords.forEach(word => allAssignedWordIds.add(word.id));
                  });
                  if (!allAssignedWordIds.has(newWord.id)) {
                    return [...prev, newWord];
                  }
                }
                return prev;
              });
              toast.success('Word created successfully');
              setIsCreateModalVisible(false);
              form.resetFields();
              location.reload();
            } catch (error) {
              toast.error('Failed to create word');
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

      <Modal
        title="Edit Word"
        open={isEditModalVisible}
        onOk={editForm.submit}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingWord(null);
          editForm.resetFields();
        }}
        confirmLoading={editing}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={async (values) => {
            if (!editingWord) return;
            
            try {
              const formData = new FormData();
              formData.append('word', values.word);
              formData.append('type', values.type.toString());
              formData.append('level', values.level.toString());
              formData.append('note', values.note || '');
              formData.append('is_active', '1');
              if (values.image && values.image[0] && values.image[0].originFileObj) {
                formData.append('image', values.image[0].originFileObj);
              }
              const updatedWord = await editWord(editingWord.id, formData);
              // Cập nhật lại state thay vì reload trang
              const updateWordInState = (words: Word[]) => {
                return words.map(word => 
                  word.id === editingWord.id ? { ...updatedWord } : word
                );
              };
              setAvailableWords(prev => updateWordInState(prev));
              setAssignedWords(prev => updateWordInState(prev));
              setAllLevelAssignments(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(level => {
                  updated[level] = updateWordInState(updated[level]);
                });
                return updated;
              });
              toast.success('Word updated successfully');
              setIsEditModalVisible(false);
              setEditingWord(null);
              editForm.resetFields();
              location.reload();
            } catch (error) {
              toast.error('Failed to update word');
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
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload
              accept="image/*"
              beforeUpload={() => false}
              maxCount={1}
              listType="picture-card"
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
              }}
            >
              {(!editForm.getFieldValue('image') || editForm.getFieldValue('image').length === 0) && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload Image</div>
                </div>
              )}
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