import bgAuth from '@/assets/bg-auth.png';
import authShield3d from '@/assets/auth_shield_3d.png';
import logoUeims from '@/assets/logo_ueims.png';
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '@/services/AuthService';

const PRIMARY = '#E96500';
const WHITE = '#FFFFFF';
const TEXT_DARK = '#1E293B';
const TEXT_GRAY = '#64748B';
const BORDER = '#E2E8F0';
const DANGER = '#EF4444';
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
  if (!password) return { level: 0, color: BORDER, label: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  if (score <= 1) return { level: 1, color: DANGER, label: 'Yếu' };
  if (score <= 2) return { level: 2, color: STRENGTH_ORANGE, label: 'Trung bình' };
  if (score <= 3) return { level: 3, color: STRENGTH_YELLOW, label: 'Khá' };
  return { level: 4, color: STRENGTH_GREEN, label: 'Mạnh' };
}

function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const { hints } = validateBR04(password);
  if (!password) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 4,
              background: level <= strength.level + 1 && strength.level > 0 ? strength.color : BORDER,
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: strength.color }}>Độ mạnh: {strength.label}</span>
        {strength.level < 4 && (
          <span style={{ fontSize: 11, color: TEXT_GRAY }}>
            Cần: {hints[0]}
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
      message.error('Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra lại!');
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
        background: `url(${bgAuth}) center/cover no-repeat, #FFF2E8`,
        padding: '40px 20px',
        position: 'relative',
        overflowX: 'hidden',
        fontFamily: "'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          background: WHITE,
          borderRadius: 20,
          boxShadow: '0 30px 60px rgba(233, 101, 0, 0.15)',
          display: 'flex',
          margin: 'auto',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* LEFT PANEL */}
        <div
          style={{
            width: '45%',
            background: 'linear-gradient(180deg, #FFFDFB 0%, #FFF2E8 100%)',
            padding: '40px 32px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            borderRight: '1px solid rgba(233, 101, 0, 0.05)',
          }}
        >
          {/* Main Title Left */}
          <h2 style={{ fontSize: 24, fontWeight: 800, color: TEXT_DARK, lineHeight: 1.3, margin: '20px 0 12px 0' }}>
            Khôi phục<br />
            <span style={{ color: PRIMARY }}>mật khẩu mới</span>
          </h2>
          <p style={{ fontSize: 13, color: TEXT_GRAY, lineHeight: 1.6, margin: '0 0 40px 0', maxWidth: '95%' }}>
            Tạo mật khẩu mới an toàn cho tài khoản của bạn. Đảm bảo mật khẩu đáp ứng đủ độ mạnh để bảo vệ dữ liệu.
          </p>

          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <img src={authShield3d} alt="Shield 3D" style={{ width: '80%', maxWidth: 280, objectFit: 'contain', zIndex: 1, dropShadow: '0 20px 30px rgba(233, 101, 0, 0.2)' }} />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ width: '55%', padding: '48px 40px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <img src={logoUeims} alt="UEIMS Logo" style={{ height: 40, objectFit: 'contain' }} />
            <h1 style={{ fontSize: 16, fontWeight: 800, color: PRIMARY, margin: 0, letterSpacing: 0.5 }}>UEIMS</h1>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, color: TEXT_DARK, margin: '0 0 8px 0' }}>Đặt lại mật khẩu</h1>
          <p style={{ fontSize: 13, color: TEXT_GRAY, lineHeight: 1.5, margin: '0 0 32px 0' }}>
            Vui lòng nhập mật khẩu mới bên dưới.
          </p>

          <Form onFinish={onFinish} layout="vertical" requiredMark={false} style={{ width: '100%' }}>
            
            <Form.Item
              name="newPassword"
              label={<span style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK }}>Mật khẩu mới <span style={{ color: DANGER }}>*</span></span>}
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
              style={{ marginBottom: 12 }}
            >
              <Input.Password
                placeholder="A-Z, a-z, 0-9, !@#..."
                size="large"
                prefix={<Lock size={18} color="#94A3B8" style={{ marginRight: 8 }} />}
                visibilityToggle={{ visible: showPassword, onVisibleChange: setShowPassword }}
                iconRender={(visible) => visible ? <Eye size={18} color="#94A3B8" /> : <EyeOff size={18} color="#94A3B8" />}
                onChange={(e) => setPassword(e.target.value)}
                style={{ borderRadius: 8, border: `1px solid ${BORDER}`, padding: '10px 14px', fontSize: 14 }}
              />
            </Form.Item>

            <PasswordStrengthMeter password={password} />

            <Form.Item
              name="confirmPassword"
              label={<span style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK }}>Xác nhận mật khẩu mới <span style={{ color: DANGER }}>*</span></span>}
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
              style={{ marginTop: 20, marginBottom: 32 }}
            >
              <Input.Password
                placeholder="Nhập lại mật khẩu mới"
                size="large"
                prefix={<Lock size={18} color="#94A3B8" style={{ marginRight: 8 }} />}
                visibilityToggle={{ visible: showConfirm, onVisibleChange: setShowConfirm }}
                iconRender={(visible) => visible ? <Eye size={18} color="#94A3B8" /> : <EyeOff size={18} color="#94A3B8" />}
                style={{ borderRadius: 8, border: `1px solid ${BORDER}`, padding: '10px 14px', fontSize: 14 }}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!token}
              block
              style={{
                height: 48, background: PRIMARY, color: WHITE, border: 'none', borderRadius: 8,
                fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                opacity: !token ? 0.6 : 1,
              }}
            >
              Lưu mật khẩu mới
            </Button>
          </Form>

          <button
            onClick={() => navigate('/login')}
            style={{
              marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 6, color: TEXT_GRAY,
              fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = PRIMARY; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = TEXT_GRAY; }}
          >
            <ArrowLeft size={16} />
            Quay lại trang đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};
