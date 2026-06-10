import React from 'react';


export const NeuSurface: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}> = ({ children, style, className, onClick }) => (
  <div
    className={className}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
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
