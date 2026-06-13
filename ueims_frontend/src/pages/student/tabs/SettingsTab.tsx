import React, { useState, useEffect } from 'react';
import { message, Spin } from 'antd';
import { LockOutlined, BellOutlined, SaveOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { NeuSurface } from '../components/shared/NeuSurface';
import { AuthService } from '@/services/AuthService';
import { api } from '@/services/api';
import { cc } from '../constants';

const CTAButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}> = ({ children, onClick, variant = 'primary', icon, disabled = false, loading = false }) => {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    primary: { bg: 'linear-gradient(135deg, #E67E22, #E67E22)', text: '#fff', border: 'none' },
    ghost: { bg: '#fff', text: cc.primary, border: cc.border },
  };
  const { bg, text, border } = styles[variant];

  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', fontSize: 13, fontWeight: 700,
      color: disabled ? cc.textMuted : text, background: disabled ? '#f5f7fa' : bg,
      border: variant === 'primary' ? 'none' : `1px solid ${border}`, borderRadius: 12,
      cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: "'Inter', sans-serif", opacity: disabled ? 0.6 : 1,
    }}>
      {loading ? <Spin size="small" /> : icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </button>
  );
};

export const SettingsTab: React.FC = () => {
  const { t } = useTranslation(['common']);
  const [loading, setLoading] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [phoneData, setPhoneData] = useState({ phone: '' });
  const [userId, setUserId] = useState<string>('');

  useEffect(() => { fetchUserInfo(); }, []);

  const fetchUserInfo = async () => {
    try {
      const res = await api.get('/users/myInfo');
      setPhoneData({ phone: res.data?.phone || '' });
      setUserId(res.data?.userId || '');
    } catch { /* ignore */ }
  };

  const handleSavePhone = async () => {
    try {
      setSavingPhone(true);
      await api.put(`/users/${userId}`, { phone: phoneData.phone });
      message.success(t('settings.phoneUpdated', 'Phone number updated successfully!'));
    } catch (err: any) {
      message.error(err.response?.data?.message || t('settings.phoneUpdateFailed', 'Failed to update phone number!'));
    } finally {
      setSavingPhone(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      message.error(t('layout.passwordMismatch', 'New passwords do not match!'));
      return;
    }
    if (formData.newPassword.length < 8) {
      message.error(t('layout.passwordMinLength', 'Password must be at least 8 characters!'));
      return;
    }
    try {
      setLoading(true);
      await AuthService.changePassword({ oldPassword: formData.currentPassword, newPassword: formData.newPassword, confirmPassword: formData.newPassword });
      message.success(t('layout.passwordChangeSuccess', 'Password changed successfully!'));
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      message.error(err.response?.data?.message || t('layout.passwordChangeFail', 'Failed to change password!'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: cc.text, margin: '0 0 6px' }}>{t('settings.title', 'Settings')}</h2>
        <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>{t('settings.desc', 'Manage your account and preferences')}</p>
      </div>

      {/* Account Information */}
      <NeuSurface style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: cc.radiusMd, background: cc.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.primary }}>
            <UserOutlined style={{ fontSize: 20 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: cc.text, margin: 0 }}>{t('settings.accountInfo', 'Account Information')}</h3>
            <p style={{ fontSize: 12, color: cc.textMuted, margin: '2px 0 0' }}>{t('settings.accountInfoDesc', 'Manage your personal contact details')}</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>
              <PhoneOutlined style={{ marginRight: 6 }} />{t('settings.phoneLabel', 'Phone Number')}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="tel"
                value={phoneData.phone}
                onChange={(e) => setPhoneData({ phone: e.target.value })}
                placeholder={t('settings.phonePlaceholder', 'Enter your phone number')}
                style={{ flex: 1, padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13 }}
              />
              <CTAButton variant="primary" icon={<SaveOutlined />} onClick={handleSavePhone} loading={savingPhone}>{t('settings.saveBtn', 'Save')}</CTAButton>
            </div>
          </div>
        </div>
      </NeuSurface>

      {/* Change Password */}
      <NeuSurface style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: cc.radiusMd, background: cc.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.primary }}>
            <LockOutlined style={{ fontSize: 20 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: cc.text, margin: 0 }}>{t('settings.changePassword', 'Change Password')}</h3>
            <p style={{ fontSize: 12, color: cc.textMuted, margin: '2px 0 0' }}>{t('settings.changePasswordDesc', 'Update your account password')}</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>{t('settings.currentPasswordLabel', 'Current Password')}</label>
            <input type="password" value={formData.currentPassword} onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>{t('settings.newPasswordLabel', 'New Password')}</label>
            <input type="password" value={formData.newPassword} onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>{t('settings.confirmPasswordLabel', 'Confirm New Password')}</label>
            <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <CTAButton variant="primary" icon={<SaveOutlined />} onClick={handleChangePassword} loading={loading}>{t('settings.saveChangesBtn', 'Save Changes')}</CTAButton>
          </div>
        </div>
      </NeuSurface>

      {/* Notifications */}
      <NeuSurface style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: cc.radiusMd, background: cc.infoMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.info }}>
            <BellOutlined style={{ fontSize: 20 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: cc.text, margin: 0 }}>{t('settings.notificationsTitle', 'Notifications')}</h3>
            <p style={{ fontSize: 12, color: cc.textMuted, margin: '2px 0 0' }}>{t('settings.notificationsDesc', 'Manage your notification preferences')}</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            t('settings.emailNotifications', 'Email notifications'),
            t('settings.interviewReminders', 'Interview reminders'),
            t('settings.deadlineAlerts', 'Report deadline alerts'),
            t('settings.statusUpdates', 'Application status updates')
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 3 ? `1px solid ${cc.borderSubtle}` : 'none' }}>
              <span style={{ fontSize: 13, color: cc.text }}>{item}</span>
              <div style={{ width: 44, height: 24, borderRadius: 12, background: cc.success, cursor: 'pointer', position: 'relative' }}>
                <div style={{ position: 'absolute', right: 2, top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
              </div>
            </div>
          ))}
        </div>
      </NeuSurface>
    </div>
  );
};
