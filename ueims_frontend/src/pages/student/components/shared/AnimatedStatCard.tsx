import React, { useEffect, useState, Suspense } from 'react';
import { Typography } from 'antd';
import { animate } from 'framer-motion';
import { cc } from '../../constants';
const { Text } = Typography;

const Sparkline = React.lazy(() => import('../charts/Sparkline').then(m => ({ default: m.Sparkline })));

const FallbackLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 34 }}>
    <div style={{ width: 16, height: 16, border: '2px solid rgba(230,126,34,0.1)', borderTopColor: '#E67E22', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
  </div>
);

export const AnimatedStatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  insight?: string;
  sparkline?: number[];
  delay?: number;
}> = ({ label, value, icon, color, trend, insight, sparkline, delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
      delay: delay / 1000,
      onUpdate(val) {
        setDisplayValue(Math.round(val));
      }
    });
    return () => controls.stop();
  }, [value, delay]);

  let transformValue = 'translateY(18px)';
  if (isLoaded) {
    transformValue = isHovered ? 'translateY(-5px)' : 'translateY(0)';
  }

  return (
    <div
      role="presentation"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="scroll-animate"
      style={{
        background: '#ffffff',
        borderRadius: 22,
        padding: '18px 18px 16px',
        boxShadow: isHovered ? '0 14px 44px rgba(15,23,42,.10)' : '0 4px 20px rgba(15,23,42,.05)',
        border: '1px solid rgba(255,255,255,0.4)',
        transform: transformValue,
        transition: `transform 0.25s ease, box-shadow 0.25s ease, opacity 0.5s ease ${delay}ms`,
        opacity: isLoaded ? 1 : 0,
        minHeight: 128,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flex: 1 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Text style={{ fontSize: 12, color: cc.textMuted, display: 'block', fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>{label}</Text>
          <div style={{ fontSize: 34, fontWeight: 900, color: cc.text, marginTop: 4, letterSpacing: '-1.3px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {displayValue.toLocaleString()}
          </div>
          {trend && <div style={{ fontSize: 12, color: cc.success, fontWeight: 800, marginTop: 6 }}>{trend}</div>}
          {insight && <div style={{ fontSize: 11.5, color: cc.textMuted, marginTop: 4, lineHeight: 1.45 }}>{insight}</div>}
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
          <Suspense fallback={<FallbackLoader />}>
            <Sparkline data={sparkline} color={color} width={180} height={34} />
          </Suspense>
        </div>
      )}
    </div>
  );
};
