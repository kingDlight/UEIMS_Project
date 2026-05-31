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

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    try {
      await AuthService.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      message.success('Đổi mật khẩu thành công!');
      navigate('/app/dashboard');
    } catch (error: any) {
      const code = error.response?.data?.code;
      if (code === 2002) {
        message.error('Mật khẩu cũ không chính xác!');
      } else if (code === 2003) {
        message.error('Mật khẩu xác nhận không khớp!');
      } else if (code === 1015) {
        message.error('Mật khẩu mới không hợp lệ. Phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt!');
      } else {
        message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại!');
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
          UEIMS
        </div>

        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: FPT_DARK,
            marginBottom: 8,
          }}
        >
          Đổi mật khẩu
        </div>

        <div
          style={{
            fontSize: 16,
            color: '#e74c3c',
            marginBottom: 32,
            fontWeight: 500,
          }}
        >
          Bạn cần đổi mật khẩu trước khi tiếp tục sử dụng hệ thống.
        </div>

        <Form onFinish={onFinish}>
          <div style={{ width: 380, marginBottom: 28 }}>
            <label
              style={{
                display: 'block',
                color: FPT_ORANGE,
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              Mật khẩu cũ
            </label>
            <Form.Item
              name="oldPassword"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
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

          <div style={{ width: 380, marginBottom: 28 }}>
            <label
              style={{
                display: 'block',
                color: FPT_ORANGE,
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              Mật khẩu mới
            </label>
            <Form.Item
              name="newPassword"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
              ]}
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

          <div style={{ width: 380, marginBottom: 40 }}>
            <label
              style={{
                display: 'block',
                color: FPT_ORANGE,
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              Xác nhận mật khẩu mới
            </label>
            <Form.Item
              name="confirmPassword"
              rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu!' }]}
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
                width: 220,
                height: 54,
                border: 'none',
                borderRadius: 40,
                color: FPT_WHITE,
                fontSize: 18,
                fontWeight: 700,
                cursor: 'pointer',
                background: `linear-gradient(90deg, ${FPT_ORANGE}, ${FPT_ORANGE_DARK})`,
                boxShadow: `0 10px 20px ${FPT_ORANGE}40`,
              }}
            >
              Xác nhận
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 24 }}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              logout();
              navigate('/login');
            }}
            style={{
              color: FPT_GRAY,
              textDecoration: 'none',
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            Đăng xuất
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
