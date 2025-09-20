import { Modal, Form, Input, Select, message } from 'antd';
import { useState } from 'react';
import { Word, WordType } from '@/types/word';
import axios from 'axios';

interface CreateWordRequest {
  word: string;
  type: WordType;
  level: number;
  note?: string;
  image?: string;
}

interface WordCreationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: (word: Word) => void;
}

const WordCreationModal: React.FC<WordCreationModalProps> = ({
  isVisible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<CreateWordRequest>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: CreateWordRequest) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/word', values);
      if (response.data) {
        message.success('Word created successfully');
        onSuccess(response.data);
        form.resetFields();
        onClose();
      }
    } catch (error) {
      message.error('Failed to create word');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create New Word"
      open={isVisible}
      onCancel={onClose}
      okText="Create"
      confirmLoading={loading}
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="word"
          label="Word"
          rules={[{ required: true, message: 'Please enter the word' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="type"
          label="Word Type"
          rules={[{ required: true, message: 'Please select the word type' }]}
        >
          <Select>
            <Select.Option value={WordType.Noun}>Noun</Select.Option>
            <Select.Option value={WordType.Verb}>Verb</Select.Option>
            <Select.Option value={WordType.Adjective}>Adjective</Select.Option>
            <Select.Option value={WordType.Adverb}>Adverb</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="level"
          label="Level"
          rules={[{ required: true, message: 'Please select the level' }]}
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
          name="note"
          label="Note"
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          name="image"
          label="Image URL"
        >
          <Input placeholder="http://example.com/image.jpg" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default WordCreationModal;