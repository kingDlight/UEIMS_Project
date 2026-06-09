import React from 'react';
import { Text } from '@react-email/components';

import { EmailButton } from './components/EmailButton';
import { EmailDivider } from './components/EmailDivider';
import { EmailShell } from './components/EmailShell';
import { EmailText } from './components/EmailText';

export type ResetPasswordEmailProps = Readonly<{
  fullName: string;
  resetUrl: string;
}>;

export function ResetPasswordEmail({ fullName, resetUrl }: ResetPasswordEmailProps) {
  return (
    <EmailShell previewText="You have requested a password reset for your UEIMS account.">
      <Text style={title}>Hello {fullName},</Text>

      <EmailText color="#111827" fontWeight={700} margin="12px 0 0">
        You have requested a password reset.
      </EmailText>

      <EmailDivider />

      <EmailText margin="22px 0 0">
        You're receiving this email because we received a password reset request for your account. To reset your password
        click the button <strong style={{ color: '#111827' }}>RESET MY PASSWORD</strong> below.
      </EmailText>

      <EmailText margin="18px 0 0">
        This password reset link will expire in <strong style={{ color: '#111827' }}>2 hours</strong> from this email time.
        If you didn’t request a password reset, no further actions are required.
      </EmailText>

      <div style={{ textAlign: 'center', marginTop: 26 }}>
        <EmailButton href={resetUrl}>Reset my password</EmailButton>
      </div>

      <EmailText fontWeight={700} margin="22px 0 0">
        Regards,
      </EmailText>
      <EmailText color="#E67E22" fontWeight={700} margin="4px 0 0">
        Team UEIMS
      </EmailText>

      <div style={{ marginTop: 26 }}>
        <hr style={{ border: 'none', borderTop: '1px solid #F3F4F6' }} />
      </div>

      <EmailText fontSize={11} lineHeight="16px" color="#9CA3AF" margin="14px 0 0">
        If the button doesn't work, copy and paste this link into your browser:
        <br />
        <span style={{ color: '#E67E22', wordBreak: 'break-all' }}>{resetUrl}</span>
      </EmailText>
    </EmailShell>
  );
}

const title: React.CSSProperties = {
  margin: 0,
  fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  fontSize: 30,
  lineHeight: '36px',
  fontWeight: 700,
  color: '#111827',
  textAlign: 'center',
};
