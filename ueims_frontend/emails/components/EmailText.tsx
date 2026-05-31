import React from 'react';
import { Text } from '@react-email/components';

export type EmailTextProps = {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  color?: string;
  fontSize?: number;
  lineHeight?: string;
  fontWeight?: number;
  margin?: string;
};

export function EmailText({
  children,
  align = 'center',
  color = '#6B7280',
  fontSize = 13,
  lineHeight = '20px',
  fontWeight = 400,
  margin = '0',
}: EmailTextProps) {
  return (
    <Text
      style={{
        margin,
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        fontSize,
        lineHeight,
        color,
        fontWeight,
        textAlign: align,
      }}
    >
      {children}
    </Text>
  );
}
