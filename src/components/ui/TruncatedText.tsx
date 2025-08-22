import React from 'react';

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  maxWidth?: string;
  title?: string;
}

const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  maxLength = 50,
  maxWidth = '200px',
  title,
}) => {
  const displayText =
    text && text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;

  return (
    <div
      style={{
        maxWidth: maxWidth,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        cursor: text && text.length > maxLength ? 'help' : 'default',
      }}
      title={title || (text && text.length > maxLength ? text : undefined)}
    >
      {displayText || 'N/A'}
    </div>
  );
};

export default TruncatedText;
