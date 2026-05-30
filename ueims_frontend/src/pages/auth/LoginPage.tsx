import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

// FPT Orange Theme Colors
const FPT_ORANGE = '#E67E22';
const FPT_ORANGE_DARK = '#D35400';
const FPT_WHITE = '#FFFFFF';
const FPT_DARK = '#1A1A2E';
const FPT_GRAY = '#6B7280';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    if (values.email === 'admin@ueims.edu' && values.password === '123456') {
      login(
        { id: '1', email: values.email, fullName: 'System Admin', roles: ['ADMIN'] },
        'mock-jwt-token-123456',
        'ADMIN'
      );
      message.success('Đăng nhập thành công!');
      navigate('/app/dashboard');
    } else if (values.email === 'tm@ueims.edu' && values.password === '123456') {
      login(
        { id: '2', email: values.email, fullName: 'Training Manager', roles: ['TRAINING_MANAGER'] },
        'mock-jwt-token-123456',
        'TRAINING_MANAGER'
      );
      message.success('Đăng nhập thành công!');
      navigate('/app/dashboard');
    } else if (values.email === 'student@ueims.edu' && values.password === '123456') {
      login(
        { id: '3', email: values.email, fullName: 'Nguyễn Văn A', roles: ['STUDENT'] },
        'mock-jwt-token-123456',
        'STUDENT'
      );
      message.success('Đăng nhập thành công!');
      navigate('/app/dashboard');
    } else if (values.email === 'enterprise@ueims.edu' && values.password === '123456') {
      login(
        { id: '4', email: values.email, fullName: 'FPT Software', roles: ['ENTERPRISE'] },
        'mock-jwt-token-123456',
        'ENTERPRISE'
      );
      message.success('Đăng nhập thành công!');
      navigate('/app/dashboard');
    } else {
      message.error('Sai email hoặc mật khẩu!');
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#f6f6f6',
      overflow: 'hidden',
      height: '100vh',
    }}>
      {/* SVG Definitions */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <clipPath id="humps" clipPathUnits="objectBoundingBox">
            <path d="M0,0 
                     C0.05,0 0.08,0.08 0.05,0.15 
                     C0.02,0.22 0.08,0.25 0.06,0.35 
                     C0.04,0.45 0.10,0.50 0.08,0.60 
                     C0.06,0.70 0.12,0.75 0.10,0.85 
                     C0.08,0.95 0.14,1.00 0.12,1.00 
                     L1,1 L1,0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* ============ LEFT SIDE - FORM ============ */}
      <div style={{
        width: '40%',
        paddingLeft: 90,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
        height: '100vh',
      }}>
        {/* Logo Dot */}
        <div style={{
          width: 42,
          height: 42,
          borderRadius: '50%',
          background: FPT_ORANGE,
          marginBottom: 70,
        }} />

        {/* Subtitle */}
        <div style={{
          color: FPT_ORANGE,
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 8,
        }}>
          Welcome to
        </div>

        {/* Logo */}
        <div style={{
          fontSize: 62,
          fontWeight: 800,
          color: FPT_DARK,
          marginBottom: 60,
          letterSpacing: '-2px',
        }}>
          UEIMS
        </div>

        {/* Form */}
        <Form onFinish={onFinish}>
          {/* Email Field */}
          <div style={{ width: 340, marginBottom: 40 }}>
            <label style={{
              display: 'block',
              color: FPT_ORANGE,
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 10,
            }}>
              Email
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
                placeholder="email@example.com"
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: '1px solid #a8a8a8',
                  background: 'transparent',
                  padding: '10px 0',
                  fontSize: 18,
                  outline: 'none',
                  borderRadius: 0,
                }}
              />
            </Form.Item>
          </div>

          {/* Password Field */}
          <div style={{ width: 340, marginBottom: 40 }}>
            <label style={{
              display: 'block',
              color: FPT_ORANGE,
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 10,
            }}>
              Password
            </label>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              style={{ margin: 0 }}
            >
              <Input.Password
                placeholder="••••••••"
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: '1px solid #a8a8a8',
                  background: 'transparent',
                  padding: '10px 0',
                  fontSize: 18,
                  outline: 'none',
                  borderRadius: 0,
                }}
              />
            </Form.Item>
          </div>

          {/* Login Button */}
          <Form.Item style={{ margin: 0 }}>
            <Button
              htmlType="submit"
              loading={loading}
              style={{
                width: 170,
                height: 54,
                border: 'none',
                borderRadius: 40,
                color: FPT_WHITE,
                fontSize: 20,
                fontWeight: 700,
                cursor: 'pointer',
                background: `linear-gradient(90deg, ${FPT_ORANGE}, ${FPT_ORANGE_DARK})`,
                boxShadow: `0 10px 20px ${FPT_ORANGE}40`,
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 15px 30px ${FPT_ORANGE}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 10px 20px ${FPT_ORANGE}40`;
              }}
            >
              LOGIN
            </Button>
          </Form.Item>
        </Form>

        {/* Signup Link */}
        <div style={{
          marginTop: 140,
          color: FPT_GRAY,
          fontSize: 18,
        }}>
          Don't have an account?{' '}
          <a href="#" style={{
            color: FPT_ORANGE,
            textDecoration: 'none',
            fontWeight: 700,
          }}>
            Sign up
          </a>
        </div>
      </div>

      {/* ============ RIGHT SIDE - IMAGE WITH HUMP CURVES ============ */}
      <div style={{
        width: '60%',
        position: 'relative',
        overflow: 'hidden',
        height: '100vh',
      }}>
        {/* Background Image with rounded humps */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(https://daihoc.fpt.edu.vn/wp-content/uploads/2024/03/dai-hoc-fpt-da-nang-2-1024x663.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          clipPath: 'url(#humps)',
        }} />
        
        {/* Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(135deg, ${FPT_ORANGE}15 0%, ${FPT_ORANGE_DARK}30 100%)`,
          clipPath: 'url(#humps)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ============ STYLES ============ */}
      <style>{`
        .ant-input {
          background: transparent !important;
          border: none !important;
          font-size: 18px !important;
        }
        
        .ant-input-affix-wrapper {
          background: transparent !important;
          border: none !important;
          border-bottom: 1px solid #a8a8a8 !important;
          border-radius: 0 !important;
          padding: 10px 0 !important;
        }
        
        .ant-input-affix-wrapper:hover,
        .ant-input-affix-wrapper-focused {
          border-color: ${FPT_ORANGE} !important;
          box-shadow: none !important;
        }
        
        .ant-input:focus {
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
};
