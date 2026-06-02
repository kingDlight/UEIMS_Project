import bgRegis from '@/assets/bg-regis.png';
import registerIllustration from '@/assets/register_illustration.png';
import logoUeims from '@/assets/logo_ueims.png';
import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Building2, Briefcase, Users, BarChart2, GraduationCap, Smile, UserPlus, FileText, User, Mail, MapPin, Lock, ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '@/services/AuthService';

const PRIMARY = '#E96500';
const PRIMARY_LIGHT = '#FFF2E8';
const TEXT_DARK = '#1E293B';
const TEXT_GRAY = '#64748B';
const WHITE = '#FFFFFF';
const BORDER = '#E2E8F0';
const DANGER = '#EF4444';

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
  if (score <= 2) return { level: 2, color: '#F97316', label: 'Trung bình' };
  if (score <= 3) return { level: 3, color: '#EAB308', label: 'Khá' };
  return { level: 4, color: '#22C55E', label: 'Mạnh' };
}

function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const { hints } = validateBR04(password);
  if (!password) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, marginTop: -6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_DARK }}>Độ mạnh mật khẩu:</span>
      <span style={{ color: strength.color, fontWeight: 700, fontSize: 12 }}>{strength.label}</span>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            style={{
              width: 30,
              height: 4,
              borderRadius: 2,
              background: level <= strength.level + 1 && strength.level > 0 ? strength.color : BORDER,
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      {strength.level < 4 && (
        <span style={{ fontSize: 10, color: TEXT_GRAY, marginLeft: 8 }}>{hints[0]}</span>
      )}
    </div>
  );
}

