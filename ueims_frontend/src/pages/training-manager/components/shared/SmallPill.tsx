import React from 'react';
import { c } from '../../constants';

export const SmallPill: React.FC<{ children: React.ReactNode; color?: string; glow?: boolean }> = ({
  children,
  color = c.primary,
  glow = false,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '7px 12px',
      borderRadius: 999,
      background: '#fff',
      color,
      fontSize: 12,
      fontWeight: 700,
      border: `1px solid ${color}22`,
      boxShadow: glow ? `0 0 15px ${color}40` : 'none',
      animation: glow ? 'pulse 2s infinite' : 'none',
    }}
  >
    {children}
  </div>
);
