import { Form, Input, Select, Button, Card } from 'antd';
import { useState } from 'react';

const { TextArea } = Input;

interface GameFormData {
  name: string;
  description?: string;
  type: number;
}

interface GameCreationFormProps {
  onSubmit: (gameData: GameFormData) => void;
  initialValues?: Partial<GameFormData>;
}

const gameTypes = [
  { value: 1, label: 'Word Match' },
  { value: 2, label: 'Word Order' },
  { value: 3, label: 'Memory Game' },
  { value: 4, label: 'Spelling Game' },
];

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
              {gameTypes.map((type) => (
                <Select.Option key={type.value} value={type.value}>
                  {type.label}
                </Select.Option>
              ))}
            </Select>
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