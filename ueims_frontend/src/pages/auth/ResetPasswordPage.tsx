import logoUeims from '@/assets/logo_ueims.png';
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';
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
  const { hints } = validateBR04(password);
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
            Cần: {hints.join(', ')}
          </span>
        )}
      </div>
    </div>
  );
}

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (!t) {
      message.error('Link khôi phục không hợp lệ hoặc đã hết hạn.');
    }
    setToken(t);
  }, [searchParams]);

  const onFinish = async (values: { newPassword: string; confirmPassword: string }) => {
    if (!token) {
      message.error('Token không hợp lệ. Vui lòng yêu cầu gửi lại link khôi phục.');
      return;
    }

    const { valid } = validateBR04(values.newPassword);
    if (!valid) {
      message.error('Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt!');
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      await AuthService.resetPassword({
        token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      message.success('Đặt lại mật khẩu thành công!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error: any) {
      const msg = error.response?.data?.message;
      message.error(msg || 'Đặt lại mật khẩu thất bại. Link có thể đã hết hạn.');
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
          minHeight: 560,
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
            Đặt mật khẩu mới
          </h2>
          <p
            style={{
              color: `${FPT_WHITE}CC`,
              fontSize: 15,
              textAlign: 'center',
              lineHeight: 1.7,
            }}
          >
            Tạo mật khẩu mới an toàn cho tài khoản của bạn. Mật khẩu phải có ít nhất 8 ký tự gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
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
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: FPT_ORANGE,
              }}
            />
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
            Đặt lại mật khẩu
          </h1>
          <p
            style={{
              color: FPT_GRAY,
              fontSize: 15,
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Nhập mật khẩu mới cho tài khoản của bạn.
          </p>

          <Form onFinish={onFinish}>
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
                  visibilityToggle={{
                    visible: showPassword,
                    onVisibleChange: setShowPassword,
                  }}
                  iconRender={(visible) =>
                    visible ? <Eye size={16} color={FPT_GRAY} /> : <EyeOff size={16} color={FPT_GRAY} />
                  }
                  prefix={<Lock size={16} color={FPT_GRAY} style={{ marginRight: 8 }} />}
                  style={{
                    borderRadius: 12,
                    border: '1.5px solid #E5E7EB',
                    fontSize: 15,
                    height: 48,
                  }}
                />
              </Form.Item>
              <div onChange={(e: any) => setPassword(e.target.value)}>
                {/* Hidden trigger to sync password state — actual input is controlled by Form */}
              </div>
              <PasswordStrengthMeter password={password} />
            </div>

            {/* Hidden field to track password for strength meter */}
            <input
              type="password"
              style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
            />

            {/* Confirm Password */}
            <div style={{ marginBottom: 32 }}>
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
                  placeholder="Nhập lại mật khẩu"
                  size="large"
                  visibilityToggle={{
                    visible: showConfirm,
                    onVisibleChange: setShowConfirm,
                  }}
                  iconRender={(visible) =>
                    visible ? <Eye size={16} color={FPT_GRAY} /> : <EyeOff size={16} color={FPT_GRAY} />
                  }
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

            <Form.Item style={{ margin: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                disabled={!token}
                style={{
                  height: 52,
                  borderRadius: 14,
                  fontSize: 16,
                  fontWeight: 700,
                  background: !token
                    ? '#D1D5DB'
                    : `linear-gradient(135deg, ${FPT_ORANGE}, ${FPT_ORANGE_DARK})`,
                  border: 'none',
                  boxShadow: !token ? 'none' : `0 8px 20px ${FPT_ORANGE}40`,
                  letterSpacing: '0.02em',
                }}
              >
                Đặt lại mật khẩu
              </Button>
            </Form.Item>
          </Form>

          <button
            onClick={() => navigate('/login')}
            style={{
              marginTop: 24,
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
