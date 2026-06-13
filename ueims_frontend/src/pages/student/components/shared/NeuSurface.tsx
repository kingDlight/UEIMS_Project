import React from 'react';

export const NeuSurface: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}> = ({ children, style, className, onClick }) => (
  <div
    className={`scroll-animate ${className || ''}`}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    style={{
      background: '#ffffff',
      borderRadius: 24,
      boxShadow: '0 8px 32px rgba(15,23,42,0.05)',
      border: '1px solid rgba(255,255,255,0.4)',
      ...style,
    }}
  >
    {children}
  </div>
);
