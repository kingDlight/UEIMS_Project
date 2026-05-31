import React from 'react';
import { Link } from '@react-email/components';

export type EmailLinkProps = {
  href: string;
  children: React.ReactNode;
  color?: string;
  fontWeight?: number;
};

export function EmailLink({ href, children, color = '#E67E22', fontWeight = 700 }: EmailLinkProps) {
  return (
    <Link
      href={href}
      style={{
        color,
        fontWeight,
        textDecoration: 'none',
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {children}
    </Link>
  );
}
