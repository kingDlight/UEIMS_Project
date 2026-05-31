import React from 'react';
import { Button } from '@react-email/components';

export type EmailButtonProps = {
  href: string;
  children: React.ReactNode;
  backgroundColor?: string;
};

export function EmailButton({ href, children, backgroundColor = '#E67E22' }: EmailButtonProps) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor,
        borderRadius: '999px',
        color: '#FFFFFF',
        display: 'inline-block',
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        fontSize: '13px',
        fontWeight: 800,
        lineHeight: '16px',
        padding: '12px 22px',
        textAlign: 'center',
        textDecoration: 'none',
        minWidth: '180px',
      }}
    >
      {children}
    </Button>
  );
}
