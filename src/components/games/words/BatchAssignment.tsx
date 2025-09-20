import { useState } from 'react';
import { Modal, Upload, Button, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { GameWord } from '../../../types/game';

interface BatchAssignmentProps {
  onBatchAssign: (words: GameWord[]) => void;
}

const BatchAssignment: React.FC<BatchAssignmentProps> = ({ onBatchAssign }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedWordSet, setSelectedWordSet] = useState<string | null>(null);

  const handleUpload = async () => {
    // In a real implementation, this would process the file
    // and convert it to GameWord[] format
    const processedWords: GameWord[] = [];
    onBatchAssign(processedWords);
    setIsModalVisible(false);
  };

  return (
    <div className="batch-assignment">
      <Button
        type="primary"
        onClick={() => setIsModalVisible(true)}
        icon={<UploadOutlined />}
      >
        Batch Assign Words
      </Button>

      <Modal
        title="Batch Word Assignment"
        open={isModalVisible}
        onOk={handleUpload}
        onCancel={() => setIsModalVisible(false)}
      >
        <div className="mb-4">
          <h4>Upload Word List</h4>
          <Upload
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
          >
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
        </div>

        <div className="mb-4">
          <h4>Or Select from Word Sets</h4>
          <Select
            style={{ width: '100%' }}
            placeholder="Select a word set"
            value={selectedWordSet}
            onChange={setSelectedWordSet}
          >
            <Select.Option value="basic">Basic Vocabulary</Select.Option>
            <Select.Option value="intermediate">
              Intermediate Vocabulary
            </Select.Option>
            <Select.Option value="advanced">Advanced Vocabulary</Select.Option>
          </Select>
        </div>
      </Modal>
    </div>
  );
};

export default BatchAssignment;