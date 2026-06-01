import logoUeims from '@/assets/logo_ueims.png';
import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { AuthService } from '@/services/AuthService';

const FPT_ORANGE = '#E67E22';
const FPT_ORANGE_DARK = '#D35400';
const FPT_WHITE = '#FFFFFF';
const FPT_DARK = '#1A1A2E';
const FPT_GRAY = '#6B7280';
const FPT_LIGHT_GRAY = '#F3F4F6';

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
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAFAFA',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${FPT_ORANGE}18 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, ${FPT_ORANGE_DARK}12 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '40%', right: '30%', width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, #FEF3C7 10%, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }} />
      {/* Dot grid */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.4 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill={`${FPT_ORANGE}30`} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          maxWidth: 900,
          width: '100%',
          borderRadius: 24,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.04)',
          background: FPT_WHITE,
          minHeight: 540,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* LEFT — Illustration */}
        <div
          style={{
            width: '45%',
            background: `linear-gradient(145deg, ${FPT_ORANGE} 0%, ${FPT_ORANGE_DARK} 100%)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 40px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `${FPT_WHITE}15`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -40,
              left: -40,
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: `${FPT_WHITE}10`,
            }}
          />

          {/* Icon */}
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: `${FPT_WHITE}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 32,
            }}
          >
            <Mail size={40} color={FPT_WHITE} strokeWidth={1.5} />
          </div>

          <h2
            style={{
              color: FPT_WHITE,
              fontSize: 26,
              fontWeight: 700,
              marginBottom: 16,
              textAlign: 'center',
              lineHeight: 1.3,
            }}
          >
            Khôi phục tài khoản
          </h2>
          <p
            style={{
              color: `${FPT_WHITE}CC`,
              fontSize: 15,
              textAlign: 'center',
              lineHeight: 1.7,
            }}
          >
            Nhập email đã đăng ký để nhận link khôi phục mật khẩu qua hộp thư của bạn.
          </p>
        </div>

        {/* RIGHT — Form */}
        <div
          style={{
            flex: 1,
            padding: '56px 48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle decorations inside the white panel */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${FPT_ORANGE}08 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${FPT_ORANGE_DARK}06 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <svg style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.3 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dotsInner" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill={`${FPT_ORANGE}20`} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotsInner)" />
          </svg>

          {/* Logo mark */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 40,
            }}
          >
            <img src={logoUeims} alt="UEIMS Logo" style={{ height: 36, objectFit: 'contain' }} />
            <span
              style={{
                color: FPT_ORANGE,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              UEIMS
            </span>
          </div>

          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: FPT_DARK,
              marginBottom: 10,
              lineHeight: 1.2,
            }}
          >
            Quên mật khẩu?
          </h1>
          <p
            style={{
              color: FPT_GRAY,
              fontSize: 15,
              marginBottom: 36,
              lineHeight: 1.6,
            }}
          >
            Nhập email đã đăng ký. Chúng tôi sẽ gửi link khôi phục mật khẩu đến hộp thư của bạn.
          </p>

          <Form onFinish={onFinish}>
            <div style={{ marginBottom: 28 }}>
              <label
                style={{
                  display: 'block',
                  color: FPT_DARK,
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
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
                  prefix={
                    <Mail
                      size={16}
                      color={FPT_GRAY}
                      style={{ marginRight: 8 }}
                    />
                  }
                  style={{
                    borderRadius: 12,
                    border: '1.5px solid #E5E7EB',
                    padding: '10px 14px',
                    fontSize: 15,
                    height: 48,
                    transition: 'border-color 0.2s',
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
                  height: 52,
                  borderRadius: 14,
                  fontSize: 16,
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${FPT_ORANGE}, ${FPT_ORANGE_DARK})`,
                  border: 'none',
                  boxShadow: `0 8px 20px ${FPT_ORANGE}40`,
                  letterSpacing: '0.02em',
                }}
              >
                Gửi Link Khôi Phục
              </Button>
            </Form.Item>
          </Form>

          <button
            onClick={() => navigate('/login')}
            style={{
              marginTop: 28,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: FPT_ORANGE,
              fontSize: 14,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: 0,
              width: 'fit-content',
            }}
          >
            <ArrowLeft size={16} />
            Quay lại trang đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};
