import React from 'react';

export const AreaChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 300;
  const height = 120;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 20) - 10;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id={`areaGradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline points={areaPoints} fill={`url(#areaGradient-${color.replace('#', '')})`} stroke="none" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * (height - 20) - 10;
        return <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" fill="#fff" stroke={color} strokeWidth="2" />;
      })}
    </svg>
  );
};
