import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { message, Spin } from 'antd';
import {
  FileTextOutlined, EyeOutlined,
  PlusOutlined, UploadOutlined, IdcardOutlined,
  MailOutlined, BookOutlined, UserOutlined,
  CalendarOutlined, TrophyOutlined,
} from '@ant-design/icons';
import { NeuSurface } from '../components/shared/NeuSurface';
import { SmallPill } from '../components/shared/SmallPill';
import { StudentProfileService } from '@/services/StudentProfileService';
import { api } from '@/services/api';
import { cc } from '../constants';

const BACKEND_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const resolveFileUrl = (url: string | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BACKEND_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};

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
  const styles: Record<string, { bg: string; text: string; border: string; shadow: string }> = {
    primary: { bg: 'linear-gradient(135deg, #E67E22, #E67E22, #F39C12)', text: '#fff', border: 'none', shadow: '0 12px 28px rgba(230,126,34,.22)' },
    ghost: { bg: '#fff', text: cc.primary, border: cc.border, shadow: '0 8px 18px rgba(15,23,42,.05)' },
    success: { bg: '#fff', text: cc.success, border: `${cc.success}40`, shadow: '0 8px 18px rgba(15,23,42,.05)' },
    danger: { bg: '#fff1f2', text: cc.danger, border: `${cc.danger}30`, shadow: '0 8px 18px rgba(15,23,42,.05)' },
    warning: { bg: '#fff', text: cc.warning, border: `${cc.warning}40`, shadow: '0 8px 18px rgba(15,23,42,.05)' },
  };
  const { bg, text, border, shadow } = styles[variant];
  const sizes = { sm: { padding: '7px 14px', fontSize: 12 }, md: { padding: '10px 16px', fontSize: 13 }, lg: { padding: '13px 22px', fontSize: 14 } };
  const { padding, fontSize } = sizes[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding, fontSize, fontWeight: 700,
        color: disabled ? cc.textMuted : text,
        background: disabled ? cc.bgLight : bg,
        border: variant === 'primary' ? 'none' : `1px solid ${border}`,
        borderRadius: 16, boxShadow: disabled ? 'none' : shadow,
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto', justifyContent: 'center',
        fontFamily: "'Inter', sans-serif", opacity: disabled ? 0.6 : 1,
      }}
    >
      {loading ? <Spin size="small" /> : icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </button>
  );
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface MyProfile {
  userId?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  status?: string;
  profileId?: string;
  studentCode?: string;
  major?: string;
  skills?: string;
  cvUrl?: string;
  cvFileName?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  bio?: string;
  semesterName?: string;
  semesterCode?: string;
  currentSemester?: number;
  gpa?: number;
  ojtStatus?: string;
}

// ── Tab switcher ─────────────────────────────────────────────────────────────
type ProfileView = 'profile' | 'cv';

