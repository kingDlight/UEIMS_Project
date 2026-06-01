import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
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
    <div style={{ marginTop: 4 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 3 }}>
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 3,
              background: level <= strength.level ? strength.color : '#E5E7EB',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: strength.color }}>{strength.label}</span>
        {strength.level < 4 && (
          <span style={{ fontSize: 10, color: FPT_GRAY }}>{hints.join(', ')}</span>
        )}
      </div>
    </div>
  );
}

const LABEL: React.CSSProperties = {
  display: 'block', color: FPT_DARK, fontSize: 12, fontWeight: 600, marginBottom: 4,
};

const INPUT: React.CSSProperties = {
  borderRadius: 8, fontSize: 13, height: 38,
};

export const RegisterEnterprisePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState('');

  const onFinish = async (values: {
    enterpriseName: string;
    taxCode: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    const { valid } = validateBR04(values.password);
    if (!valid) {
      message.error('Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt!');
      return;
    }
    setLoading(true);
    try {
      await AuthService.registerEnterprise({
        enterpriseName: values.enterpriseName,
        taxCode: values.taxCode,
        contactPerson: values.contactPerson,
        email: values.email,
        phone: values.phone,
        address: values.address,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      message.success('Đăng ký thành công! Vui lòng đợi Training Manager phê duyệt.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      const msg = error.response?.data?.message;
      const code = error.response?.data?.code;
      if (code === 1035) {
        message.error('Mã số thuế đã được sử dụng bởi doanh nghiệp khác.');
      } else if (code === 1002) {
        message.error('Email đã được sử dụng trong hệ thống.');
      } else if (msg) {
        message.error(msg);
      } else {
        message.error('Đăng ký thất bại. Vui lòng thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'stretch', background: '#FAFAFA', padding: '20px', position: 'relative', overflow: 'hidden' }}>
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

      <div style={{
        display: 'flex', flexDirection: 'row', maxWidth: 920, width: '100%', margin: '0 auto',
        borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
        background: FPT_WHITE,
        position: 'relative', zIndex: 1,
      }}>
        {/* LEFT — Illustration */}
        <div style={{
          width: '38%', background: `linear-gradient(145deg, ${FPT_ORANGE}, ${FPT_ORANGE_DARK})`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '40px 28px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: `${FPT_WHITE}15` }} />
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: `${FPT_WHITE}10` }} />

          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: `${FPT_WHITE}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          }}>
            <Building2 size={30} color={FPT_WHITE} strokeWidth={1.5} />
          </div>

          <h2 style={{ color: FPT_WHITE, fontSize: 20, fontWeight: 700, marginBottom: 10, textAlign: 'center', lineHeight: 1.3 }}>
            Trở thành đối tác
          </h2>
          <p style={{ color: `${FPT_WHITE}CC`, fontSize: 12, textAlign: 'center', lineHeight: 1.6 }}>
            Đăng ký tài khoản nhà tuyển dụng để đăng tin tuyển dụng thực tập sinh.
          </p>
        </div>

        {/* RIGHT — Form */}
        <div style={{
          flex: 1, padding: '28px 32px', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', overflowY: 'auto', position: 'relative', overflow: 'hidden',
        }}>
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

          {/* Logo + Back */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: FPT_ORANGE }} />
            <span style={{ color: FPT_ORANGE, fontSize: 14, fontWeight: 700, letterSpacing: '0.05em' }}>UEIMS</span>
          </div>

          <h1 style={{ fontSize: 20, fontWeight: 800, color: FPT_DARK, marginBottom: 4, lineHeight: 1.2 }}>
            Đăng ký tài khoản nhà tuyển dụng
          </h1>
          <p style={{ color: FPT_GRAY, fontSize: 12, marginBottom: 20, lineHeight: 1.5 }}>
            Điền đầy đủ thông tin bên dưới. Tài khoản sẽ được Training Manager phê duyệt trước khi kích hoạt.
          </p>

          <Form onFinish={onFinish}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              {/* Enterprise Name — full width */}
              <div style={{ gridColumn: '1 / -1', marginBottom: 10 }}>
                <label style={LABEL}>Tên doanh nghiệp <span style={{ color: '#EF4444' }}>*</span></label>
                <Form.Item name="enterpriseName" rules={[{ required: true, message: 'Vui lòng nhập tên doanh nghiệp!' }]} style={{ margin: 0 }}>
                  <Input placeholder="Công ty TNHH ABC" size="middle" prefix={<Building2 size={13} color={FPT_GRAY} style={{ marginRight: 6 }} />} style={INPUT} />
                </Form.Item>
              </div>

              {/* Tax Code */}
              <div style={{ marginBottom: 10 }}>
                <label style={LABEL}>Mã số thuế <span style={{ color: '#EF4444' }}>*</span></label>
                <Form.Item name="taxCode" rules={[{ required: true, message: 'Vui lòng nhập mã số thuế!' }]} style={{ margin: 0 }}>
                  <Input placeholder="0123456789" size="middle" style={INPUT} />
                </Form.Item>
              </div>

              {/* Contact Person */}
              <div style={{ marginBottom: 10 }}>
                <label style={LABEL}>Người đại diện <span style={{ color: '#EF4444' }}>*</span></label>
                <Form.Item name="contactPerson" rules={[{ required: true, message: 'Vui lòng nhập tên người đại diện!' }]} style={{ margin: 0 }}>
                  <Input placeholder="Nguyễn Văn A" size="middle" prefix={<User size={13} color={FPT_GRAY} style={{ marginRight: 6 }} />} style={INPUT} />
                </Form.Item>
              </div>

              {/* Email */}
              <div style={{ marginBottom: 10 }}>
                <label style={LABEL}>Email <span style={{ color: '#EF4444' }}>*</span></label>
                <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]} style={{ margin: 0 }}>
                  <Input placeholder="contact@company.com" size="middle" prefix={<Mail size={13} color={FPT_GRAY} style={{ marginRight: 6 }} />} style={INPUT} />
                </Form.Item>
              </div>

              {/* Phone */}
              <div style={{ marginBottom: 10 }}>
                <label style={LABEL}>Số điện thoại <span style={{ color: '#EF4444' }}>*</span></label>
                <Form.Item name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]} style={{ margin: 0 }}>
                  <Input placeholder="0912 345 678" size="middle" prefix={<Phone size={13} color={FPT_GRAY} style={{ marginRight: 6 }} />} style={INPUT} />
                </Form.Item>
              </div>

              {/* Address — full width */}
              <div style={{ gridColumn: '1 / -1', marginBottom: 10 }}>
                <label style={LABEL}>Địa chỉ trụ sở <span style={{ color: '#EF4444' }}>*</span></label>
                <Form.Item name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]} style={{ margin: 0 }}>
                  <Input placeholder="123 Đường ABC, Quận XYZ, TP. HCM" size="middle" prefix={<MapPin size={13} color={FPT_GRAY} style={{ marginRight: 6 }} />} style={INPUT} />
                </Form.Item>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 4 }}>
                <label style={LABEL}>Mật khẩu <span style={{ color: '#EF4444' }}>*</span></label>
                <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }, { min: 8, message: 'Ít nhất 8 ký tự!' }]} style={{ margin: 0 }}>
                  <Input.Password
                    placeholder="A-Z, a-z, 0-9, !@#$..."
                    size="middle"
                    visibilityToggle={{ visible: showPassword, onVisibleChange: setShowPassword }}
                    iconRender={(visible) => visible ? <Eye size={13} color={FPT_GRAY} /> : <EyeOff size={13} color={FPT_GRAY} />}
                    onChange={(e) => setPassword(e.target.value)}
                    style={INPUT}
                  />
                </Form.Item>
                <PasswordStrengthMeter password={password} />
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: 16 }}>
                <label style={LABEL}>Xác nhận mật khẩu <span style={{ color: '#EF4444' }}>*</span></label>
                <Form.Item name="confirmPassword" rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu!' }]} style={{ margin: 0 }}>
                  <Input.Password
                    placeholder="Nhập lại mật khẩu"
                    size="middle"
                    visibilityToggle={{ visible: showConfirm, onVisibleChange: setShowConfirm }}
                    iconRender={(visible) => visible ? <Eye size={13} color={FPT_GRAY} /> : <EyeOff size={13} color={FPT_GRAY} />}
                    style={INPUT}
                  />
                </Form.Item>
              </div>
            </div>

            <Form.Item style={{ margin: 0 }}>
              <Button
                type="primary" htmlType="submit" loading={loading} block size="middle"
                style={{
                  height: 42, borderRadius: 10, fontSize: 14, fontWeight: 700,
                  background: `linear-gradient(135deg, ${FPT_ORANGE}, ${FPT_ORANGE_DARK})`,
                  border: 'none', boxShadow: `0 4px 12px ${FPT_ORANGE}40`,
                }}
              >
                Đăng ký tài khoản
              </Button>
            </Form.Item>
          </Form>

          <button
            onClick={() => navigate('/login')}
            style={{
              marginTop: 14, background: 'none', border: 'none', cursor: 'pointer',
              color: FPT_GRAY, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, padding: 0,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = FPT_ORANGE; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = FPT_GRAY; }}
          >
            <ArrowLeft size={12} /> Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};
