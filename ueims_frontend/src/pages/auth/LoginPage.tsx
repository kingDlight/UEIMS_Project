import React, { useState } from 'react';
import { Form, Input, Button, Divider, message } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, AppleOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

// FPT Orange Gradient Theme
const FPT_ORANGE = '#E67E22';
const FPT_ORANGE_LIGHT = '#F39C12';
const FPT_ORANGE_DARK = '#D35400';
const FPT_WHITE = '#FFFFFF';
const FPT_GRAY = '#6B7280';
const FPT_LIGHT_GRAY = '#9CA3AF';
const FPT_BG_INPUT = '#F9FAFB';
const FPT_BORDER = '#E5E7EB';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

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
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* ============ LEFT SIDE - IMAGE AREA ============ */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background Image - Replace with FPT University image */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(https://daihoc.fpt.edu.vn/wp-content/uploads/2024/08/anh-fpt-1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.6)',
        }} />
        
        {/* Orange Gradient Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${FPT_ORANGE_DARK}CC 0%, ${FPT_ORANGE}99 50%, ${FPT_ORANGE_LIGHT}80 100%)`,
        }} />
        
        {/* Floating Decorative Shapes */}
        <div style={{
          position: 'absolute',
          width: 80,
          height: 80,
          borderRadius: 20,
          background: 'rgba(255, 255, 255, 0.15)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          top: '15%',
          left: '20%',
          animation: 'float1 6s ease-in-out infinite',
        }} />
        
        <div style={{
          position: 'absolute',
          width: 60,
          height: 60,
          borderRadius: 15,
          background: 'rgba(255, 255, 255, 0.1)',
          top: '25%',
          right: '25%',
          animation: 'float2 8s ease-in-out infinite',
        }} />
        
        <div style={{
          position: 'absolute',
          width: 100,
          height: 100,
          borderRadius: 25,
          border: '3px solid rgba(255, 255, 255, 0.2)',
          bottom: '30%',
          left: '15%',
          transform: 'rotate(15deg)',
          animation: 'float3 7s ease-in-out infinite',
        }} />
        
        <div style={{
          position: 'absolute',
          width: 50,
          height: 50,
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.12)',
          bottom: '20%',
          right: '20%',
          animation: 'float1 9s ease-in-out infinite reverse',
        }} />
        
        {/* Small dots scattered */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.25)',
            top: `${10 + i * 10}%`,
            left: `${5 + (i % 3) * 15}%`,
            animation: `float${(i % 3) + 1} ${5 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
        
        {/* Center Content */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          width: '80%',
          maxWidth: 400,
          zIndex: 1,
        }}>
          {/* Logo */}
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}>
            <span style={{
              color: FPT_WHITE,
              fontSize: 36,
              fontWeight: 800,
            }}>U</span>
          </div>
          
          <h1 style={{
            color: FPT_WHITE,
            fontSize: 32,
            fontWeight: 800,
            margin: '0 0 12px',
            letterSpacing: '-0.5px',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          }}>
            UEIMS
          </h1>
          
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: 15,
            lineHeight: 1.6,
            margin: 0,
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
          }}>
            University-Enterprise Internship Management System
          </p>
        </div>
        
        {/* Bottom tagline */}
        <div style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 1,
        }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 13,
            margin: 0,
          }}>
            © 2026 FPT University. All rights reserved.
          </p>
        </div>
      </div>

      {/* ============ RIGHT SIDE - LOGIN FORM ============ */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        background: FPT_WHITE,
      }}>
        <div style={{
          width: '100%',
          maxWidth: 400,
        }}>
          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#111827',
              margin: '0 0 8px',
              letterSpacing: '-0.5px',
            }}>
              Đăng nhập
            </h2>
            <p style={{
              color: FPT_GRAY,
              fontSize: 15,
              margin: 0,
            }}>
              Vui lòng đăng nhập để tiếp tục
            </p>
          </div>

          {/* Form */}
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            {/* Email Field */}
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' },
              ]}
              style={{ marginBottom: 20 }}
            >
              <Input
                prefix={<UserOutlined style={{ color: FPT_LIGHT_GRAY, fontSize: 18 }} />}
                placeholder="Email"
                style={{
                  height: 52,
                  borderRadius: 10,
                  border: `1.5px solid ${FPT_BORDER}`,
                  fontSize: 15,
                  background: FPT_BG_INPUT,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = FPT_ORANGE;
                  e.currentTarget.style.background = FPT_WHITE;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = FPT_BORDER;
                  e.currentTarget.style.background = FPT_BG_INPUT;
                }}
              />
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              style={{ marginBottom: 12 }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: FPT_LIGHT_GRAY, fontSize: 18 }} />}
                placeholder="Mật khẩu"
                style={{
                  height: 52,
                  borderRadius: 10,
                  fontSize: 15,
                }}
              />
            </Form.Item>

            {/* Forgot Password */}
            <div style={{ textAlign: 'right', marginBottom: 28 }}>
              <a href="#" style={{
                color: FPT_ORANGE,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
              }}>
                Quên mật khẩu?
              </a>
            </div>

            {/* Submit Button */}
            <Form.Item style={{ marginBottom: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                style={{
                  height: 52,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${FPT_ORANGE} 0%, ${FPT_ORANGE_DARK} 100%)`,
                  border: 'none',
                  fontSize: 16,
                  fontWeight: 600,
                  boxShadow: `0 4px 14px ${FPT_ORANGE}50`,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 20px ${FPT_ORANGE}60`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 14px ${FPT_ORANGE}50`;
                }}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          {/* Divider */}
          <Divider style={{ margin: '0 0 24px' }}>
            <span style={{ color: FPT_GRAY, fontSize: 13 }}>Hoặc tiếp tục với</span>
          </Divider>

          {/* Social Login */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <Button
              icon={<GoogleOutlined style={{ fontSize: 18 }} />}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 10,
                border: `1.5px solid ${FPT_BORDER}`,
                fontSize: 14,
                fontWeight: 500,
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: FPT_WHITE,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#EA4335';
                e.currentTarget.style.background = '#FEF2F2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = FPT_BORDER;
                e.currentTarget.style.background = FPT_WHITE;
              }}
            >
              Google
            </Button>
            <Button
              icon={<AppleOutlined style={{ fontSize: 18 }} />}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 10,
                border: `1.5px solid ${FPT_BORDER}`,
                fontSize: 14,
                fontWeight: 500,
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: FPT_WHITE,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#000';
                e.currentTarget.style.background = '#F5F5F5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = FPT_BORDER;
                e.currentTarget.style.background = FPT_WHITE;
              }}
            >
              Apple
            </Button>
          </div>

          {/* Register Link */}
          <div style={{
            textAlign: 'center',
            fontSize: 14,
            color: FPT_GRAY,
          }}>
            Bạn chưa có tài khoản?{' '}
            <Link to="#" style={{
              color: FPT_ORANGE,
              fontWeight: 600,
              textDecoration: 'none',
            }}>
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>

      {/* ============ STYLES ============ */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(-5deg); }
        }
        
        @keyframes float3 {
          0%, 100% { transform: translateY(0) rotate(15deg); }
          50% { transform: translateY(-12px) rotate(20deg); }
        }
        
        /* Ant Design Input Overrides */
        .ant-input-affix-wrapper {
          border-radius: 10px !important;
          border: 1.5px solid ${FPT_BORDER} !important;
          background: ${FPT_BG_INPUT} !important;
        }
        
        .ant-input-affix-wrapper:hover,
        .ant-input-affix-wrapper-focused {
          border-color: ${FPT_ORANGE} !important;
          box-shadow: none !important;
        }
        
        .ant-input-affix-wrapper-focused {
          background: ${FPT_WHITE} !important;
        }
        
        .ant-input-password-icon {
          color: ${FPT_LIGHT_GRAY} !important;
        }
        
        .ant-input-password-icon:hover {
          color: ${FPT_ORANGE} !important;
        }
        
        .ant-divider {
          color: ${FPT_GRAY} !important;
          font-size: 13px !important;
        }
        
        .ant-divider::before,
        .ant-divider::after {
          border-color: ${FPT_BORDER} !important;
        }
        
        ::selection {
          background: ${FPT_ORANGE}40;
        }
        
        @media (max-width: 900px) {
          /* Hide image on mobile, show full form */
        }
      `}</style>
    </div>
  );
};
