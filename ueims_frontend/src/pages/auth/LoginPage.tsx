import logoUeims from '@/assets/logo_ueims.png';
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthService } from '@/services/AuthService';
import { getDeviceId } from '@/utils/device';
import { extractUserFromToken } from '@/utils/jwt';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import {
  AUTH_PRIMARY,
  AUTH_PRIMARY_DARK,
  AUTH_WHITE,
  AUTH_TEXT_GRAY,
  AUTH_FONT,
} from '@/theme/authTheme';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const loginWithTokens = useAuthStore((state) => state.loginWithTokens);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [loading, setLoading] = useState(false);

  const getRedirectPath = (roles: string[]): string => {
    if (roles.includes('STUDENT')) return '/student-dashboard';
    if (roles.includes('ENTERPRISE')) return '/student-dashboard';
    return '/app/dashboard';
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const result = await AuthService.login({
        email: values.email,
        password: values.password,
        deviceId: getDeviceId(),
      });

      if (result.mustChangePassword) {
        loginWithTokens(result.token, result.refreshToken);
        message.warning('Bạn cần đổi mật khẩu trước khi tiếp tục!');
        navigate('/change-password');
        return;
      }

      loginWithTokens(result.token, result.refreshToken);
      message.success('Đăng nhập thành công!');
      const payload = extractUserFromToken(result.token);
      const redirectPath = getRedirectPath(payload?.roles || []);
      navigate(redirectPath);
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

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;
    setLoading(true);
    try {
      const result = await AuthService.loginWithGoogle(credentialResponse.credential);
      
      if (result.mustChangePassword) {
        loginWithTokens(result.token, result.refreshToken);
        message.warning('Bạn cần đổi mật khẩu trước khi tiếp tục!');
        navigate('/change-password');
        return;
      }

      loginWithTokens(result.token, result.refreshToken);
      message.success('Đăng nhập với Google thành công!');
      const payload = extractUserFromToken(result.token);
      const redirectPath = getRedirectPath(payload?.roles || []);
      navigate(redirectPath);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message;
      if (errorMsg) {
        message.error(errorMsg);
      } else {
        message.error('Đăng nhập với Google thất bại. Vui lòng thử lại!');
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
        flexWrap: 'wrap',
        fontFamily: AUTH_FONT,
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
        className="login-left-panel"
        style={{
          width: '40%',
          minWidth: 400,
          padding: '40px 80px 40px 80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Back to home */}
        <div style={{ marginBottom: 40 }}>
          <button
            type="button"
            onClick={() => {
              navigate('/');
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: AUTH_TEXT_GRAY,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = AUTH_PRIMARY; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = AUTH_TEXT_GRAY; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Quay về trang chủ
          </button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <img src={logoUeims} alt="UEIMS Logo" style={{ height: 48, objectFit: 'contain' }} />
        </div>

        <div style={{ color: AUTH_PRIMARY, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
          Welcome to
        </div>

        <div style={{ fontSize: 52, fontWeight: 800, color: '#1A1A2E', marginBottom: 32, letterSpacing: '-2px' }}>
          UEIMS
        </div>

        <Form onFinish={onFinish}>
          <div style={{ width: '100%', maxWidth: 320, marginBottom: 20 }}>
            <label htmlFor="email" style={{ display: 'block', color: AUTH_PRIMARY, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
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
                  padding: '8px 0',
                  fontSize: 15,
                  outline: 'none',
                  borderRadius: 0,
                }}
              />
            </Form.Item>
          </div>

          <div style={{ width: '100%', maxWidth: 320, marginBottom: 20 }}>
            <label htmlFor="password" style={{ display: 'block', color: AUTH_PRIMARY, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
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
                  padding: '8px 0',
                  fontSize: 15,
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
                width: 160,
                height: 46,
                border: 'none',
                borderRadius: 40,
                color: AUTH_WHITE,
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                background: `linear-gradient(90deg, ${AUTH_PRIMARY}, ${AUTH_PRIMARY_DARK})`,
                boxShadow: `0 8px 18px ${AUTH_PRIMARY}40`,
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 12px 24px ${AUTH_PRIMARY}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 8px 18px ${AUTH_PRIMARY}40`;
              }}
            >
              LOGIN
            </Button>
          </Form.Item>
        </Form>

        <div style={{ width: '100%', maxWidth: 320 }}>
          <Divider plain style={{ borderColor: '#e0e0e0', color: AUTH_TEXT_GRAY, fontSize: 13, margin: '20px 0' }}>
            HOẶC
          </Divider>

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 20 }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                message.error('Đăng nhập với Google thất bại!');
              }}
              useOneTap
              shape="pill"
              theme="outline"
            />
          </div>
        </div>

        {/* Forgot Password */}
        <div style={{ marginTop: 12, marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => {
              navigate('/forgot-password');
            }}
            style={{
              color: AUTH_PRIMARY,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 500,
              border: 'none',
              background: 'transparent',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Divider + Register */}
        <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: 16 }}>
          <div style={{ color: AUTH_TEXT_GRAY, fontSize: 13, marginBottom: 6 }}>
            Bạn là nhà tuyển dụng?
          </div>
          <button
            type="button"
            onClick={() => {
              navigate('/register-enterprise');
            }}
            style={{
              color: AUTH_PRIMARY,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            Đăng ký tài khoản nhà tuyển dụng →
          </button>
        </div>
      </div>

      {/* RIGHT SIDE - IMAGE */}
      <div
        className="login-right-panel"
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          minHeight: '100vh',
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
            background: `linear-gradient(135deg, ${AUTH_PRIMARY}15 0%, ${AUTH_PRIMARY_DARK}30 100%)`,
            clipPath: 'url(#humps)',
            pointerEvents: 'none',
          }}
        />
      </div>

      <style>{`
        .ant-input {
          background: transparent !important;
          border: none !important;
          font-size: 15px !important;
        }
        .ant-input-affix-wrapper {
          background: transparent !important;
          border: none !important;
          border-bottom: 1px solid #a8a8a8 !important;
          border-radius: 0 !important;
          padding: 8px 0 !important;
        }
        .ant-input-affix-wrapper:hover,
        .ant-input-affix-wrapper-focused {
          border-color: ${AUTH_PRIMARY} !important;
          box-shadow: none !important;
        }
        .ant-input:focus {
          box-shadow: none !important;
        }
        @media (max-width: 1100px) {
          .login-left-panel {
            padding: 32px 40px !important;
          }
        }
        @media (max-width: 900px) {
          .login-left-panel {
            width: 100% !important;
            min-width: unset !important;
            padding: 40px !important;
          }
          .login-right-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
