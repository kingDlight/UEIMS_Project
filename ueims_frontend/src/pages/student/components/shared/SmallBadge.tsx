import React from 'react';
import { cc } from '../../constants';

interface SmallBadgeProps {
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const SmallBadge: React.FC<SmallBadgeProps> = ({ label, variant }) => {
  // TM-aligned ghost outline style
  const styles: Record<string, { color: string; bg: string; borderColor: string }> = {
    success: { color: cc.success, bg: hexToRgba(cc.success, 0.06), borderColor: hexToRgba(cc.success, 0.25) },
    warning: { color: cc.warning, bg: hexToRgba(cc.warning, 0.06), borderColor: hexToRgba(cc.warning, 0.25) },
    error: { color: cc.danger, bg: hexToRgba(cc.danger, 0.06), borderColor: hexToRgba(cc.danger, 0.25) },
    info: { color: cc.info, bg: hexToRgba(cc.info, 0.06), borderColor: hexToRgba(cc.info, 0.25) },
    neutral: { color: cc.textMuted, bg: hexToRgba(cc.textMuted, 0.06), borderColor: hexToRgba(cc.textMuted, 0.25) },
    primary: { color: cc.primary, bg: hexToRgba(cc.primary, 0.06), borderColor: hexToRgba(cc.primary, 0.25) },
  };

  const { color, bg, borderColor } = styles[variant];

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '5px 10px',
      borderRadius: 999,
      background: bg,
      color,
      border: `1px solid ${borderColor}`,
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontFamily: "'Inter', sans-serif",
    }}>
      {label}
    </span>
  );
};
