import React from 'react';
import { Text } from '@react-email/components';

import { EmailButton } from './components/EmailButton';
import { EmailDivider } from './components/EmailDivider';
import { EmailShell } from './components/EmailShell';
import { EmailLink } from './components/EmailLink';
import { EmailText } from './components/EmailText';

export type WelcomeEmailProps = Readonly<{
  fullName: string;
  email: string;
  tempPassword: string;
  loginUrl: string;
}>;

export function WelcomeEmail({ fullName, email, tempPassword, loginUrl }: WelcomeEmailProps) {
  return (
    <EmailShell previewText="Tài khoản UEIMS của bạn đã được tạo. Đăng nhập ngay để bắt đầu.">
      <Text style={title}>Chào mừng, {fullName}</Text>

      <EmailText color="#111827" fontWeight={700} margin="12px 0 0">
        Tài khoản UEIMS của bạn đã được tạo.
      </EmailText>

      <EmailDivider />

      <EmailText margin="22px 0 0">
        Bạn nhận email này vì Quản trị viên đã tạo tài khoản UEIMS cho bạn. Vui lòng đăng nhập bằng thông tin bên dưới và
        đổi mật khẩu ngay sau lần đăng nhập đầu tiên.
      </EmailText>

      <div style={credentialsBox}>
        <EmailText align="left" fontSize={12} lineHeight="16px" color="#6B7280" margin="0 0 8px">
          Email đăng nhập
        </EmailText>
        <EmailText align="left" color="#111827" fontWeight={700} margin="0 0 14px">
          <span style={{ wordBreak: 'break-all' }}>{email}</span>
        </EmailText>

        <EmailText align="left" fontSize={12} lineHeight="16px" color="#6B7280" margin="0 0 8px">
          Mật khẩu tạm thời
        </EmailText>
        <Text style={monoPassword}>{tempPassword}</Text>
      </div>

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

const credentialsBox: React.CSSProperties = {
  marginTop: 18,
  padding: '14px 16px',
  border: '1px solid #F3F4F6',
  backgroundColor: '#FAFAFA',
  textAlign: 'left',
};

const monoPassword: React.CSSProperties = {
  margin: 0,
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: 16,
  lineHeight: '20px',
  color: '#111827',
  fontWeight: 700,
  letterSpacing: '1px',
};
