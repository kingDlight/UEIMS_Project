import bgRegis from '@/assets/bg-regis.png';
import registerIllustration from '@/assets/register_illustration.png';
import { LogoIcon } from '@/components/LogoIcon';
import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, Briefcase, Users, BarChart2, GraduationCap, Smile, UserPlus, FileText, User, Mail, MapPin, Lock, ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '@/services/AuthService';
import {
  AUTH_PRIMARY,
  AUTH_PRIMARY_LIGHT,
  AUTH_WHITE,
  AUTH_TEXT_DARK,
  AUTH_TEXT_GRAY,
  AUTH_BORDER,
  AUTH_DANGER,
  AUTH_SHADOW,
  AUTH_BORDER_RADIUS,
  AUTH_FONT,
  PasswordStrengthMeter,
} from '@/theme/authTheme';

const renderPasswordIcon = (visible: boolean) => visible ? <Eye size={12} color="#94A3B8" /> : <EyeOff size={12} color="#94A3B8" />;

export const RegisterEnterprisePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  const onFinish = async (values: any) => {
    if (values.password !== values.confirmPassword) {
      message.error(t('auth.registerEnterprise.passwordMismatch'));
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
      message.success(t('auth.registerEnterprise.registerSuccess'));
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      const msg = error.response?.data?.message;
      const code = error.response?.data?.code;
      if (code === 1035) {
        message.error(t('auth.registerEnterprise.taxCodeUsed'));
      } else if (code === 1002) {
        message.error(t('auth.registerEnterprise.emailUsed'));
      } else if (msg) {
        message.error(msg);
      } else {
        message.error(t('auth.registerEnterprise.registerFail'));
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
        padding: '12px 16px',
        position: 'relative',
        overflowX: 'hidden',
        fontFamily: AUTH_FONT,
      }}
    >
      <div
        className="regis-card"
        style={{
          width: '100%',
          maxWidth: 780,
          background: AUTH_WHITE,
          borderRadius: AUTH_BORDER_RADIUS,
          boxShadow: AUTH_SHADOW,
          display: 'flex',
          margin: 'auto',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* LEFT PANEL */}
        <div
          className="regis-left-panel"
          style={{
            width: '42%',
            background: 'linear-gradient(180deg, #FFFDFB 0%, #FFF2E8 100%)',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            borderRight: '1px solid rgba(230, 126, 34, 0.05)',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <LogoIcon style={{ height: 30, width: 'auto' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ fontSize: 12, fontWeight: 800, color: AUTH_PRIMARY, margin: 0, lineHeight: 1.1, letterSpacing: 0.5 }}>UEIMS</h1>
              <p style={{ fontSize: 5, color: AUTH_TEXT_DARK, textTransform: 'uppercase', fontWeight: 700, margin: '1px 0 0 0' }}>{t('auth.registerEnterprise.systemName')}</p>
            </div>
          </div>

          <h2 style={{ fontSize: 16, fontWeight: 800, color: AUTH_TEXT_DARK, lineHeight: 1.3, margin: '0 0 6px 0' }}>
            {t('auth.registerEnterprise.connect')}<br /><span style={{ color: AUTH_PRIMARY }}>{t('auth.registerEnterprise.talents')}</span>
          </h2>
          <p style={{ fontSize: 10, color: AUTH_TEXT_GRAY, lineHeight: 1.4, margin: '0 0 10px 0', maxWidth: '90%' }}>
            {t('auth.registerEnterprise.desc')}
          </p>

          <div style={{ display: 'flex', flex: 1, position: 'relative', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, zIndex: 2, width: '55%', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <div style={{ width: 22, height: 22, background: AUTH_WHITE, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', color: AUTH_PRIMARY, boxShadow: '0 1px 4px rgba(230, 126, 34, 0.1)', flexShrink: 0 }}>
                  <Briefcase size={11} fill={AUTH_PRIMARY} color={AUTH_PRIMARY} />
                </div>
                <div>
                  <h4 style={{ fontSize: 10, fontWeight: 700, color: AUTH_TEXT_DARK, margin: '0 0 1px 0' }}>{t('auth.registerEnterprise.easyPost')}</h4>
                  <p style={{ fontSize: 8, color: AUTH_TEXT_GRAY, lineHeight: 1.3, margin: 0 }}>{t('auth.registerEnterprise.easyPostDesc')}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <div style={{ width: 22, height: 22, background: AUTH_WHITE, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', color: AUTH_PRIMARY, boxShadow: '0 1px 4px rgba(230, 126, 34, 0.1)', flexShrink: 0 }}>
                  <Users size={11} fill={AUTH_PRIMARY} color={AUTH_PRIMARY} />
                </div>
                <div>
                  <h4 style={{ fontSize: 10, fontWeight: 700, color: AUTH_TEXT_DARK, margin: '0 0 1px 0' }}>{t('auth.registerEnterprise.manageCandidates')}</h4>
                  <p style={{ fontSize: 8, color: AUTH_TEXT_GRAY, lineHeight: 1.3, margin: 0 }}>{t('auth.registerEnterprise.manageCandidatesDesc')}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <div style={{ width: 22, height: 22, background: AUTH_WHITE, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', color: AUTH_PRIMARY, boxShadow: '0 1px 4px rgba(230, 126, 34, 0.1)', flexShrink: 0 }}>
                  <BarChart2 size={11} fill={AUTH_PRIMARY} color={AUTH_PRIMARY} />
                </div>
                <div>
                  <h4 style={{ fontSize: 10, fontWeight: 700, color: AUTH_TEXT_DARK, margin: '0 0 1px 0' }}>{t('auth.registerEnterprise.reports')}</h4>
                  <p style={{ fontSize: 8, color: AUTH_TEXT_GRAY, lineHeight: 1.3, margin: 0 }}>{t('auth.registerEnterprise.reportsDesc')}</p>
                </div>
              </div>
            </div>
            <img src={registerIllustration} alt="Illustration" style={{ position: 'absolute', right: -5, bottom: -3, width: 110, height: 110, objectFit: 'contain', zIndex: 1 }} />
          </div>

          <div style={{ marginTop: 'auto', background: AUTH_PRIMARY, borderRadius: 8, padding: 8, display: 'flex', justifyContent: 'space-between', color: AUTH_WHITE, zIndex: 2, boxShadow: '0 4px 12px rgba(230, 126, 34, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Building2 size={14} color={AUTH_WHITE} opacity={0.9} />
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 800, margin: '0 0 1px 0' }}>500+</h3>
                <p style={{ fontSize: 7, color: 'rgba(255,255,255,0.8)', lineHeight: 1.2, margin: 0 }}>{t('auth.registerEnterprise.partnerEnterprises')}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <GraduationCap size={14} color={AUTH_WHITE} opacity={0.9} />
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 800, margin: '0 0 1px 0' }}>3000+</h3>
                <p style={{ fontSize: 7, color: 'rgba(255,255,255,0.8)', lineHeight: 1.2, margin: 0 }}>{t('auth.registerEnterprise.activeStudents')}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Smile size={14} color={AUTH_WHITE} opacity={0.9} />
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 800, margin: '0 0 1px 0' }}>95%</h3>
                <p style={{ fontSize: 7, color: 'rgba(255,255,255,0.8)', lineHeight: 1.2, margin: 0 }}>{t('auth.registerEnterprise.satisfactionRate')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="regis-right-panel" style={{ width: '62%', padding: '10px 16px', display: 'flex', flexDirection: 'column', position: 'relative' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 28, height: 28, background: AUTH_PRIMARY, color: AUTH_WHITE, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <UserPlus size={14} />
              </div>
              <div>
                <h1 style={{ fontSize: 14, fontWeight: 800, color: AUTH_TEXT_DARK, margin: '0 0 2px 0' }}>{t('auth.registerEnterprise.registerAccount')}</h1>
                <p style={{ fontSize: 9, color: AUTH_TEXT_GRAY, lineHeight: 1.3, margin: 0 }}>{t('auth.registerEnterprise.fillInfo')}</p>
              </div>
            </div>
          </div>

          <Form onFinish={onFinish} layout="vertical" requiredMark={false} style={{ width: '100%' }}>
            <div className="regis-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 8px', marginBottom: 6 }}>

              <Form.Item
                name="enterpriseName"
                label={<span style={{ fontSize: 10, fontWeight: 700, color: AUTH_TEXT_DARK }}>{t('auth.registerEnterprise.enterpriseName')} <span style={{ color: AUTH_DANGER }}>*</span></span>}
                rules={[{ required: true, message: t('auth.registerEnterprise.enterpriseNameReq') }]}
                className="regis-span2"
                style={{ gridColumn: 'span 2', marginBottom: 6 }}
              >
                <Input
                  placeholder={t('auth.registerEnterprise.enterpriseNamePlaceholder')}
                  prefix={<Building2 size={12} color="#94A3B8" style={{ marginRight: 5 }} />}
                  style={{ borderRadius: 5, border: `1px solid ${AUTH_BORDER}`, padding: '5px 8px', fontSize: 11 }}
                />
              </Form.Item>

              <Form.Item
                name="taxCode"
                label={<span style={{ fontSize: 10, fontWeight: 700, color: AUTH_TEXT_DARK }}>{t('auth.registerEnterprise.taxCode')} <span style={{ color: AUTH_DANGER }}>*</span></span>}
                rules={[{ required: true, message: t('auth.registerEnterprise.taxCodeReq') }]}
                style={{ marginBottom: 6 }}
              >
                <Input
                  placeholder={t('auth.registerEnterprise.taxCodePlaceholder')}
                  prefix={<FileText size={12} color="#94A3B8" style={{ marginRight: 5 }} />}
                  style={{ borderRadius: 5, border: `1px solid ${AUTH_BORDER}`, padding: '5px 8px', fontSize: 11 }}
                />
              </Form.Item>

              <Form.Item
                name="contactPerson"
                label={<span style={{ fontSize: 10, fontWeight: 700, color: AUTH_TEXT_DARK }}>{t('auth.registerEnterprise.contactPerson')} <span style={{ color: AUTH_DANGER }}>*</span></span>}
                rules={[{ required: true, message: t('auth.registerEnterprise.contactPersonReq') }]}
                style={{ marginBottom: 6 }}
              >
                <Input
                  placeholder={t('auth.registerEnterprise.contactPersonPlaceholder')}
                  prefix={<User size={12} color="#94A3B8" style={{ marginRight: 5 }} />}
                  style={{ borderRadius: 5, border: `1px solid ${AUTH_BORDER}`, padding: '5px 8px', fontSize: 11 }}
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={<span style={{ fontSize: 10, fontWeight: 700, color: AUTH_TEXT_DARK }}>{t('auth.registerEnterprise.email')} <span style={{ color: AUTH_DANGER }}>*</span></span>}
                rules={[{ required: true, message: t('auth.registerEnterprise.emailReq') }, { type: 'email', message: t('auth.emailInvalid') }]}
                className="regis-span2"
                style={{ gridColumn: 'span 2', marginBottom: 6 }}
              >
                <Input
                  placeholder="example@company.com"
                  prefix={<Mail size={12} color="#94A3B8" style={{ marginRight: 5 }} />}
                  style={{ borderRadius: 5, border: `1px solid ${AUTH_BORDER}`, padding: '5px 8px', fontSize: 11 }}
                />
              </Form.Item>

              <Form.Item
                name="address"
                label={<span style={{ fontSize: 10, fontWeight: 700, color: AUTH_TEXT_DARK }}>{t('auth.registerEnterprise.address')} <span style={{ color: AUTH_DANGER }}>*</span></span>}
                rules={[{ required: true, message: t('auth.registerEnterprise.addressReq') }]}
                className="regis-span2"
                style={{ gridColumn: 'span 2', marginBottom: 6 }}
              >
                <Input
                  placeholder={t('auth.registerEnterprise.addressPlaceholder')}
                  prefix={<MapPin size={12} color="#94A3B8" style={{ marginRight: 5 }} />}
                  style={{ borderRadius: 5, border: `1px solid ${AUTH_BORDER}`, padding: '5px 8px', fontSize: 11 }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span style={{ fontSize: 10, fontWeight: 700, color: AUTH_TEXT_DARK }}>{t('auth.registerEnterprise.password')} <span style={{ color: AUTH_DANGER }}>*</span></span>}
                rules={[{ required: true, message: t('auth.registerEnterprise.passwordReq') }]}
                style={{ marginBottom: 6 }}
              >
                <Input.Password
                  placeholder={t('auth.registerEnterprise.passwordPlaceholder')}
                  prefix={<Lock size={12} color="#94A3B8" style={{ marginRight: 5 }} />}
                  iconRender={renderPasswordIcon}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ borderRadius: 5, border: `1px solid ${AUTH_BORDER}`, padding: '5px 8px', fontSize: 11 }}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label={<span style={{ fontSize: 10, fontWeight: 700, color: AUTH_TEXT_DARK }}>{t('auth.registerEnterprise.confirmPassword')} <span style={{ color: AUTH_DANGER }}>*</span></span>}
                rules={[{ required: true, message: t('auth.registerEnterprise.confirmPasswordReq') }]}
                style={{ marginBottom: 6 }}
              >
                <Input.Password
                  placeholder={t('auth.registerEnterprise.confirmPasswordPlaceholder')}
                  prefix={<Lock size={12} color="#94A3B8" style={{ marginRight: 5 }} />}
                  iconRender={renderPasswordIcon}
                  style={{ borderRadius: 5, border: `1px solid ${AUTH_BORDER}`, padding: '5px 8px', fontSize: 11 }}
                />
              </Form.Item>
            </div>

            <PasswordStrengthMeter password={password} />

            <div style={{ background: AUTH_PRIMARY_LIGHT, borderRadius: 5, padding: 8, display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ width: 18, height: 18, background: AUTH_PRIMARY, color: AUTH_WHITE, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <ShieldCheck size={10} fill={AUTH_WHITE} color={AUTH_PRIMARY} />
              </div>
              <div>
                <strong style={{ display: 'block', color: AUTH_TEXT_DARK, fontSize: 10, margin: '0 0 1px 0' }}>{t('auth.registerEnterprise.securedInfo')}</strong>
                <p style={{ color: AUTH_TEXT_GRAY, fontSize: 9, lineHeight: 1.3, margin: 0 }}>{t('auth.registerEnterprise.securedInfoDesc')}</p>
              </div>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 36,
                background: AUTH_PRIMARY,
                color: AUTH_WHITE,
                border: 'none',
                borderRadius: 5,
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <UserPlus size={14} />
              {t('auth.registerEnterprise.registerBtn')}
            </Button>
          </Form>

          <button
            onClick={() => navigate('/login')}
            style={{
              marginTop: 8,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              color: AUTH_TEXT_GRAY,
              fontSize: 11,
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = AUTH_PRIMARY; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = AUTH_TEXT_GRAY; }}
          >
            <ArrowLeft size={16} />
            {t('auth.registerEnterprise.backToLogin')}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .regis-card {
            flex-direction: column !important;
            max-width: 96vw !important;
          }
          .regis-left-panel {
            width: 100% !important;
            padding: 16px !important;
          }
          .regis-right-panel {
            width: 100% !important;
            padding: 16px !important;
          }
          .regis-form-grid {
            grid-template-columns: 1fr !important;
          }
          .regis-form-grid .regis-span2 {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  );
};