export const RegisterEnterprisePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  const onFinish = async (values: any) => {
    if (values.password !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    const { valid } = validateBR04(values.password);
    if (!valid) {
      message.error('Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra lại!');
      return;
    }
    setLoading(true);
    try {
      await AuthService.registerEnterprise({
        enterpriseName: values.enterpriseName,
        taxCode: values.taxCode,
        contactPerson: values.contactPerson,
        email: values.email,
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: `url(${bgRegis}) center/cover no-repeat, linear-gradient(135deg, #FFF9F5 0%, #FFE9D9 100%)`,
        padding: '40px 20px',
        position: 'relative',
        overflowX: 'hidden',
        fontFamily: "'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1080,
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
            padding: '24px 32px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            borderRight: '1px solid rgba(233, 101, 0, 0.05)',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <img src={logoUeims} alt="UEIMS Logo" style={{ height: 44, objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ fontSize: 16, fontWeight: 800, color: PRIMARY, margin: 0, lineHeight: 1.1, letterSpacing: 0.5 }}>UEIMS</h1>
              <p style={{ fontSize: 7, color: TEXT_DARK, textTransform: 'uppercase', fontWeight: 700, margin: '2px 0 0 0' }}>Hệ thống quản lý thực tập sinh<br />và doanh nghiệp</p>
            </div>
          </div>

          <h2 style={{ fontSize: 32, fontWeight: 800, color: TEXT_DARK, lineHeight: 1.3, margin: '0 0 12px 0' }}>
            Kết nối doanh nghiệp<br />với <span style={{ color: PRIMARY }}>sinh viên<br />tài năng</span>
          </h2>
          <p style={{ fontSize: 14, color: TEXT_GRAY, lineHeight: 1.6, margin: '0 0 40px 0', maxWidth: '90%' }}>
            Đăng ký tài khoản nhà tuyển dụng để tiếp cận nguồn nhân lực chất lượng và quản lý tuyển dụng hiệu quả trên UEIMS.
          </p>

          <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, zIndex: 2, width: '50%', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: WHITE, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY, boxShadow: '0 4px 12px rgba(233, 101, 0, 0.1)', flexShrink: 0 }}>
                  <Briefcase size={20} fill={PRIMARY} color={PRIMARY} />
                </div>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK, margin: '0 0 4px 0' }}>Đăng tuyển dễ dàng</h4>
                  <p style={{ fontSize: 11, color: TEXT_GRAY, lineHeight: 1.5, margin: 0 }}>Tạo và quản lý tin tuyển dụng chỉ trong vài phút.</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: WHITE, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY, boxShadow: '0 4px 12px rgba(233, 101, 0, 0.1)', flexShrink: 0 }}>
                  <Users size={20} fill={PRIMARY} color={PRIMARY} />
                </div>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK, margin: '0 0 4px 0' }}>Quản lý ứng viên hiệu quả</h4>
                  <p style={{ fontSize: 11, color: TEXT_GRAY, lineHeight: 1.5, margin: 0 }}>Theo dõi, đánh giá và lựa chọn ứng viên phù hợp.</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: WHITE, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY, boxShadow: '0 4px 12px rgba(233, 101, 0, 0.1)', flexShrink: 0 }}>
                  <BarChart2 size={20} fill={PRIMARY} color={PRIMARY} />
                </div>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK, margin: '0 0 4px 0' }}>Báo cáo & thống kê</h4>
                  <p style={{ fontSize: 11, color: TEXT_GRAY, lineHeight: 1.5, margin: 0 }}>Thống kê chi tiết giúp tối ưu quy trình tuyển dụng.</p>
                </div>
              </div>
            </div>
            <img src={registerIllustration} alt="Illustration" style={{ position: 'absolute', right: -20, bottom: -10, width: 200, height: 200, objectFit: 'contain', zIndex: 1 }} />
          </div>

          <div style={{ marginTop: 'auto', background: PRIMARY, borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', color: WHITE, zIndex: 2, boxShadow: '0 10px 25px rgba(233, 101, 0, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Building2 size={24} color={WHITE} opacity={0.9} />
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 2px 0' }}>500+</h3>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3, margin: 0 }}>Doanh nghiệp<br />đối tác</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <GraduationCap size={24} color={WHITE} opacity={0.9} />
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 2px 0' }}>3000+</h3>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3, margin: 0 }}>Sinh viên<br />đang hoạt động</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Smile size={24} color={WHITE} opacity={0.9} />
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 2px 0' }}>95%</h3>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3, margin: 0 }}>Tỷ lệ hài lòng<br />của doanh nghiệp</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ width: '55%', padding: '24px 36px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 40, height: 40, background: PRIMARY, color: WHITE, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <UserPlus size={20} />
              </div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: TEXT_DARK, margin: '0 0 6px 0' }}>Đăng ký tài khoản nhà tuyển dụng</h1>
                <p style={{ fontSize: 12, color: TEXT_GRAY, lineHeight: 1.5, margin: 0 }}>Điền đầy đủ thông tin bên dưới. Tài khoản sẽ được Training Manager<br />phê duyệt trước khi kích hoạt.</p>
              </div>
            </div>
          </div>

          <Form onFinish={onFinish} layout="vertical" requiredMark={false} style={{ width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px', marginBottom: 20 }}>
              
              <Form.Item
                name="enterpriseName"
                label={<span style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK }}>Tên doanh nghiệp <span style={{ color: DANGER }}>*</span></span>}
                rules={[{ required: true, message: 'Vui lòng nhập tên doanh nghiệp!' }]}
                style={{ gridColumn: 'span 2', marginBottom: 14 }}
              >
                <Input
                  placeholder="Nhập tên doanh nghiệp"
                  prefix={<Building2 size={18} color="#94A3B8" style={{ marginRight: 8 }} />}
                  style={{ borderRadius: 8, border: `1px solid ${BORDER}`, padding: '8px 14px', fontSize: 14 }}
                />
              </Form.Item>
              
              <Form.Item
                name="taxCode"
                label={<span style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK }}>Mã số thuế <span style={{ color: DANGER }}>*</span></span>}
                rules={[{ required: true, message: 'Vui lòng nhập mã số thuế!' }]}
                style={{ marginBottom: 14 }}
              >
                <Input
                  placeholder="Nhập mã số thuế"
                  prefix={<FileText size={18} color="#94A3B8" style={{ marginRight: 8 }} />}
                  style={{ borderRadius: 8, border: `1px solid ${BORDER}`, padding: '8px 14px', fontSize: 14 }}
                />
              </Form.Item>

              <Form.Item
                name="contactPerson"
                label={<span style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK }}>Người đại diện <span style={{ color: DANGER }}>*</span></span>}
                rules={[{ required: true, message: 'Vui lòng nhập tên người đại diện!' }]}
                style={{ marginBottom: 14 }}
              >
                <Input
                  placeholder="Nhập họ và tên người đại diện"
                  prefix={<User size={18} color="#94A3B8" style={{ marginRight: 8 }} />}
                  style={{ borderRadius: 8, border: `1px solid ${BORDER}`, padding: '8px 14px', fontSize: 14 }}
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={<span style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK }}>Email <span style={{ color: DANGER }}>*</span></span>}
                rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
                style={{ gridColumn: 'span 2', marginBottom: 14 }}
              >
                <Input
                  placeholder="example@company.com"
                  prefix={<Mail size={18} color="#94A3B8" style={{ marginRight: 8 }} />}
                  style={{ borderRadius: 8, border: `1px solid ${BORDER}`, padding: '8px 14px', fontSize: 14 }}
                />
              </Form.Item>

              <Form.Item
                name="address"
                label={<span style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK }}>Địa chỉ trụ sở <span style={{ color: DANGER }}>*</span></span>}
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ trụ sở công ty!' }]}
                style={{ gridColumn: 'span 2', marginBottom: 14 }}
              >
                <Input
                  placeholder="Nhập địa chỉ trụ sở công ty"
                  prefix={<MapPin size={18} color="#94A3B8" style={{ marginRight: 8 }} />}
                  style={{ borderRadius: 8, border: `1px solid ${BORDER}`, padding: '8px 14px', fontSize: 14 }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK }}>Mật khẩu <span style={{ color: DANGER }}>*</span></span>}
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                style={{ marginBottom: 14 }}
              >
                <Input.Password
                  placeholder="Nhập mật khẩu"
                  prefix={<Lock size={18} color="#94A3B8" style={{ marginRight: 8 }} />}
                  iconRender={(visible) => visible ? <Eye size={18} color="#94A3B8" /> : <EyeOff size={18} color="#94A3B8" />}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ borderRadius: 8, border: `1px solid ${BORDER}`, padding: '8px 14px', fontSize: 14 }}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label={<span style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK }}>Xác nhận mật khẩu <span style={{ color: DANGER }}>*</span></span>}
                rules={[{ required: true, message: 'Vui lòng nhập lại mật khẩu!' }]}
                style={{ marginBottom: 14 }}
              >
                <Input.Password
                  placeholder="Nhập lại mật khẩu"
                  prefix={<Lock size={18} color="#94A3B8" style={{ marginRight: 8 }} />}
                  iconRender={(visible) => visible ? <Eye size={18} color="#94A3B8" /> : <EyeOff size={18} color="#94A3B8" />}
                  style={{ borderRadius: 8, border: `1px solid ${BORDER}`, padding: '8px 14px', fontSize: 14 }}
                />
              </Form.Item>
            </div>

            <PasswordStrengthMeter password={password} />

            <div style={{ background: PRIMARY_LIGHT, borderRadius: 8, padding: 16, display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
              <div style={{ width: 24, height: 24, background: PRIMARY, color: WHITE, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <ShieldCheck size={14} fill={WHITE} color={PRIMARY} />
              </div>
              <div>
                <strong style={{ display: 'block', color: TEXT_DARK, fontSize: 13, margin: '0 0 4px 0' }}>Thông tin của bạn được bảo mật tuyệt đối</strong>
                <p style={{ color: TEXT_GRAY, fontSize: 12, lineHeight: 1.5, margin: 0 }}>UEIMS cam kết bảo vệ thông tin doanh nghiệp của bạn<br />theo chính sách bảo mật.</p>
              </div>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 48, background: PRIMARY, color: WHITE, border: 'none', borderRadius: 8,
                fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              <UserPlus size={18} />
              Đăng ký tài khoản
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
            Quay lại đăng nhập
          </button>

        </div>
      </div>
    </div>
  );
};
