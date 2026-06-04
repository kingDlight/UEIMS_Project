import React from 'react';

export const NeuSurface: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 24,
      boxShadow: '0 4px 20px rgba(15,23,42,.06)',
      border: '1px solid rgba(226,232,240,.9)',
      ...style,
    }}
  >
    {children}
  </div>
);
