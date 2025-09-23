import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Select, Switch, Card, Table, Button, Spin, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import useGameEdit from '../../hooks/useGameEdit';
import AssignWordsModal from '../../components/games/words/AssignWordsModal';
import { GAME_TYPES } from '@/utils/constants/options';

const { TextArea } = Input;

const GameEdit: React.FC = () => {
  const { id: readingId, gameId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // Handle case where gameId might be in different param position
  const actualGameId = gameId || useParams().gameId;
  
  const {
    game,
    allWords,
    gameWords,
    loading,
    updateGame,
    updateGameWords
  } = useGameEdit(actualGameId || '');

  // Handle form submission for game details
  const handleSubmit = async (values: any) => {
    await updateGame(values);
  };

  // Word list columns
  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image: string) => 
        image ? (
          <img 
            src={image.startsWith('http') ? image : `https://s3.engkid.io.vn${image}`} 
            alt="Word" 
            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/no-image-available.png';
            }}
          />
        ) : (
          <img 
            src="/assets/no-image-available.png" 
            alt="No image" 
            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
          />
        )
    },
    {
      title: 'Word',
      dataIndex: 'word',
      key: 'word',
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: number) => `Level: ${level}`
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: number) => {
        const gameType = GAME_TYPES.find(gt => gt.value === type);
        return gameType ? gameType.label : `Type: ${type}`;
      }
    },
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
              <a href={`/kid-reading`}>Reading Management</a>
            </li>
            <li className="breadcrumb-item">
              <a href={readingId ? `/kid-reading/${readingId}/games` : '/games'}>
                {readingId ? 'View Game' : 'Games'}
              </a>
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
            initialValues={{
              ...game,
              isActive: Boolean(game?.is_active),
              image: game?.image ? [{
                uid: '-1',
                name: 'game-image',
                status: 'done',
                url: game.image.startsWith('http') ? game.image : `https://s3.engkid.io.vn${game.image}`
              }] : []
            }}
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
              <Select options={GAME_TYPES} />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="image"
              label="Game Image"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) {
                  return e;
                }
                return e?.fileList;
              }}
            >
              <Upload
                name="image"
                listType="picture-card"
                maxCount={1}
                beforeUpload={(file) => {
                  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
                  if (!isJpgOrPng) {
                    message.error('You can only upload JPG/PNG/GIF files!');
                  }
                  const isLt5M = file.size / 1024 / 1024 < 5;
                  if (!isLt5M) {
                    message.error('Image must smaller than 5MB!');
                  }
                  return false;
                }}
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                }}
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload Image</div>
                </div>
              </Upload>
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select
                options={[
                  { value: true, label: 'Active' },
                  { value: false, label: 'Inactive' }
                ]}
                placeholder="Select status"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card 
          title="Associated Words" 
          extra={
            <Button 
              type="primary"
              onClick={() => navigate(`/word/game/${actualGameId}/words`)}
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