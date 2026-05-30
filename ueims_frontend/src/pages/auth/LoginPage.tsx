import React, { useState } from 'react';
import { Form, Input, Button, Divider, message } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

// Fresh Color Palette - Modern Blue/Green Gradient
const PRIMARY = '#3B82F6';
const SECONDARY = '#10B981';
const ACCENT = '#06B6D4';
const DARK = '#0F172A';
const DARK_BLUE = '#1E3A5F';
const LIGHT_BG = '#F8FAFC';
const GRAY = '#64748B';
const WHITE = '#FFFFFF';

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
      background: LIGHT_BG,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ============ DECORATIVE BACKGROUND ELEMENTS ============ */}
      
      {/* Large gradient circle - top right */}
      <div style={{
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${PRIMARY}25 0%, transparent 70%)`,
        top: -200,
        right: -100,
        animation: 'float 10s ease-in-out infinite',
      }} />
      
      {/* Medium circle - bottom left */}
      <div style={{
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${SECONDARY}20 0%, transparent 70%)`,
        bottom: -150,
        left: -100,
        animation: 'float 12s ease-in-out infinite reverse',
      }} />
      
      {/* Small accent circle - top left */}
      <div style={{
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${ACCENT}30 0%, transparent 70%)`,
        top: 100,
        left: 100,
        animation: 'float 8s ease-in-out infinite',
      }} />
      
      {/* Floating square - right */}
      <div style={{
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 20,
        background: `${PRIMARY}15`,
        border: `2px solid ${PRIMARY}30`,
        top: '20%',
        right: '15%',
        transform: 'rotate(15deg)',
        animation: 'float 9s ease-in-out infinite',
      }} />
      
      {/* Floating square - bottom right */}
      <div style={{
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 16,
        background: `${SECONDARY}20`,
        border: `2px solid ${SECONDARY}40`,
        bottom: '25%',
        right: '20%',
        transform: 'rotate(-10deg)',
        animation: 'float 11s ease-in-out infinite reverse',
      }} />
      
      {/* Floating triangle shape - left */}
      <div style={{
        position: 'absolute',
        width: 0,
        height: 0,
        borderLeft: '40px solid transparent',
        borderRight: '40px solid transparent',
        borderBottom: `70px solid ${ACCENT}20`,
        top: '40%',
        left: '8%',
        animation: 'float 10s ease-in-out infinite',
      }} />
      
      {/* Small dots pattern - scattered */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: i % 3 === 0 ? PRIMARY : i % 3 === 1 ? SECONDARY : ACCENT,
            opacity: 0.3,
            top: `${15 + i * 7}%`,
            left: `${5 + (i % 4) * 8}%`,
            animation: `float ${6 + i % 4}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}

      {/* ============ MAIN CONTAINER ============ */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Glass Card */}
        <div style={{
          width: '100%',
          maxWidth: 920,
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 32,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          overflow: 'hidden',
          animation: 'slideUp 0.6s ease forwards',
        }}>
          
          {/* ============ LEFT SIDE - ILLUSTRATION ============ */}
          <div style={{
            flex: 1,
            background: `linear-gradient(135deg, ${DARK} 0%, ${DARK_BLUE} 50%, #2D4A6F 100%)`,
            padding: 60,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
          className="login-illustration"
          >
            {/* Abstract shapes */}
            <div style={{
              position: 'absolute',
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${PRIMARY}40 0%, transparent 70%)`,
              top: -100,
              left: -100,
            }} />
            <div style={{
              position: 'absolute',
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${SECONDARY}30 0%, transparent 70%)`,
              bottom: -50,
              right: -50,
            }} />
            
            {/* Geometric patterns */}
            <div style={{
              position: 'absolute',
              top: 40,
              right: 40,
              width: 100,
              height: 100,
              border: `2px solid ${PRIMARY}50`,
              borderRadius: 24,
              transform: 'rotate(20deg)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: 80,
              left: 40,
              width: 80,
              height: 80,
              border: `2px solid ${SECONDARY}50`,
              borderRadius: 20,
              transform: 'rotate(-15deg)',
            }} />
            
            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Logo */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 40,
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  color: WHITE,
                  fontSize: 22,
                  boxShadow: `0 8px 20px ${PRIMARY}40`,
                }}>
                  U
                </div>
                <span style={{
                  color: WHITE,
                  fontWeight: 800,
                  fontSize: 22,
                  letterSpacing: '-0.5px',
                }}>
                  UEIMS
                </span>
              </div>
              
              <h2 style={{
                color: WHITE,
                fontSize: 'clamp(24px, 3vw, 36px)',
                fontWeight: 800,
                margin: '0 0 16px',
                lineHeight: 1.2,
                letterSpacing: '-0.5px',
              }}>
                Quản lý Thực tập
                <br />
                <span style={{ color: PRIMARY }}>Doanh nghiệp</span>
              </h2>
              
              <p style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: 15,
                lineHeight: 1.7,
                margin: 0,
                maxWidth: 320,
              }}>
                Nền tảng số hóa quy trình OJT, kết nối nhà trường với doanh nghiệp một cách hiệu quả.
              </p>
              
              {/* Feature icons */}
              <div style={{
                display: 'flex',
                gap: 16,
                marginTop: 40,
              }}>
                {[
                  { icon: '🎓', label: '2,500+ SV' },
                  { icon: '🏢', label: '350+ DN' },
                  { icon: '⭐', label: '4.9/5' },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <span style={{
                      color: WHITE,
                      fontSize: 13,
                      fontWeight: 600,
                    }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* ============ RIGHT SIDE - LOGIN FORM ============ */}
          <div style={{
            flex: 1,
            padding: 60,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <div style={{ maxWidth: 360, margin: '0 auto', width: '100%' }}>
              {/* Header */}
              <div style={{ marginBottom: 36 }}>
                <h1 style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: DARK,
                  margin: '0 0 8px',
                  letterSpacing: '-0.5px',
                }}>
                  Đăng nhập
                </h1>
                <p style={{
                  color: GRAY,
                  fontSize: 15,
                  margin: 0,
                }}>
                  Chào mừng bạn quay trở lại!
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
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' },
                  ]}
                  style={{ marginBottom: 20 }}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: GRAY, fontSize: 18 }} />}
                    placeholder="Email"
                    style={{
                      height: 52,
                      borderRadius: 12,
                      border: '1.5px solid #E2E8F0',
                      fontSize: 15,
                      background: '#F8FAFC',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = PRIMARY;
                      e.currentTarget.style.background = WHITE;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.background = '#F8FAFC';
                    }}
                  />
                </Form.Item>
                
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: GRAY, fontSize: 18 }} />}
                    placeholder="Mật khẩu"
                    style={{
                      height: 52,
                      borderRadius: 12,
                      fontSize: 15,
                    }}
                  />
                </Form.Item>
                
                {/* Forgot password */}
                <div style={{ textAlign: 'right', marginBottom: 28 }}>
                  <a href="#" style={{
                    color: PRIMARY,
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}>
                    Quên mật khẩu?
                  </a>
                </div>
                
                {/* Submit button */}
                <Form.Item style={{ marginBottom: 20 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    style={{
                      height: 52,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
                      border: 'none',
                      fontSize: 16,
                      fontWeight: 600,
                      boxShadow: `0 4px 14px ${PRIMARY}40`,
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 6px 20px ${PRIMARY}50`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = `0 4px 14px ${PRIMARY}40`;
                    }}
                  >
                    Đăng nhập
                  </Button>
                </Form.Item>
              </Form>
              
              {/* Divider */}
              <Divider style={{ margin: '0 0 20px' }}>
                <span style={{ color: GRAY, fontSize: 13 }}>Hoặc tiếp tục với</span>
              </Divider>
              
              {/* Social buttons */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <Button
                  icon={<GoogleOutlined style={{ fontSize: 18 }} />}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 12,
                    border: '1.5px solid #E2E8F0',
                    fontSize: 14,
                    fontWeight: 500,
                    color: DARK,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: WHITE,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#EA4335';
                    e.currentTarget.style.background = '#FEF2F2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.background = WHITE;
                  }}
                >
                  Google
                </Button>
                <Button
                  icon={<FacebookOutlined style={{ fontSize: 18 }} />}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 12,
                    border: '1.5px solid #E2E8F0',
                    fontSize: 14,
                    fontWeight: 500,
                    color: DARK,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: WHITE,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1877F2';
                    e.currentTarget.style.background = '#EFF6FF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.background = WHITE;
                  }}
                >
                  Facebook
                </Button>
              </div>
              
              {/* Register link */}
              <div style={{
                textAlign: 'center',
                fontSize: 14,
                color: GRAY,
              }}>
                Bạn chưa có tài khoản?{' '}
                <Link to="#" style={{
                  color: PRIMARY,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}>
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ STYLES ============ */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .login-illustration { animation: fadeIn 0.8s ease; }
        
        @media (max-width: 900px) {
          .login-illustration { display: none !important; }
        }
        
        /* Ant Design overrides */
        .ant-input-affix-wrapper {
          border-radius: 12px !important;
          border: 1.5px solid #E2E8F0 !important;
          background: #F8FAFC !important;
        }
        
        .ant-input-affix-wrapper:hover,
        .ant-input-affix-wrapper-focused {
          border-color: ${PRIMARY} !important;
          box-shadow: none !important;
        }
        
        .ant-input-affix-wrapper-focused {
          background: ${WHITE} !important;
        }
        
        .ant-divider {
          color: ${GRAY} !important;
          font-size: 13px !important;
        }
        
        .ant-divider::before,
        .ant-divider::after {
          border-color: #E2E8F0 !important;
        }
        
        ::selection {
          background: ${PRIMARY}30;
        }
      `}</style>
    </div>
  );
};
