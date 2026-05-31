import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthService } from '@/services/AuthService';

const FPT_ORANGE = '#E67E22';
const FPT_ORANGE_DARK = '#D35400';
const FPT_WHITE = '#FFFFFF';
const FPT_DARK = '#1A1A2E';
const FPT_GRAY = '#6B7280';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const loginWithToken = useAuthStore((state) => state.loginWithToken);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const result = await AuthService.login({
        email: values.email,
        password: values.password,
      });

      if (result.mustChangePassword) {
        loginWithToken(result.token);
        message.warning('Bạn cần đổi mật khẩu trước khi tiếp tục!');
        navigate('/change-password');
        return;
      }

      loginWithToken(result.token);
      message.success('Đăng nhập thành công!');
      navigate('/app/dashboard');
    } catch (error: any) {
      const code = error.response?.data?.code;
      const errorMsg = error.response?.data?.message;

      if (code === 2001) {
        message.error('Tài khoản bị khóa do nhập sai mật khẩu 5 lần. Vui lòng thử lại sau 30 phút.');
      } else if (code === 1006) {
        message.error('Xác thực thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
      } else if (code === 1005) {
        message.error('Tài khoản không tồn tại trong hệ thống.');
      } else if (errorMsg) {
        message.error(errorMsg);
      } else {
        message.error('Đăng nhập thất bại. Vui lòng thử lại!');
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
        background: '#f6f6f6',
        overflow: 'hidden',
        height: '100vh',
      }}
    >
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

      {/* LEFT SIDE - FORM */}
      <div
        style={{
          width: '40%',
          paddingLeft: 90,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          height: '100vh',
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: FPT_ORANGE,
            marginBottom: 70,
          }}
        />

        <div
          style={{
            color: FPT_ORANGE,
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Welcome to
        </div>

        <div
          style={{
            fontSize: 62,
            fontWeight: 800,
            color: FPT_DARK,
            marginBottom: 60,
            letterSpacing: '-2px',
          }}
        >
          UEIMS
        </div>

        <Form onFinish={onFinish}>
          <div style={{ width: 340, marginBottom: 40 }}>
            <label
              style={{
                display: 'block',
                color: FPT_ORANGE,
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
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

          <div style={{ width: 340, marginBottom: 40 }}>
            <label
              style={{
                display: 'block',
                color: FPT_ORANGE,
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
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

        {/* Forgot Password Link */}
        <div style={{ marginTop: 16 }}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/forgot-password');
            }}
            style={{
              color: FPT_ORANGE,
              textDecoration: 'none',
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            Quên mật khẩu?
          </a>
        </div>

        <div
          style={{
            marginTop: 140,
            color: FPT_GRAY,
            fontSize: 18,
          }}
        >
          Don't have an account?{' '}
          <a
            href="#"
            style={{
              color: FPT_ORANGE,
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Sign up
          </a>
        </div>
      </div>

      {/* RIGHT SIDE - IMAGE */}
      <div
        style={{
          width: '60%',
          position: 'relative',
          overflow: 'hidden',
          height: '100vh',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage:
              'url(https://daihoc.fpt.edu.vn/wp-content/uploads/2024/03/dai-hoc-fpt-da-nang-2-1024x663.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            clipPath: 'url(#humps)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, ${FPT_ORANGE}15 0%, ${FPT_ORANGE_DARK}30 100%)`,
            clipPath: 'url(#humps)',
            pointerEvents: 'none',
          }}
        />
      </div>

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