const TabSwitcher: React.FC<{ active: ProfileView; onChange: (v: ProfileView) => void }> = ({ active, onChange }) => {
  const { t } = useTranslation(['profile', 'common']);
  return (
  <div style={{ display: 'inline-flex', background: cc.bgLight, borderRadius: cc.radiusMd, padding: 3, gap: 2 }}>
    {(['profile', 'cv'] as ProfileView[]).map((v) => {
      const isActive = active === v;
      return (
        <button
          key={v}
          onClick={() => onChange(v)}
          style={{
            padding: '8px 20px', borderRadius: cc.radiusMd - 2, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, fontFamily: "'Inter', sans-serif",
            background: isActive ? '#fff' : 'transparent',
            color: isActive ? cc.primary : cc.textMuted,
            boxShadow: isActive ? '0 2px 6px rgba(0,0,0,.08)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          {v === 'profile' ? t('profileInfo', 'Profile Info') : t('myCvs', 'My CVs')}
        </button>
      );
    })}
  </div>
  );
};

// ── Status pill helper ────────────────────────────────────────────────────────
const StatusPill: React.FC<{ status?: string }> = ({ status }) => {
  const { t } = useTranslation(['profile']);
  const statusMap: Record<string, { color: string; bg: string; label: string }> = {
    OJT: { color: cc.success, bg: cc.successMuted, label: t('onOjt', 'On OJT') },
    ACCEPTED: { color: '#3b82f6', bg: '#dbeafe', label: t('accepted', 'Accepted') },
    MATCHED: { color: '#a855f7', bg: '#f3e8ff', label: t('matched', 'Matched') },
    ELIGIBLE: { color: cc.primary, bg: cc.primaryMuted, label: t('eligible', 'Eligible') },
    CANCELLED: { color: cc.danger, bg: cc.dangerMuted, label: t('cancelled', 'Cancelled') },
  };
  const s = statusMap[status || ''] || { color: cc.textMuted, bg: cc.bgLight, label: status || t('unknown', 'Unknown') };
  return (
    <SmallPill color={s.color} bg={s.bg}>
      <span style={{ marginRight: 4 }}>&#10003;</span> {s.label}
    </SmallPill>
  );
};

// ── Profile Info View ─────────────────────────────────────────────────────────
const ProfileInfoView: React.FC<{ profile: MyProfile }> = ({ profile }) => {
  const { t } = useTranslation(['profile']);
  return (
  <>
    {/* Header */}
    <NeuSurface style={{ padding: 24, marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: cc.radiusLg,
          background: `linear-gradient(135deg, ${cc.primary}, ${cc.primaryDark})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 28, fontWeight: 800, flexShrink: 0,
          boxShadow: '0 4px 12px rgba(230,126,34,.25)',
        }}>
          {profile?.fullName?.substring(0, 2).toUpperCase() || 'ST'}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: cc.text, margin: '0 0 4px' }}>{profile?.fullName || 'Student'}</h2>
          <p style={{ fontSize: 13, color: cc.textMuted, margin: '0 0 10px' }}>{profile?.email || 'email@student.fpt.edu.vn'}</p>
          <StatusPill status={profile?.ojtStatus} />
        </div>
      </div>
    </NeuSurface>

    {/* Academic Information (from EligibleStudent) */}
    {(profile?.semesterName || profile?.currentSemester || (profile?.gpa != null)) && (
      <NeuSurface style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: cc.text, margin: 0 }}>{t('academicInfo', 'Academic Information')}</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {([
            ...(profile?.semesterName ? [{ label: t('semester', 'Semester'), value: `${profile.semesterName}${profile.semesterCode ? ` (${profile.semesterCode})` : ''}`, icon: <CalendarOutlined /> }] : []),
            ...(profile?.currentSemester ? [{ label: t('currentSemester', 'Current Semester'), value: `Semester ${profile.currentSemester}`, icon: <BookOutlined /> }] : []),
            ...(profile?.gpa != null ? [{ label: t('gpa', 'GPA'), value: profile.gpa.toString(), icon: <TrophyOutlined /> }] : []),
          ] as { label: string; value: string; icon: React.ReactNode }[]).map((item, i) => (
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
      </NeuSurface>
    )}

    {/* School Information (read-only) */}
    <NeuSurface style={{ padding: 24, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: cc.text, margin: 0 }}>{t('schoolInfo', 'School Information')}</h3>
        <span style={{ fontSize: 11, color: cc.textMuted }}>{t('managedByAdmin', 'Managed by administrator')}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {([
          { label: t('studentId', 'Student ID (MSSV)'), value: profile?.studentCode || 'N/A', icon: <IdcardOutlined /> },
          { label: t('email', 'Email'), value: profile?.email || 'N/A', icon: <MailOutlined /> },
          { label: t('major', 'Major / Department'), value: profile?.major || 'N/A', icon: <BookOutlined /> },
          { label: t('fullName', 'Full Name'), value: profile?.fullName || 'N/A', icon: <UserOutlined /> },
        ] as { label: string; value: string; icon: React.ReactNode }[]).map((item, i) => (
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
    </NeuSurface>

    {/* Skills */}
    {profile?.skills && (
      <NeuSurface style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: cc.text, margin: 0 }}>{t('skills', 'Skills')}</h3>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {profile.skills.split(',').map((skill: string, i: number) => (
            <span key={i} style={{ padding: '6px 14px', borderRadius: cc.radiusFull, background: cc.primaryMuted, color: cc.primary, fontSize: 12, fontWeight: 600 }}>
              {skill.trim()}
            </span>
          ))}
        </div>
      </NeuSurface>
    )}
  </>
  );
};

// ── CV View ───────────────────────────────────────────────────────────────────
const CvView: React.FC<{ cvUrl?: string; cvFileName?: string; onRefresh: () => void }> = ({ cvUrl, cvFileName, onRefresh }) => {
  const { t } = useTranslation(['profile']);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') return t('onlyPdfAccept', 'Only PDF files are accepted!');
    if (file.size > 5 * 1024 * 1024) return t('maxSizeAccept', 'CV file must not exceed 5MB!');
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

  const handleUpload = async () => {
    if (!cvFile) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', cvFile);
      await StudentProfileService.uploadCV(fd);
      message.success(t('cvUploadedSuccess', 'CV uploaded successfully!'));
      setCvFile(null);
      setShowUpload(false);
      onRefresh();
    } catch (err: any) {
      message.error(err.response?.data?.message || t('cvUploadFailed', 'Upload failed!'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setUploading(true);
      await StudentProfileService.deleteCV();
      message.success(t('cvDeletedSuccess', 'CV deleted successfully!'));
      onRefresh();
    } catch (err: any) {
      message.error(err.response?.data?.message || t('cvDeleteFailed', 'Delete failed!'));
    } finally {
      setUploading(false);
    }
  };

  const displayName = cvFileName || (cvUrl ? cvUrl.split('_').slice(2).join('_').replace('/uploads/cv/', '') : t('cvDocument', 'CV Document'));

  if (!cvUrl && !showUpload) {
    return (
      <NeuSurface style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: cc.radiusMd, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <FileTextOutlined style={{ fontSize: 20 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: cc.text, margin: 0 }}>{t('myCvs', 'My CVs')}</h3>
            <p style={{ fontSize: 12, color: cc.textMuted, margin: '2px 0 0' }}>{t('onlyPdf', 'PDF format only, max 5MB')}</p>
          </div>
        </div>
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById('cv-upload-input')?.click()}
          style={{
            border: `2px dashed ${dragActive ? cc.primary : cc.border}`,
            borderRadius: cc.radiusLg, padding: '48px 24px', textAlign: 'center',
            background: dragActive ? cc.primaryMuted : cc.bgLight,
            transition: 'all 0.2s ease', cursor: 'pointer',
          }}
        >
          <input id="cv-upload-input" type="file" accept=".pdf" style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { const err = validateFile(f); if (err) message.error(err); else { setCvFile(f); setShowUpload(true); } }
            }}
          />
          <div style={{ width: 56, height: 56, borderRadius: cc.radiusMd, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={cc.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: cc.text, margin: '0 0 4px' }}>{t('dropCvHere', 'Drop your CV here')}</p>
          <p style={{ fontSize: 12, color: cc.textMuted, margin: 0 }}>{t('clickToBrowse', 'or click to browse — PDF only, max 5MB')}</p>
        </div>
      </NeuSurface>
    );
  }

  return (
    <NeuSurface style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: cc.radiusMd, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <FileTextOutlined style={{ fontSize: 20 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: cc.text, margin: 0 }}>{t('myCvs', 'My CVs')}</h3>
            <p style={{ fontSize: 12, color: cc.textMuted, margin: '2px 0 0' }}>{t('onlyOneCv', 'Only one CV is allowed — uploading a new file replaces the current one')}</p>
          </div>
        </div>
        {!showUpload && (
          <CTAButton variant="primary" size="sm" icon={<PlusOutlined />} onClick={() => setShowUpload(true)}>{t('upload', 'Upload')}</CTAButton>
        )}
      </div>

      {/* Current CV card */}
      {cvUrl && !showUpload && (
        <div style={{ background: cc.surface, border: `1px solid ${cc.border}`, borderRadius: cc.radiusLg, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: cc.radiusMd, background: cc.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.primary, flexShrink: 0 }}>
            <FileTextOutlined style={{ fontSize: 22 }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: cc.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
            <p style={{ fontSize: 12, color: cc.textMuted, margin: '3px 0 0' }}>{t('uploadedCv', 'Uploaded CV')}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <CTAButton variant="ghost" size="sm" icon={<EyeOutlined />} onClick={() => window.open(resolveFileUrl(cvUrl), '_blank')}>{t('view', 'View')}</CTAButton>
            <CTAButton variant="danger" size="sm" icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>} onClick={handleDelete} loading={uploading}>{t('delete', 'Delete')}</CTAButton>
          </div>
        </div>
      )}

      {/* Upload panel */}
      {showUpload && (
        <div style={{ background: cc.bgLight, border: `1px solid ${cc.border}`, borderRadius: cc.radiusLg, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: cc.text, margin: 0 }}>{t('uploadNewCv', 'Upload New CV')}</h4>
            <button onClick={() => { setShowUpload(false); setCvFile(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: cc.textMuted, padding: 0 }}>&#x2715;</button>
          </div>

          <div
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('cv-upload-input-2')?.click()}
            style={{
              border: `2px dashed ${dragActive ? cc.primary : cc.border}`,
              borderRadius: cc.radiusMd, padding: '28px 16px', textAlign: 'center',
              background: dragActive ? cc.primaryMuted : '#fff',
              transition: 'all 0.2s ease', cursor: 'pointer', marginBottom: 16,
            }}
          >
            <input id="cv-upload-input-2" type="file" accept=".pdf" style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { const err = validateFile(f); if (err) message.error(err); else setCvFile(f); }
              }}
            />
            {cvFile ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <FileTextOutlined style={{ fontSize: 28, color: cc.success }} />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: cc.text, margin: 0 }}>{cvFile.name}</p>
                  <p style={{ fontSize: 12, color: cc.textMuted, margin: '2px 0 0' }}>{(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <>
                <UploadOutlined style={{ fontSize: 32, color: cc.textMuted, marginBottom: 8, display: 'block' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: cc.text, margin: '0 0 2px' }}>{t('dropOrClick', 'Drop file here or click to browse')}</p>
                <p style={{ fontSize: 11, color: cc.textMuted, margin: 0 }}>{t('onlyPdf', 'PDF only, max 5MB')}</p>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <CTAButton variant="ghost" onClick={() => { setShowUpload(false); setCvFile(null); }}>{t('cancel', 'Cancel')}</CTAButton>
            <CTAButton variant="primary" icon={<UploadOutlined />} onClick={handleUpload} loading={uploading} disabled={!cvFile}>{t('upload', 'Upload')}</CTAButton>
          </div>
        </div>
      )}

      {cvUrl && !showUpload && (
        <p style={{ fontSize: 11, color: cc.textMuted, marginTop: 12, textAlign: 'center' }}>
          To replace your CV, click the <strong>{t('upload', 'Upload')}</strong> button above.
        </p>
      )}
    </NeuSurface>
  );
};

// ── Main ProfileTab ───────────────────────────────────────────────────────────
export const ProfileTab: React.FC = () => {
  const { t } = useTranslation(['profile', 'common']);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ProfileView>('profile');

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [userRes, profileRes] = await Promise.all([
        api.get('/users/myInfo').catch((err) => { console.error('Failed to fetch user info:', err); return { data: null }; }),
        StudentProfileService.getMyProfile().catch(() => ({ data: null })),
      ]);

      const userInfo = userRes?.data;
      const profileData = profileRes?.data?.result ?? profileRes?.data;

      if (!userInfo && !profileData) { console.warn('Unable to fetch profile data'); return; }

      setProfile({ ...userInfo, ...profileData });
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  if (!profile) {
    return <div style={{ textAlign: 'center', padding: 40, color: cc.textMuted }}>Unable to load profile data.</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 40px', fontFamily: 'Inter, sans-serif' }}>
      {/* Tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <TabSwitcher active={activeView} onChange={setActiveView} />
      </div>

      {/* Views */}
      {activeView === 'profile' ? (
        <ProfileInfoView profile={profile} />
      ) : (
        <CvView
          cvUrl={profile.cvUrl}
          cvFileName={profile.cvFileName}
          onRefresh={fetchProfile}
        />
      )}
    </div>
  );
};
