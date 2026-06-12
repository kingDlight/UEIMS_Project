import React, { useState } from 'react';
import { message } from 'antd';
import { LockOutlined, BellOutlined, SaveOutlined } from '@ant-design/icons';
import { NeuSurface } from '../components/shared/NeuSurface';
import { AuthService } from '@/services/AuthService';
import { api } from '@/services/api';

const cc = {
  primary: '#E67E22',
  primaryMuted: '#fff0e6',
  text: '#1e293b',
  textMuted: '#64748b',
  success: '#22c55e',
  successMuted: '#dcfce7',
  successText: '#166534',
  info: '#3b82f6',
  infoMuted: '#dbeafe',
  border: '#e2e8f0',
  borderSubtle: '#f1f5f9',
  surface: '#ffffff',
  radiusMd: 8,
  radiusFull: 9999,
};

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
      {loading ? <span>...</span> : icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </button>
  );
};

export const SettingsTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      message.error('New passwords do not match!');
      return;
    }
    if (formData.newPassword.length < 8) {
      message.error('Password must be at least 8 characters!');
      return;
    }
    try {
      setLoading(true);
      await AuthService.changePassword({ oldPassword: formData.currentPassword, newPassword: formData.newPassword });
      message.success('Password changed successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to change password!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: cc.text, margin: '0 0 6px' }}>Settings</h2>
        <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>Manage your account and preferences</p>
      </div>

      {/* Change Password */}
      <NeuSurface style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: cc.radiusMd, background: cc.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.primary }}>
            <LockOutlined style={{ fontSize: 20 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: cc.text, margin: 0 }}>Change Password</h3>
            <p style={{ fontSize: 12, color: cc.textMuted, margin: '2px 0 0' }}>Update your account password</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>Current Password</label>
            <input type="password" value={formData.currentPassword} onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>New Password</label>
            <input type="password" value={formData.newPassword} onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>Confirm New Password</label>
            <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <CTAButton variant="primary" icon={<SaveOutlined />} onClick={handleChangePassword} loading={loading}>Save Changes</CTAButton>
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
            <h3 style={{ fontSize: 15, fontWeight: 600, color: cc.text, margin: 0 }}>Notifications</h3>
            <p style={{ fontSize: 12, color: cc.textMuted, margin: '2px 0 0' }}>Manage your notification preferences</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {['Email notifications', 'Interview reminders', 'Report deadline alerts', 'Application status updates'].map((item, i) => (
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
