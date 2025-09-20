import { Card, List } from 'antd';
import { Word, getWordTypeName } from '../../../types/word';

interface WordPreviewProps {
  word: Word;
}

const WordPreview: React.FC<WordPreviewProps> = ({ word }) => {
  return (
    <Card title="Word Preview" className="word-preview">
      <h3>{word.word}</h3>
      
      <div className="word-type mt-2">
        <label>Type:</label>
        <p>{getWordTypeName(word.type)}</p>
      </div>

      <div className="word-level mt-2">
        <label>Level:</label>
        <p>{word.level}</p>
      </div>

      {word.note && (
        <div className="word-note mt-4">
          <label>Note:</label>
          <p>{word.note}</p>
        </div>
      )}

      {word.image && (
        <div className="word-image mt-4">
          <label>Image:</label>
          <img 
            src={word.image} 
            alt={word.word}
            style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
          />
        </div>
      )}

      <div className="word-status mt-4">
        <label>Status:</label>
        <p>{word.is_active ? 'Active' : 'Inactive'}</p>
      </div>
    </Card>
  );
};

export default WordPreview;