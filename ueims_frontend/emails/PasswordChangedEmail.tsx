import React from 'react';
import { Text } from '@react-email/components';

import { EmailButton } from './components/EmailButton';
import { EmailDivider } from './components/EmailDivider';
import { EmailShell } from './components/EmailShell';
import { EmailLink } from './components/EmailLink';
import { EmailText } from './components/EmailText';

export type PasswordChangedEmailProps = Readonly<{
  fullName: string;
  changedAt: string;
  loginUrl: string;
}>;

export function PasswordChangedEmail({ fullName, changedAt, loginUrl }: PasswordChangedEmailProps) {
  return (
    <EmailShell previewText="Mật khẩu UEIMS của bạn đã được thay đổi thành công.">
      <Text style={title}>Xin chào {fullName},</Text>

      <EmailText color="#111827" fontWeight={700} margin="12px 0 0">
        Mật khẩu của bạn đã được thay đổi.
      </EmailText>

      <EmailDivider />

      <EmailText margin="22px 0 0">
        Chúng tôi gửi email này để thông báo mật khẩu tài khoản UEIMS của bạn đã được thay đổi thành công. Nếu đây là bạn,
        bạn có thể bỏ qua email này.
      </EmailText>

      <EmailText margin="18px 0 0">
        Thời gian thay đổi: <strong style={{ color: '#111827' }}>{changedAt}</strong>
        <br />
        Nếu bạn không thực hiện thao tác này, hãy liên hệ bộ phận hỗ trợ ngay lập tức.
      </EmailText>

      <div style={{ textAlign: 'center', marginTop: 26 }}>
        <EmailButton href={loginUrl}>Đăng nhập UEIMS</EmailButton>
      </div>

      <EmailText fontWeight={700} margin="22px 0 0">
        Trân trọng,
      </EmailText>
      <EmailText color="#E67E22" fontWeight={700} margin="4px 0 0">
        Team UEIMS
      </EmailText>

      <div style={{ marginTop: 26 }}>
        <hr style={{ border: 'none', borderTop: '1px solid #F3F4F6' }} />
      </div>

      <EmailText fontSize={11} lineHeight="16px" color="#9CA3AF" margin="14px 0 0">
        Cần hỗ trợ? Liên hệ <EmailLink href="mailto:ueims.support@fpt.edu.vn">ueims.support@fpt.edu.vn</EmailLink>
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
