import bgAuth from '@/assets/bg-auth.png';
import logoUeims from '@/assets/logo_ueims.png';
import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthService } from '@/services/AuthService';

const FPT_ORANGE = '#E67E22';
const FPT_ORANGE_DARK = '#D35400';
const FPT_WHITE = '#FFFFFF';
const FPT_DARK = '#1A1A2E';
const FPT_GRAY = '#6B7280';
const STRENGTH_RED = '#EF4444';
const STRENGTH_ORANGE = '#F97316';
const STRENGTH_YELLOW = '#EAB308';
const STRENGTH_GREEN = '#22C55E';

function validateBR04(password: string): { valid: boolean; hints: string[] } {
  const hints: string[] = [];
  if (password.length < 8) hints.push('Ít nhất 8 ký tự');
  if (!/[A-Z]/.test(password)) hints.push('Ít nhất 1 chữ hoa (A-Z)');
  if (!/[a-z]/.test(password)) hints.push('Ít nhất 1 chữ thường (a-z)');
  if (!/\d/.test(password)) hints.push('Ít nhất 1 chữ số (0-9)');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) hints.push('Ít nhất 1 ký tự đặc biệt (!@#$...)');
  return { valid: hints.length === 0, hints };
}

function getPasswordStrength(password: string): { level: number; color: string; label: string } {
  if (!password) return { level: 0, color: '#E5E7EB', label: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  if (score <= 1) return { level: 1, color: STRENGTH_RED, label: 'Yếu' };
  if (score <= 2) return { level: 2, color: STRENGTH_ORANGE, label: 'Trung bình' };
  if (score <= 3) return { level: 3, color: STRENGTH_YELLOW, label: 'Khá' };
  return { level: 4, color: STRENGTH_GREEN, label: 'Mạnh' };
}

function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 4,
              background: level <= strength.level ? strength.color : '#E5E7EB',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: strength.color }}>{strength.label}</span>
        {strength.level < 4 && (
          <span style={{ fontSize: 11, color: FPT_GRAY }}>
            Cần: {validateBR04(password).hints.join(', ')}
          </span>
        )}
      </div>
    </div>
  );
}

const renderPasswordIcon = (visible: boolean) =>
  visible ? <Eye size={16} color={FPT_GRAY} /> : <EyeOff size={16} color={FPT_GRAY} />;

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const onFinish = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const { valid } = validateBR04(values.newPassword);
    if (!valid) {
      message.error('Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt!');
      return;
    }

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
        alignItems: 'center',
        justifyContent: 'center',
        background: `url(${bgAuth}) center/cover no-repeat, #FFF5EC`,
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          maxWidth: 900,
          width: '100%',
          borderRadius: 24,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.04)',
          background: FPT_WHITE,
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
            minHeight: 560,
          }}
        >
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
            <Lock size={40} color={FPT_WHITE} strokeWidth={1.5} />
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
            Bảo mật tài khoản
          </h2>
          <p
            style={{
              color: `${FPT_WHITE}CC`,
              fontSize: 15,
              textAlign: 'center',
              lineHeight: 1.7,
            }}
          >
            Đặt mật khẩu mạnh để bảo vệ tài khoản của bạn. Mật khẩu phải có ít nhất 8 ký tự gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
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

          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 32,
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
              fontSize: 26,
              fontWeight: 800,
              color: FPT_DARK,
              marginBottom: 6,
              lineHeight: 1.2,
            }}
          >
            Đổi mật khẩu
          </h1>
          <p
            style={{
              color: '#DC2626',
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 28,
              lineHeight: 1.5,
            }}
          >
            Bạn cần đổi mật khẩu trước khi tiếp tục sử dụng hệ thống.
          </p>

          <Form onFinish={onFinish}>
            {/* Old Password */}
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: 'block',
                  color: FPT_DARK,
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 8,
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
                  placeholder="Nhập mật khẩu hiện tại"
                  size="large"
                  visibilityToggle={{ visible: showOld, onVisibleChange: setShowOld }}
                  iconRender={renderPasswordIcon}
                  prefix={<Lock size={16} color={FPT_GRAY} style={{ marginRight: 8 }} />}
                  style={{
                    borderRadius: 12,
                    border: '1.5px solid #E5E7EB',
                    fontSize: 15,
                    height: 48,
                  }}
                />
              </Form.Item>
            </div>

            {/* New Password */}
            <div style={{ marginBottom: 6 }}>
              <label
                style={{
                  display: 'block',
                  color: FPT_DARK,
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 8,
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
                  placeholder="Ít nhất 8 ký tự (A-Z, a-z, 0-9, !@#...)"
                  size="large"
                  visibilityToggle={{ visible: showNew, onVisibleChange: setShowNew }}
                  iconRender={renderPasswordIcon}
                  prefix={<Lock size={16} color={FPT_GRAY} style={{ marginRight: 8 }} />}
                  suffix={
                    newPassword.length >= 8 ? (
                      <span style={{ fontSize: 12, color: STRENGTH_GREEN, fontWeight: 600 }}>Hợp lệ</span>
                    ) : null
                  }
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    borderRadius: 12,
                    border: '1.5px solid #E5E7EB',
                    fontSize: 15,
                    height: 48,
                  }}
                />
              </Form.Item>
              <PasswordStrengthMeter password={newPassword} />
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 28, marginTop: 18 }}>
              <label
                style={{
                  display: 'block',
                  color: FPT_DARK,
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Xác nhận mật khẩu mới
              </label>
              <Form.Item
                name="confirmPassword"
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
                style={{ margin: 0 }}
              >
                <Input.Password
                  placeholder="Nhập lại mật khẩu mới"
                  size="large"
                  visibilityToggle={{ visible: showConfirm, onVisibleChange: setShowConfirm }}
                  iconRender={renderPasswordIcon}
                  prefix={<Lock size={16} color={FPT_GRAY} style={{ marginRight: 8 }} />}
                  style={{
                    borderRadius: 12,
                    border: '1.5px solid #E5E7EB',
                    fontSize: 15,
                    height: 48,
                  }}
                />
              </Form.Item>
            </div>

            {/* Submit */}
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
                Xác nhận đổi mật khẩu
              </Button>
            </Form.Item>
          </Form>

          <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: FPT_GRAY,
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: 0,
              }}
            >
              <ArrowLeft size={15} />
              Quay lại
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#EF4444',
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: 0,
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
