// src/components/SmallCard.tsx

import React from 'react';

interface SmallCardProps {
  title: string;
  description: string;
}

const SmallCard: React.FC<SmallCardProps> = ({ title, description }) => {
  return (
    <div className="max-w-xs rounded overflow-hidden shadow-lg bg-white p-4">
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <p className="text-sm text-gray-700 mb-2">{description}</p>
    </div>
  );
};

export default SmallCard;

