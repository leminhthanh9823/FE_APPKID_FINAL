import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Select, Switch, Card, Table, Button, Spin, message } from 'antd';
import useGameEdit from '../../hooks/useGameEdit';
import AssignWordsModal from '../../components/games/words/AssignWordsModal';

const { TextArea } = Input;

const gameTypes = [
  { value: 1, label: 'Word Match' },
  { value: 2, label: 'Word Order' },
  { value: 3, label: 'Memory Game' },
  { value: 4, label: 'Spelling Game' },
];

const GameEdit: React.FC = () => {
  const { id: readingId, gameId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const {
    game,
    allWords,
    gameWords,
    loading,
    updateGame,
    updateGameWords
  } = useGameEdit(gameId || '');

  // Handle form submission for game details
  const handleSubmit = async (values: any) => {
    await updateGame(values);
  };

  // Handle word status toggle
  const handleWordStatusChange = async (wordId: number, isActive: boolean) => {
    const wordToUpdate = gameWords.find(w => w.id === wordId);
    if (wordToUpdate) {
      const sequenceOrder = (wordToUpdate as any).games?.[0]?.game_words?.sequence_order || 1;
      await updateGameWords([{
        wordId,
        level: wordToUpdate.level,
        isActive,
        order: sequenceOrder
      }]);
    }
  };

  // Word list columns
  const columns = [
    {
      title: '#',
      dataIndex: 'order',
      key: 'order',
      width: 60,
    },
    {
      title: 'Word',
      dataIndex: 'word',
      key: 'word',
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: number) => `Level: ${level}`
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (record: any) => (
        <Switch
          checked={record.isActive}
          onChange={(checked) => handleWordStatusChange(record.id, checked)}
        />
      )
    }
  ];

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
        <h1>Edit Game: "{game.name}"</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/dashboard">CMS</a>
            </li>
            <li className="breadcrumb-item">
              <a href={`/reading/${readingId}`}>Reading Management</a>
            </li>
            <li className="breadcrumb-item">
              <a href={`/reading/${readingId}/games`}>View Game</a>
            </li>
            <li className="breadcrumb-item active">Edit Game</li>
          </ol>
        </nav>
      </div>

      <div className="game-edit">
        <Card title="🎮 Game Information">
          <Form
            form={form}
            layout="vertical"
            initialValues={game}
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Game Name *"
              rules={[{ required: true, message: 'Please enter game name' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="type"
              label="Game Type *"
            >
              <Select options={gameTypes} />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Status"
              valuePropName="checked"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card 
          title="📝 Associated Words" 
          extra={
            <Button 
              type="primary"
              onClick={() => navigate(`/word/game/${gameId}/words`)}
            >
              Manage Words
            </Button>
          }
          style={{ marginTop: 24 }}
        >
          <Table
            columns={columns}
            dataSource={Array.isArray(gameWords) ? gameWords : []}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </div>
    </main>
  );
};

export default GameEdit;