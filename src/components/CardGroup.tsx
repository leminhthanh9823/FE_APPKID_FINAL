import React from 'react';

export interface CardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
}

const cardContainerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
};

const cardStyle: React.CSSProperties = {
  borderRadius: '16px',
  padding: '20px',
  color: '#fff',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
};

const hoverStyle: React.CSSProperties = {
  transform: 'translateY(-4px)',
  boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
};

const CardGroup: React.FC<{ cards: CardProps[] }> = ({ cards }) => {
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);

  return (
    <div style={cardContainerStyle}>
      {cards.map((card, index) => (
        <div
          key={index}
          style={{
            ...cardStyle,
            ...(hoverIndex === index ? hoverStyle : {}),
            backgroundColor: card.color,
          }}
          onMouseEnter={() => setHoverIndex(index)}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <div style={{ fontSize: '2rem' }}>{card.icon}</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1rem', fontWeight: 500 }}>{card.title}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{card.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardGroup;
