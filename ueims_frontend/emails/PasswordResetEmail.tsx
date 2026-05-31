import React from 'react';
import { Text } from '@react-email/components';

import { EmailButton } from './components/EmailButton';
import { EmailDivider } from './components/EmailDivider';
import { EmailShell } from './components/EmailShell';
import { EmailLink } from './components/EmailLink';
import { EmailText } from './components/EmailText';

export type PasswordResetEmailProps = {
  fullName: string;
  resetUrl: string;
};

export function PasswordResetEmail({ fullName, resetUrl }: PasswordResetEmailProps) {
  return (
    <EmailShell previewText="Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản UEIMS.">
      <Text style={title}>Xin chào {fullName},</Text>

      <EmailText color="#111827" fontWeight={700} margin="12px 0 0">
        Bạn đã yêu cầu đặt lại mật khẩu.
      </EmailText>

      <EmailDivider />

      <EmailText margin="22px 0 0">
        Bạn nhận email này vì chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Để đặt lại mật khẩu,
        hãy nhấn nút <strong style={{ color: '#111827' }}>ĐẶT LẠI MẬT KHẨU</strong> bên dưới.
      </EmailText>

      <EmailText margin="18px 0 0">
        Liên kết này sẽ hết hạn sau <strong style={{ color: '#111827' }}>2 giờ</strong> kể từ thời điểm email được gửi.
        Nếu bạn không yêu cầu đặt lại mật khẩu, bạn không cần thực hiện thêm thao tác nào.
      </EmailText>

      <div style={{ textAlign: 'center', marginTop: 26 }}>
        <EmailButton href={resetUrl}>Đặt lại mật khẩu</EmailButton>
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
        Nếu nút không hoạt động, hãy sao chép và dán liên kết này vào trình duyệt:
        <br />
        <span style={{ color: '#E67E22', wordBreak: 'break-all' }}>{resetUrl}</span>
      </EmailText>

      <EmailText fontSize={11} lineHeight="16px" color="#9CA3AF" margin="12px 0 0">
        Cần hỗ trợ?{' '}
        <EmailLink href="mailto:ueims.support@fpt.edu.vn">ueims.support@fpt.edu.vn</EmailLink>
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
