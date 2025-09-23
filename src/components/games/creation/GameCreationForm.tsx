import { Form, Input, Select, Button, Card, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { UploadProps } from 'antd';
import { GAME_TYPES } from '@/utils/constants/options';

const { TextArea } = Input;

interface GameFormData {
  name: string;
  description?: string;
  type: number;
  image?: any;
}

interface GameCreationFormProps {
  onSubmit: (gameData: GameFormData) => void;
  initialValues?: Partial<GameFormData>;
}

export const GameCreationForm: React.FC<GameCreationFormProps> = ({
  onSubmit,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [selectedGameType, setSelectedGameType] = useState<number>(
    initialValues?.type || 1
  );

  const handleSubmit = (values: GameFormData) => {
    onSubmit({
      ...values,
      type: selectedGameType,
    });
  };

  return (
    <div className="game-creation-form">
      <Card title="Create New Game">
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Game Name"
            rules={[
              { required: true, message: 'Please enter a game name' },
              { max: 255, message: 'Game name cannot exceed 255 characters' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { max: 1000, message: 'Description cannot exceed 1000 characters' },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="type"
            label="Game Type"
            rules={[{ required: true, message: 'Please select a game type' }]}
          >
            <Select
              value={selectedGameType}
              onChange={(value: number) => setSelectedGameType(value)}
            >
              {GAME_TYPES.map((type) => (
                <Select.Option key={type.value} value={type.value}>
                  {type.label}
                </Select.Option>
              ))}
            </Select>
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
                return false; // Prevent auto upload
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

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Game
            </Button>
          </Form.Item>
        </Form>
      </Card>

    </div>
  );
};

export default GameCreationForm;