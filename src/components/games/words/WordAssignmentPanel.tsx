import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Input, Select, List, Space, Tag, Typography, message } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Word, WordType, GameWord } from '../../../types/word';
import WordList from '@/components/games/words/WordList';
import WordPreview from '@/components/games/words/WordPreview';
import BatchAssignment from '@/components/games/words/BatchAssignment';
import WordCreationModal from '@/components/games/words/WordCreationModal';
import apiClient from '../../../apis/apiRequest';

const { Text } = Typography;

interface WordAssignmentPanelProps {
  availableWords: Word[];
  selectedWords: Word[];
  onWordSelect: (word: Word) => void;
  onWordDeselect: (wordId: number) => void;
  onBatchAssign: (words: Word[]) => void;
}

const WordAssignmentPanel: React.FC<WordAssignmentPanelProps> = ({
  availableWords,
  selectedWords,
  onWordSelect,
  onWordDeselect,
  onBatchAssign,
}) => {
  const [selectedWordPreview, setSelectedWordPreview] = useState<Word | null>(null);
  const [isWordModalVisible, setIsWordModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [wordType, setWordType] = useState<WordType | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const filteredWords = availableWords.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !wordType || word.type === wordType;
    const matchesLevel = !selectedLevel || word.level === selectedLevel;
    return matchesSearch && matchesType && matchesLevel;
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="word-assignment-panel">
        <Row gutter={16}>
          <Col span={12}>
            <Card 
              title="Available Words"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsWordModalVisible(true)}
                >
                  Add Word
                </Button>
              }
            >
              <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                <Input
                  placeholder="Search words..."
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <Space>
                  <Select
                    style={{ width: 150 }}
                    placeholder="Word Type"
                    value={wordType}
                    onChange={setWordType}
                    allowClear
                  >
                    <Select.Option value={WordType.Noun}>Noun</Select.Option>
                    <Select.Option value={WordType.Verb}>Verb</Select.Option>
                    <Select.Option value={WordType.Adjective}>Adjective</Select.Option>
                    <Select.Option value={WordType.Adverb}>Adverb</Select.Option>
                  </Select>
                  <Select
                    style={{ width: 150 }}
                    placeholder="Level"
                    value={selectedLevel}
                    onChange={setSelectedLevel}
                    allowClear
                  >
                    <Select.Option value={1}>Level 1</Select.Option>
                    <Select.Option value={2}>Level 2</Select.Option>
                    <Select.Option value={3}>Level 3</Select.Option>
                    <Select.Option value={4}>Level 4</Select.Option>
                    <Select.Option value={5}>Level 5</Select.Option>
                  </Select>
                </Space>
              </Space>
              <WordList
                words={filteredWords}
                onWordClick={(word) => setSelectedWordPreview(word)}
                onWordDrag={onWordSelect}
                droppable={false}
              />
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="Selected Words">
              <WordList
                words={selectedWords}
                onWordClick={(word) => setSelectedWordPreview(word)}
                onWordDrag={(word) => onWordDeselect(word.id)}
                droppable={true}
              />
            </Card>
            {selectedWordPreview && (
              <Card style={{ marginTop: 16 }}>
                <WordPreview word={selectedWordPreview} />
              </Card>
            )}
          </Col>
        </Row>
      </div>

      <WordCreationModal
        isVisible={isWordModalVisible}
        onClose={() => setIsWordModalVisible(false)}
        onSuccess={(newWord) => {
          onWordSelect(newWord);
          setIsWordModalVisible(false);
        }}
      />
    </DndProvider>
  );
};

export default WordAssignmentPanel;