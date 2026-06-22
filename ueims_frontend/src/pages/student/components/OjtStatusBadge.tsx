import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle, Clock, AlertTriangle, HelpCircle, Briefcase, RefreshCw, XCircle } from 'lucide-react';
import type { OjtStatus } from '@/services/OjtStatusService';

interface OjtStatusBadgeProps {
  status: OjtStatus;
  label: string;
  color: string;
  isUrgent: boolean;
  className?: string;
}

const hexToRgba = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const STATUS_CONFIG: Record<OjtStatus, {
  icon: React.ReactNode;
  label: string;
  defaultColor: string;
  pulse: boolean;
}> = {
  NOT_APPLICABLE:       { icon: <HelpCircle size={12} />,   label: 'ĐANG HỌC KỲ THƯỜNG',      defaultColor: '#9CA3AF', pulse: false },
  PREPARING:            { icon: <Clock size={12} />,         label: 'ĐANG CHUẨN BỊ OJT',         defaultColor: '#3B82F6', pulse: false },
  ELIGIBLE_NO_PLACEMENT:{ icon: <AlertTriangle size={12} />, label: 'ACTION REQUIRED',             defaultColor: '#F59E0B', pulse: true  },
  APPLIED:              { icon: <Briefcase size={12} />,      label: 'ĐÃ NỘP HỒ SƠ',             defaultColor: '#8B5CF6', pulse: false },
  MATCHING_IN_PROGRESS: { icon: <RefreshCw size={12} />,     label: 'ĐANG XỬ LÝ MATCH',          defaultColor: '#E67E22', pulse: true  },
  PLACED:               { icon: <CheckCircle size={12} />,   label: 'OJT IN PROGRESS',            defaultColor: '#10B981', pulse: false },
  AT_RISK:              { icon: <ShieldAlert size={12} />,    label: 'AT RISK — ACTION REQUIRED',  defaultColor: '#EF4444', pulse: true  },
  BLOCKED:              { icon: <XCircle size={12} />,       label: 'BLOCKED',                    defaultColor: '#991B1B', pulse: true  },
};

const StatusDot: React.FC<{ color: string; pulse?: boolean }> = ({ color, pulse = false }) => (
  <span style={{
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: color,
    boxShadow: `0 0 0 3px ${color}20`,
    animation: pulse ? 'pulse-dot 2s ease-in-out infinite' : 'none',
    flexShrink: 0,
  }} />
);

export const OjtStatusBadge: React.FC<OjtStatusBadgeProps> = ({
  status,
  label,
  color,
  isUrgent,
  className,
}) => {
  const config = STATUS_CONFIG[status];
  const finalColor = color || config.defaultColor;
  const finalLabel = label || config.label;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          borderRadius: 9999,
          backgroundColor: hexToRgba(finalColor, 0.08),
          border: `1.5px solid ${hexToRgba(finalColor, 0.35)}`,
          color: finalColor,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.04em',
          boxShadow: isUrgent ? `0 0 12px ${hexToRgba(finalColor, 0.3)}` : 'none',
          ...(className ? {} : {}),
        }}
        title={finalLabel}
      >
        <StatusDot color={finalColor} pulse={config.pulse} />
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {React.cloneElement(config.icon as React.ReactElement, { size: 12, color: finalColor })}
          {finalLabel}
        </span>
      </motion.div>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
      `}</style>
    </>
  );
};
