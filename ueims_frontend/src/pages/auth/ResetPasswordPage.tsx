import bgAuth from '@/assets/bg-auth.png';
import authShield3d from '@/assets/auth_shield_3d.png';
import { LogoIcon } from '@/components/LogoIcon';
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '@/services/AuthService';
import {
  AUTH_PRIMARY,
  AUTH_PRIMARY_LIGHT,
  AUTH_WHITE,
  AUTH_TEXT_DARK,
  AUTH_TEXT_GRAY,
  AUTH_BORDER,
  AUTH_DANGER,
  AUTH_SHADOW,
  AUTH_BORDER_RADIUS,
  AUTH_FONT,
  validatePassword,
  PasswordStrengthMeter,
} from '@/theme/authTheme';

const renderPasswordIcon = (visible: boolean) => visible ? <Eye size={18} color="#94A3B8" /> : <EyeOff size={18} color="#94A3B8" />;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (!t) {
      message.error('Link khôi phục không hợp lệ hoặc đã hết hạn.');
    }
    setToken(t);
  }, [searchParams]);

  const onFinish = async (values: { newPassword: string; confirmPassword: string }) => {
    if (!token) {
      message.error('Token không hợp lệ. Vui lòng yêu cầu gửi lại link khôi phục.');
      return;
    }

    const { valid } = validatePassword(values.newPassword);
    if (!valid) {
      message.error('Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra lại!');
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      await AuthService.resetPassword({
        token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      message.success('Đặt lại mật khẩu thành công!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error: any) {
      const msg = error.response?.data?.message;
      message.error(msg || 'Đặt lại mật khẩu thất bại. Link có thể đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: `url(${bgAuth}) center/cover no-repeat, ${AUTH_PRIMARY_LIGHT}`,
        padding: '40px 20px',
        position: 'relative',
        overflowX: 'hidden',
        fontFamily: AUTH_FONT,
      }}
    >
      {/* TOP HEADER */}
      <div
        className="reset-top-header"
        style={{
          position: 'absolute',
          top: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 10,
        }}
      >
        <LogoIcon style={{ height: 48, width: 'auto' }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: AUTH_PRIMARY, margin: 0, lineHeight: 1.1, letterSpacing: 1 }}>
            UEIMS
          </h1>
          <p style={{ fontSize: 8, color: AUTH_TEXT_DARK, textTransform: 'uppercase', fontWeight: 600, margin: '2px 0 0 0', letterSpacing: 0.5 }}>
            Hệ thống quản lý thực tập sinh<br />và doanh nghiệp
          </p>
        </div>
      </div>

      <div
        className="reset-card"
        style={{
          width: '100%',
          maxWidth: 960,
          background: AUTH_WHITE,
          borderRadius: AUTH_BORDER_RADIUS,
          boxShadow: AUTH_SHADOW,
          display: 'flex',
          margin: 'auto',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* LEFT PANEL */}
        <div
          className="reset-left-panel"
          style={{
            width: '45%',
            background: 'linear-gradient(180deg, #FFFDFB 0%, #FFF2E8 100%)',
            padding: '40px 32px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            borderRight: '1px solid rgba(230, 126, 34, 0.05)',
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 800, color: AUTH_TEXT_DARK, lineHeight: 1.3, margin: '20px 0 12px 0' }}>
            Khôi phục<br />
            <span style={{ color: AUTH_PRIMARY }}>mật khẩu mới</span>
          </h2>
          <p style={{ fontSize: 13, color: AUTH_TEXT_GRAY, lineHeight: 1.6, margin: '0 0 40px 0', maxWidth: '95%' }}>
            Tạo mật khẩu mới an toàn cho tài khoản của bạn. Đảm bảo mật khẩu đáp ứng đủ độ mạnh để bảo vệ dữ liệu.
          </p>

          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <img src={authShield3d} alt="Shield 3D" style={{ width: '80%', maxWidth: 280, objectFit: 'contain', zIndex: 1 }} />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="reset-right-panel" style={{ width: '55%', padding: '48px 40px', display: 'flex', flexDirection: 'column', position: 'relative' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <LogoIcon style={{ height: 40, width: 'auto' }} />
            <h1 style={{ fontSize: 16, fontWeight: 800, color: AUTH_PRIMARY, margin: 0, letterSpacing: 0.5 }}>UEIMS</h1>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, color: AUTH_TEXT_DARK, margin: '0 0 8px 0' }}>Đặt lại mật khẩu</h1>
          <p style={{ fontSize: 13, color: AUTH_TEXT_GRAY, lineHeight: 1.5, margin: '0 0 32px 0' }}>
            Vui lòng nhập mật khẩu mới bên dưới.
          </p>

          <Form onFinish={onFinish} layout="vertical" requiredMark={false} style={{ width: '100%' }}>

            <Form.Item
              name="newPassword"
              label={<span style={{ fontSize: 13, fontWeight: 700, color: AUTH_TEXT_DARK }}>Mật khẩu mới <span style={{ color: AUTH_DANGER }}>*</span></span>}
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
              style={{ marginBottom: 12 }}
            >
              <Input.Password
                placeholder="A-Z, a-z, 0-9, !@#..."
                size="large"
                prefix={<Lock size={18} color="#94A3B8" style={{ marginRight: 8 }} />}
                visibilityToggle={{ visible: showPassword, onVisibleChange: setShowPassword }}
                iconRender={renderPasswordIcon}
                onChange={(e) => setPassword(e.target.value)}
                style={{ borderRadius: 8, border: `1px solid ${AUTH_BORDER}`, padding: '10px 14px', fontSize: 14 }}
              />
            </Form.Item>

            <PasswordStrengthMeter password={password} />

            <Form.Item
              name="confirmPassword"
              label={<span style={{ fontSize: 13, fontWeight: 700, color: AUTH_TEXT_DARK }}>Xác nhận mật khẩu mới <span style={{ color: AUTH_DANGER }}>*</span></span>}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ]}
              style={{ marginBottom: 24 }}
            >
              <Input.Password
                placeholder="Nhập lại mật khẩu mới"
                size="large"
                prefix={<Lock size={18} color="#94A3B8" style={{ marginRight: 8 }} />}
                visibilityToggle={{ visible: showConfirm, onVisibleChange: setShowConfirm }}
                iconRender={renderPasswordIcon}
                style={{ borderRadius: 8, border: `1px solid ${AUTH_BORDER}`, padding: '10px 14px', fontSize: 14 }}
              />
            </Form.Item>

            <Form.Item style={{ margin: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{
                  height: 48,
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 700,
                  background: AUTH_PRIMARY,
                  border: 'none',
                  letterSpacing: 0.5,
                }}
              >
                Đặt lại mật khẩu
              </Button>
            </Form.Item>
          </Form>

          <button
            onClick={() => navigate('/login')}
            style={{
              marginTop: 24,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: AUTH_TEXT_GRAY,
              fontSize: 13,
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = AUTH_PRIMARY; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = AUTH_TEXT_GRAY; }}
          >
            <ArrowLeft size={16} />
            Quay lại đăng nhập
          </button>
        </div>
      </div>

          <style>{`
        @media (max-width: 1100px) {
          .reset-card {
            max-width: 96vw !important;
          }
          .reset-right-panel {
            padding: 40px 24px !important;
          }
        }
        @media (max-width: 768px) {
          .reset-card {
            flex-direction: column !important;
            max-width: 480px !important;
          }
          .reset-left-panel {
            display: none !important;
          }
          .reset-right-panel {
            width: 100% !important;
            padding: 24px !important;
          }
          .reset-top-header {
            position: relative !important;
            top: 0 !important;
            transform: none !important;
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  );
};
