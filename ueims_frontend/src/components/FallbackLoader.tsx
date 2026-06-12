import React from 'react';

export const FallbackLoader: React.FC<{ minHeight?: string; size?: number }> = ({ minHeight = "100%", size = 32 }) => (
  <div style={{ minHeight, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
    <div 
      style={{
        width: size,
        height: size,
        border: '3px solid rgba(243, 112, 33, 0.2)',
        borderTopColor: '#f37021',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    />
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);
