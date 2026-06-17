import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cc } from '../../constants';

interface AreaChartProps {
  data: number[];
  color?: string;
  height?: number;
}

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ value: number }>;
}> = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: cc.surface,
        border: `1px solid ${cc.border}`,
        borderRadius: cc.radiusMd,
        boxShadow: cc.shadowMd,
        padding: '8px 12px',
        fontFamily: 'Inter, sans-serif',
      }}>
        <span style={{ fontSize: 12, color: cc.textMuted, fontWeight: 600 }}>
          {payload[0].value}
        </span>
      </div>
    );
  }
  return null;
};

export const AreaChart: React.FC<AreaChartProps> = ({ 
  data = [], 
  color = cc.primary, 
  height = 170 
}) => {
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <ResponsiveContainer width="99%" height="99%" initialDimension={{ width: 400, height: 160 }}>
      <RechartsAreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`areaGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={cc.borderSubtle} strokeDasharray="4 4" />
        <XAxis dataKey="index" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: cc.textMuted }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: cc.textMuted }} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#areaGrad-${color.replace('#', '')})`}
          dot={{ r: 4, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};
