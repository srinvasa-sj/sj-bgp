import React from 'react';

interface GridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 1,
  gap = 4,
  className = '',
}) => {
  return (
    <div
      className={`grid grid-cols-${columns} gap-${gap} ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: `${gap * 0.25}rem`,
      }}
    >
      {children}
    </div>
  );
}; 