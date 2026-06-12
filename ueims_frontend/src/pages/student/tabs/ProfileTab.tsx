import React, { useEffect, useState } from 'react';
import { message, Spin } from 'antd';
import { 
  UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, BookOutlined,
  UploadOutlined, FileTextOutlined, EditOutlined, SaveOutlined,
  FileOutlined, EyeOutlined, DownloadOutlined,
} from '@ant-design/icons';
import { NeuSurface } from '../components/shared/NeuSurface';
import { SmallPill } from '../components/shared/SmallPill';
import { api } from '@/services/api';

const CTAButton: React.FC<{
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: 'primary' | 'ghost' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}> = ({ children, onClick, variant = 'primary', size = 'md', fullWidth = false, icon, disabled = false, loading = false }) => {
  const cc = {
    primary: '#E67E22',
    primaryDark: '#C45200',
    textMuted: '#64748b',
    bgLight: '#f5f7fa',
    border: '#e2e8f0',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',
  };
  const styles: Record<string, { bg: string; text: string; border: string; shadow: string; hoverBg?: string }> = {
    primary: { bg: 'linear-gradient(135deg, #E67E22, #E67E22, #F39C12)', text: '#fff', border: 'none', shadow: '0 12px 28px rgba(230, 126, 34,.22)', hoverBg: 'linear-gradient(135deg, #E86A20, #E67E22, #E67E22)' },
    ghost: { bg: '#fff', text: cc.primary, border: cc.border, shadow: '0 8px 18px rgba(15,23,42,.05)' },
    success: { bg: '#fff', text: cc.success, border: `${cc.success}40`, shadow: '0 8px 18px rgba(15,23,42,.05)' },
    danger: { bg: '#fff1f2', text: cc.danger, border: `${cc.danger}30`, shadow: '0 8px 18px rgba(15,23,42,.05)' },
    warning: { bg: '#fff', text: cc.warning, border: `${cc.warning}40`, shadow: '0 8px 18px rgba(15,23,42,.05)' },
  };
  const { bg, text, border, shadow, hoverBg } = styles[variant];
  const sizes = { sm: { padding: '8px 14px', fontSize: 12 }, md: { padding: '11px 16px', fontSize: 13 }, lg: { padding: '13px 22px', fontSize: 14 } };
  const { padding, fontSize } = sizes[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding,
        fontSize,
        fontWeight: 700,
        color: disabled ? cc.textMuted : text,
        background: disabled ? cc.bgLight : bg,
        border: variant === 'primary' ? 'none' : `1px solid ${border}`,
        borderRadius: 16,
        boxShadow: disabled ? 'none' : shadow,
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {loading ? <Spin size="small" /> : icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </button>
  );
};

const hexToRgba = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const cc = {
  primary: '#E67E22',
  primaryDark: '#C45200',
  primaryMuted: '#fff0e6',
  text: '#1e293b',
  textMuted: '#64748b',
  success: '#22c55e',
  successMuted: '#dcfce7',
  successText: '#166534',
  bgLight: '#f5f7fa',
  border: '#e2e8f0',
  borderSubtle: '#f1f5f9',
  surface: '#ffffff',
  radiusMd: 8,
  radiusLg: 12,
  radiusFull: 9999,
};

export const ProfileTab: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ phone: '', skills: '' });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/myInfo');
      setProfile(res.data);
      setFormData({ phone: res.data.phone || '', skills: res.data.skills || '' });
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') return 'Only PDF files are accepted!';
    if (file.size > 5 * 1024 * 1024) return 'CV file must not exceed 5MB!';
    return null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) { message.error(error); return; }
      setCvFile(file);
    }
  };

  const handleUploadCV = async () => {
    if (!cvFile) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', cvFile);
      await api.post('/student-profiles/upload-cv', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      message.success('CV uploaded successfully!');
      fetchProfile();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Upload failed!');
    } finally {
      setUploading(false);
      setCvFile(null);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.put('/student-profiles', formData);
      message.success('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Update failed!');
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 40px', fontFamily: 'Inter, sans-serif' }}>
      {/* Profile Header */}
      <NeuSurface style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: cc.radiusLg,
            background: `linear-gradient(135deg, ${cc.primary}, ${cc.primaryDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 28, fontWeight: 800, flexShrink: 0,
            boxShadow: '0 4px 12px rgba(230, 126, 34,.25)',
          }}>
            {profile?.fullName?.substring(0, 2).toUpperCase() || 'ST'}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: cc.text, margin: '0 0 4px' }}>{profile?.fullName || 'Student'}</h2>
            <p style={{ fontSize: 13, color: cc.textMuted, margin: '0 0 10px' }}>{profile?.email || 'email@student.fpt.edu.vn'}</p>
            <SmallPill color={cc.success}><span style={{ marginRight: 4 }}>✓</span> Active Intern</SmallPill>
          </div>
          <CTAButton variant="ghost" icon={<EditOutlined />} onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </CTAButton>
        </div>
      </NeuSurface>

      {/* Personal Info */}
      <NeuSurface style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: cc.text, margin: 0 }}>Personal Information</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {[
            { label: 'Student ID (MSSV)', value: profile?.studentCode || 'N/A', icon: <IdcardOutlined /> },
            { label: 'Email', value: profile?.email || 'N/A', icon: <MailOutlined /> },
            { label: 'Phone', value: editing ? (
              <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                style={{ border: `1px solid ${cc.border}`, borderRadius: cc.radiusMd, padding: '4px 8px', fontSize: 13, width: '100%' }} />
            ) : profile?.phone || 'Not set', icon: <PhoneOutlined /> },
            { label: 'Major', value: profile?.major || 'Software Engineering', icon: <BookOutlined /> },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: cc.radiusMd, background: cc.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.primary, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, color: cc.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em' }}>{item.label}</div>
                <div style={{ fontSize: 14, color: cc.text, fontWeight: 600, marginTop: 2 }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
        {editing && (
          <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <CTAButton variant="ghost" onClick={() => setEditing(false)}>Cancel</CTAButton>
            <CTAButton variant="primary" icon={<SaveOutlined />} onClick={handleSaveProfile}>Save Changes</CTAButton>
          </div>
        )}
      </NeuSurface>

      {/* CV Upload */}
      <NeuSurface style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: cc.radiusMd, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <FileTextOutlined style={{ fontSize: 20 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: cc.text, margin: 0 }}>Your CV / Resume</h3>
            <p style={{ fontSize: 12, color: cc.textMuted, margin: '2px 0 0' }}>Upload in PDF format, max 5MB</p>
          </div>
        </div>
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById('cv-input')?.click()}
          style={{
            border: `2px dashed ${dragActive ? cc.primary : cc.border}`,
            borderRadius: cc.radiusLg, padding: '36px 24px', textAlign: 'center',
            background: dragActive ? cc.primaryMuted : cc.bgLight,
            transition: 'all 0.2s ease', cursor: 'pointer',
          }}
        >
          <input id="cv-input" type="file" accept=".pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const err = validateFile(f); if (err) message.error(err); else setCvFile(f); }}} style={{ display: 'none' }} />
          {cvFile ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <FileOutlined style={{ fontSize: 32, color: cc.success }} />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: cc.text, margin: 0 }}>{cvFile.name}</p>
                <p style={{ fontSize: 12, color: cc.textMuted, margin: '2px 0 0' }}>{(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          ) : (
            <>
              <UploadOutlined style={{ fontSize: 40, color: cc.textMuted, marginBottom: 12 }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: cc.text, margin: '0 0 4px' }}>Drag & drop your CV here</p>
              <p style={{ fontSize: 12, color: cc.textMuted, margin: 0 }}>or click to browse files</p>
            </>
          )}
        </div>
        {cvFile && (
          <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <CTAButton variant="ghost" onClick={() => setCvFile(null)}>Cancel</CTAButton>
            <CTAButton variant="primary" icon={<UploadOutlined />} onClick={handleUploadCV} loading={uploading}>Upload CV</CTAButton>
          </div>
        )}
        {profile?.cvFileUrl && !cvFile && (
          <div style={{ marginTop: 20, padding: 16, borderRadius: cc.radiusMd, background: cc.successMuted, border: `1px solid ${cc.success}20`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>✓</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: cc.successText, margin: 0 }}>CV uploaded</p>
                <p style={{ fontSize: 12, color: cc.successText, opacity: 0.8, margin: '2px 0 0' }}>{profile.cvFileName || 'cv_document.pdf'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <CTAButton variant="ghost" size="sm" icon={<EyeOutlined />} onClick={() => window.open(profile.cvFileUrl, '_blank')}>View</CTAButton>
              <CTAButton variant="ghost" size="sm" icon={<DownloadOutlined />} onClick={() => window.open(profile.cvFileUrl, '_blank')}>Download</CTAButton>
            </div>
          </div>
        )}
      </NeuSurface>

      {/* Skills */}
      <NeuSurface style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: cc.text, margin: 0 }}>Skills</h3>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(profile?.skills || 'React, TypeScript, Java, Python').split(',').map((skill: string, i: number) => (
            <span key={i} style={{ padding: '6px 14px', borderRadius: cc.radiusFull, background: cc.primaryMuted, color: cc.primary, fontSize: 12, fontWeight: 600 }}>
              {skill.trim()}
            </span>
          ))}
        </div>
      </NeuSurface>
    </div>
  );
};
