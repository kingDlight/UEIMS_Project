import bgAuth from '@/assets/bg-auth.png';
import authShield3d from '@/assets/auth_shield_3d.png';
import logoUeims from '@/assets/logo_ueims.png';
import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Mail, Send, Info } from 'lucide-react';
import { AuthService } from '@/services/AuthService';
import {
  AUTH_PRIMARY,
  AUTH_PRIMARY_LIGHT,
  AUTH_WHITE,
  AUTH_TEXT_DARK,
  AUTH_TEXT_GRAY,
  AUTH_SHADOW,
  AUTH_BORDER_RADIUS,
  AUTH_FONT,
} from '@/theme/authTheme';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      await AuthService.forgotPassword({ email: values.email });
      message.success('Vui lòng kiểm tra email để đặt lại mật khẩu!');
    } catch (error: any) {
      const code = error.response?.data?.code;
      if (code === 1005) {
        message.error('Email không tồn tại trong hệ thống.');
      } else {
        message.error('Gửi yêu cầu thất bại. Vui lòng thử lại!');
      }
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
        className="forgot-top-header"
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
        <img src={logoUeims} alt="UEIMS Logo" style={{ height: 48, objectFit: 'contain' }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: AUTH_PRIMARY, margin: 0, lineHeight: 1.1, letterSpacing: 1 }}>
            UEIMS
          </h1>
          <p style={{ fontSize: 8, color: AUTH_TEXT_DARK, textTransform: 'uppercase', fontWeight: 600, margin: '2px 0 0 0', letterSpacing: 0.5 }}>
            Hệ thống quản lý thực tập sinh<br />và doanh nghiệp
          </p>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div
        className="forgot-card"
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
          className="forgot-left-panel"
          style={{
            width: '48%',
            background: AUTH_PRIMARY,
            color: AUTH_WHITE,
            padding: '40px 30px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle dots */}
          <div style={{ position: 'absolute', top: 40, left: 30, width: 80, height: 80, backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 2px, transparent 2px)', backgroundSize: '14px 14px' }} />
          <div style={{ position: 'absolute', bottom: 60, left: 20, width: 80, height: 80, backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 2px, transparent 2px)', backgroundSize: '14px 14px', opacity: 0.4 }} />

          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              marginTop: 10,
              marginBottom: 10,
              zIndex: 2,
            }}
          >
            <img
              src={authShield3d}
              alt="3D Security Illustration"
              style={{
                width: '100%',
                maxWidth: 340,
                height: 'auto',
                objectFit: 'cover',
                WebkitMaskImage: 'radial-gradient(circle at center, black 40%, rgba(0,0,0,0.8) 55%, transparent 70%)',
                maskImage: 'radial-gradient(circle at center, black 40%, rgba(0,0,0,0.8) 55%, transparent 70%)',
                transform: 'scale(1.15)',
              }}
            />
          </div>

          <div style={{ zIndex: 2, textAlign: 'center' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 12px 0', color: AUTH_WHITE }}>Bảo mật tài khoản của bạn</h2>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)', margin: '0 0 32px 0', padding: '0 10px' }}>
              Chúng tôi sẽ gửi liên kết khôi phục mật khẩu đến email đã đăng ký trong hệ thống.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          className="forgot-right-panel"
          style={{
            width: '52%',
            padding: '40px 60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: AUTH_PRIMARY, fontWeight: 700, fontSize: 13, marginBottom: 24 }}>
            <img src={logoUeims} alt="UEIMS Logo" style={{ height: 24, objectFit: 'contain' }} />
            <span>UEIMS</span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: AUTH_TEXT_DARK, margin: '0 0 12px 0' }}>
            Quên mật khẩu?
          </h1>
          <p style={{ color: AUTH_TEXT_GRAY, fontSize: 13, lineHeight: 1.6, margin: '0 0 30px 0' }}>
            Nhập email đã đăng ký. Chúng tôi sẽ gửi link khôi phục<br />mật khẩu đến hộp thư của bạn.
          </p>

          <Form onFinish={onFinish} layout="vertical" style={{ width: '100%' }}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: AUTH_TEXT_DARK, marginBottom: 8 }}>
                Địa chỉ Email
              </label>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' },
                ]}
                style={{ margin: 0 }}
              >
                <Input
                  placeholder="name@example.com"
                  size="large"
                  prefix={<Mail size={16} color="#94A3B8" style={{ marginRight: 8 }} />}
                  style={{
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    padding: '10px 14px',
                    fontSize: 14,
                    height: 44,
                  }}
                />
              </Form.Item>
            </div>

            <Form.Item style={{ margin: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{
                  height: 44,
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  background: AUTH_PRIMARY,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Send size={16} />
                Gửi Link Khôi Phục
              </Button>
            </Form.Item>
          </Form>

          <div style={{ marginTop: 24, backgroundColor: AUTH_PRIMARY_LIGHT, border: '1px solid rgba(233, 101, 0, 0.1)', borderRadius: 8, padding: '14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Info size={18} fill={AUTH_PRIMARY} color={AUTH_WHITE} style={{ flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <strong style={{ color: AUTH_PRIMARY, fontSize: 12 }}>Lưu ý</strong>
              <p style={{ color: AUTH_TEXT_GRAY, fontSize: 11, lineHeight: 1.5, margin: 0 }}>
                Link khôi phục sẽ hết hạn sau <strong style={{ color: AUTH_TEXT_DARK }}>2 giờ</strong>. Nếu không nhận được email, hãy kiểm tra thư mục Spam hoặc liên hệ Training Manager.
              </p>
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <span style={{ color: AUTH_TEXT_GRAY, fontSize: 13 }}>Nhớ mật khẩu?</span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', padding: 0, color: AUTH_PRIMARY, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>

          <style>{`
        @media (max-width: 1100px) {
          .forgot-card {
            max-width: 96vw !important;
          }
          .forgot-right-panel {
            padding: 32px 24px !important;
          }
        }
        @media (max-width: 768px) {
          .forgot-card {
            flex-direction: column !important;
            max-width: 480px !important;
          }
          .forgot-left-panel {
            display: none !important;
          }
          .forgot-right-panel {
            width: 100% !important;
            padding: 24px !important;
          }
          .forgot-top-header {
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
