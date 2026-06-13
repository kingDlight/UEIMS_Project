import React, { useEffect, useState } from 'react';
import { Typography } from 'antd';
const Sparkline = React.lazy(() => import('../charts/Sparkline').then(m => ({ default: m.Sparkline })));
import { FallbackLoader } from '../../../../components/FallbackLoader';
import { c } from '../../constants';
import { useAnimatedNumber } from '../../../../hooks/useAnimatedNumber';
const { Text } = Typography;

export const AnimatedStatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  insight?: string;
  sparkline?: number[];
  delay: number;
}> = ({ label, value, icon, color, trend, insight, sparkline, delay }) => {
  const displayValue = useAnimatedNumber(value, 1200, delay);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  let transformValue = 'translateY(18px)';
  if (isLoaded) {
    transformValue = isHovered ? 'translateY(-5px)' : 'translateY(0)';
  }

  return (
      <div
      role="presentation"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 22,
        padding: '18px 18px 16px',
        boxShadow: isHovered ? '0 14px 44px rgba(15,23,42,.10)' : '0 4px 20px rgba(15,23,42,.05)',
        border: '1px solid rgba(226,232,240,.9)',
        transform: transformValue,
        transition: 'all .25s ease',
        opacity: isLoaded ? 1 : 0,
        minHeight: 128,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flex: 1 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Text style={{ fontSize: 12, color: c.textMuted, display: 'block', fontWeight: 700 }}>{label}</Text>
          <div style={{ fontSize: 34, fontWeight: 900, color: c.text, marginTop: 4, letterSpacing: '-1.3px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {displayValue.toLocaleString()}
          </div>
          {trend && <div style={{ fontSize: 12, color: c.success, fontWeight: 800, marginTop: 6 }}>{trend}</div>}
          {insight && <div style={{ fontSize: 11.5, color: c.textMuted, marginTop: 4, lineHeight: 1.45 }}>{insight}</div>}
        </div>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${color}, ${color}dd)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 20,
            boxShadow: `0 10px 18px ${color}30`,
            flex: '0 0 auto',
          }}
        >
          {icon}
        </div>
      </div>
      {sparkline && (
        <div style={{ marginTop: 12 }}>
          <React.Suspense fallback={<FallbackLoader size={24} />}>
            <Sparkline data={sparkline} color={color} width={180} height={34} />
          </React.Suspense>
        </div>
      )}
    </div>
  );
};
