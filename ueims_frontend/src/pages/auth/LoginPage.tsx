import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

// FPT Brand Colors
const FPT_ORANGE = '#E67E22';
const FPT_DARK = '#1A1A2E';
const FPT_GRAY = '#6C757D';
const FPT_GRADIENT_START = '#E67E22';
const FPT_GRADIENT_END = '#D35400';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    // Mock authentication
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: `linear-gradient(135deg, ${FPT_DARK} 0%, ${FPT_ORANGE} 100%)`,
        padding: 20,
      }}
    >
      {/* Animated Background Orbs */}
      <div
        style={{
          position: 'fixed',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          top: -200,
          right: -200,
          animation: 'float 8s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.03)',
          bottom: -100,
          left: -100,
          animation: 'float 10s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }}
      />

      {/* Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 24,
          padding: 48,
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          zIndex: 1,
          animation: 'fadeInUp 0.6s ease forwards',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: `linear-gradient(135deg, ${FPT_GRADIENT_START}, ${FPT_GRADIENT_END})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#fff',
              fontSize: 36,
              boxShadow: '0 8px 30px rgba(230, 126, 34, 0.4)',
              marginBottom: 16,
            }}
          >
            U
          </div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 28,
              color: FPT_DARK,
              letterSpacing: '-0.5px',
            }}
          >
            UEIMS
          </div>
          <div
            style={{
              color: FPT_ORANGE,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginTop: 4,
            }}
          >
            FPT University
          </div>
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: FPT_DARK,
              margin: '0 0 8px',
              letterSpacing: '-0.5px',
            }}
          >
            Chào mừng trở lại!
          </h2>
          <p style={{ color: FPT_GRAY, fontSize: 15, margin: 0 }}>
            Đăng nhập để truy cập hệ thống UEIMS
          </p>
        </div>

        {/* Form */}
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: FPT_GRAY, fontSize: 18 }} />}
              placeholder="Email đăng nhập"
              style={{
                height: 52,
                borderRadius: 12,
                border: '2px solid #eee',
                fontSize: 15,
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: FPT_GRAY, fontSize: 18 }} />}
              placeholder="Mật khẩu"
              style={{
                height: 52,
                borderRadius: 12,
                border: '2px solid #eee',
                fontSize: 15,
              }}
            />
          </Form.Item>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 28,
            }}
          >
            <Form.Item name="remember" valuePropName="checked" style={{ margin: 0 }}>
              <Checkbox style={{ color: FPT_GRAY }}>Ghi nhớ đăng nhập</Checkbox>
            </Form.Item>

            <a
              href="#"
              style={{
                color: FPT_ORANGE,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Quên mật khẩu?
            </a>
          </div>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                height: 52,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${FPT_GRADIENT_START}, ${FPT_GRADIENT_END})`,
                border: 'none',
                fontSize: 16,
                fontWeight: 700,
                boxShadow: '0 4px 15px rgba(230, 126, 34, 0.35)',
                transition: 'all 0.3s',
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        {/* Demo Accounts */}
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: `linear-gradient(135deg, rgba(230, 126, 34, 0.08), rgba(230, 126, 34, 0.04))`,
            borderRadius: 12,
            border: '1px solid rgba(230, 126, 34, 0.15)',
          }}
        >
          <div
            style={{
              color: FPT_DARK,
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 10,
              textAlign: 'center',
            }}
          >
            💡 Tài khoản demo (click để điền)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {[
              { email: 'admin@ueims.edu', role: 'Admin' },
              { email: 'tm@ueims.edu', role: 'TM' },
              { email: 'student@ueims.edu', role: 'Student' },
              { email: 'enterprise@ueims.edu', role: 'Enterprise' },
            ].map((account) => (
              <div
                key={account.email}
                style={{
                  background: '#fff',
                  borderRadius: 8,
                  padding: '8px 10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid transparent',
                  textAlign: 'center',
                }}
                onClick={() => {
                  form.setFieldsValue({ email: account.email, password: '123456' });
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = FPT_ORANGE;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div style={{ fontSize: 11, color: FPT_GRAY }}>{account.role}</div>
                <div
                  style={{
                    fontSize: 10,
                    color: FPT_DARK,
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {account.email}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link
            to="/"
            style={{
              color: FPT_GRAY,
              textDecoration: 'none',
              fontSize: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'color 0.2s',
            }}
          >
            ← Quay về trang chủ
          </Link>
        </div>
      </div>

      {/* Global Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        input:focus, .ant-input-affix-wrapper:focus, .ant-input-affix-wrapper-focused {
          border-color: ${FPT_ORANGE} !important;
          box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.1) !important;
        }
        
        input:hover, .ant-input-affix-wrapper:hover {
          border-color: ${FPT_ORANGE} !important;
        }
        
        ::selection {
          background: rgba(230, 126, 34, 0.3);
        }
      `}</style>
    </div>
  );
};
