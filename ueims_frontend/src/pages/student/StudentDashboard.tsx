import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { message, Spin } from 'antd';
import { 
  UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, BookOutlined,
  UploadOutlined, FileTextOutlined, TrophyOutlined, CalendarOutlined,
  ClockCircleOutlined, CheckCircleOutlined, WarningOutlined, ExclamationCircleOutlined,
  RightOutlined, BankOutlined, TeamOutlined, SettingOutlined, BellOutlined,
  EyeOutlined, DownloadOutlined, EditOutlined, SaveOutlined, PlusOutlined,
  SendOutlined, CloseCircleOutlined, StarOutlined,
  SnippetsOutlined, LockOutlined,
  UploadOutlined as UploadIcon, FileOutlined, SearchOutlined, EnvironmentOutlined, LinkOutlined,
} from '@ant-design/icons';
import { NeuSurface } from './components/shared/NeuSurface';
import { SmallPill } from './components/shared/SmallPill';
import { SmallBadge } from './components/shared/SmallBadge';
import { AnimatedStatCard } from './components/shared/AnimatedStatCard';
import { Sparkline } from './components/charts/Sparkline';
import { AreaChart } from './components/charts/AreaChart';
import { cc, hexToRgba } from './constants';
import { api } from '@/services/api';
import type { NavItem } from '@/components/layout/ModernLayout';

// ============================================================
// ANIMATED NUMBER
// ============================================================
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + (value - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <>{displayValue.toLocaleString()}</>;
};

// ============================================================
// HERO STAT MINI CARD (reused in hero section)
// ============================================================
const HeroMiniCard: React.FC<{ label: string; value: number; delay?: number }> = ({ label, value, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2, transition: { duration: 0.2 }, boxShadow: '0 8px 24px rgba(15,23,42,.12)' }}
      style={{
        padding: '10px 14px',
        borderRadius: 16,
        background: '#fff',
        border: '1px solid rgba(226,232,240,.95)',
        boxShadow: '0 4px 18px rgba(15,23,42,.06)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 68,
        cursor: 'default',
      }}
    >
      <div style={{ fontSize: 11, color: cc.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: cc.text, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>
        <AnimatedNumber value={value} />
      </div>
    </motion.div>
  );
};

// ============================================================
// CTA BUTTON
// ============================================================
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
  // TM-aligned button styles
  const styles: Record<string, { bg: string; text: string; border: string; shadow: string; hoverBg?: string }> = {
    primary: { bg: 'linear-gradient(135deg, #FF662C, #FF824D, #FF9B73)', text: '#fff', border: 'none', shadow: '0 12px 28px rgba(233,101,0,.22)', hoverBg: 'linear-gradient(135deg, #E86A20, #FF662C, #FF824D)' },
    ghost: { bg: '#fff', text: cc.primary, border: cc.border, shadow: '0 8px 18px rgba(15,23,42,.05)' },
    success: { bg: '#fff', text: cc.success, border: `${cc.success}40`, shadow: '0 8px 18px rgba(15,23,42,.05)' },
    danger: { bg: '#fff1f2', text: cc.danger, border: `${cc.danger}30`, shadow: '0 8px 18px rgba(15,23,42,.05)' },
    warning: { bg: '#fff', text: cc.warning, border: `${cc.warning}40`, shadow: '0 8px 18px rgba(15,23,42,.05)' },
  };
  const { bg, text, border, shadow, hoverBg } = styles[variant];
  const sizes = { sm: { padding: '8px 14px', fontSize: 12 }, md: { padding: '11px 16px', fontSize: 13 }, lg: { padding: '13px 22px', fontSize: 14 } };
  const { padding, fontSize } = sizes[size];

  return (
    <motion.button
      onClick={onClick}
      whileHover={disabled ? {} : { y: -1, boxShadow: shadow }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
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
    </motion.button>
  );
};

// ============================================================
// EMPTY STATE
// ============================================================
const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }> = ({ icon, title, description, action }) => (
  <NeuSurface style={{ padding: 56, textAlign: 'center' }}>
    <div style={{
      width: 72, height: 72, borderRadius: '50%',
      background: cc.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 16px', color: cc.primary,
    }}>
      {icon}
    </div>
    <h3 style={{ fontSize: 16, fontWeight: 600, color: cc.text, margin: '0 0 6px' }}>{title}</h3>
    <p style={{ fontSize: 13, color: cc.textMuted, margin: '0 0 20px', maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>{description}</p>
    {action}
  </NeuSurface>
);


// ============================================================
// PROFILE TAB (UC-42)
// ============================================================
const ProfileTab: React.FC = () => {
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
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 40px' }}>
      {/* Profile Header */}
      <NeuSurface style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: cc.radiusLg,
            background: `linear-gradient(135deg, ${cc.primary}, ${cc.primaryDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 28, fontWeight: 800, flexShrink: 0,
            boxShadow: cc.shadowBrand,
          }}>
            {profile?.fullName?.substring(0, 2).toUpperCase() || 'ST'}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: cc.text, margin: '0 0 4px' }}>{profile?.fullName || 'Student'}</h2>
            <p style={{ fontSize: 13, color: cc.textMuted, margin: '0 0 10px' }}>{profile?.email || 'email@student.fpt.edu.vn'}</p>
            <SmallPill color={cc.success}><CheckCircleOutlined /> Active Intern</SmallPill>
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
                style={{ border: `1px solid ${cc.border}`, borderRadius: cc.radiusSm, padding: '4px 8px', fontSize: 13, width: '100%' }} />
            ) : profile?.phone || 'Not set', icon: <PhoneOutlined /> },
            { label: 'Major', value: profile?.major || 'Software Engineering', icon: <BookOutlined /> },
          ].map((item, i) => (
            <div key={item.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
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

      {/* CV Upload (UC-42) */}
      <NeuSurface style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: cc.radiusMd, background: cc.infoMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.info }}>
            <FileTextOutlined style={{ fontSize: 20 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: cc.text, margin: 0 }}>Your CV / Resume</h3>
            <p style={{ fontSize: 12, color: cc.textMuted, margin: '2px 0 0' }}>Upload in PDF format, max 5MB (BR-27)</p>
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
              <UploadIcon style={{ fontSize: 40, color: cc.textMuted, marginBottom: 12 }} />
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
          <div style={{ marginTop: 20, padding: 16, borderRadius: cc.radiusMd, background: cc.successMuted, border: `1px solid ${hexToRgba(cc.success, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircleOutlined style={{ fontSize: 20, color: cc.success }} />
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
          {(profile?.skills || 'React, TypeScript, Java, Python').split(',').map((skill: string) => (
            <span key={skill.trim()} style={{ padding: '6px 14px', borderRadius: cc.radiusFull, background: cc.primaryMuted, color: cc.primary, fontSize: 12, fontWeight: 600 }}>
              {skill.trim()}
            </span>
          ))}
        </div>
      </NeuSurface>
    </motion.div>
  );
};

// ============================================================
// JOB BOARD TAB (UC-43, UC-44)
// ============================================================
const JobBoardTab: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applying, setApplying] = useState(false);
  const [matchProfile, setMatchProfile] = useState(false);
  const [techFilter, setTechFilter] = useState<string[]>([]);
  const [confirmApply, setConfirmApply] = useState<any>(null);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/job-posts/active');
      setJobs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  // UC-54: Apply with validation
  const handleApply = async () => {
    if (!confirmApply) return;
    
    // Check deadline (UC-54 E1)
    if (confirmApply.applicationDeadline && new Date(confirmApply.applicationDeadline) < new Date()) {
      message.error('Application failed. This job posting has reached its deadline and is closed for registration.');
      setConfirmApply(null);
      return;
    }
    
    try {
      setApplying(true);
      await api.post('/applications', { jobPostId: confirmApply.jobPostId });
      message.success('Application submitted successfully!');
      setConfirmApply(null);
      setSelectedJob(null);
      fetchJobs();
    } catch (err: any) {
      // UC-54 E2: Duplicate application
      if (err.response?.data?.message?.includes('already') || err.response?.data?.message?.includes('duplicate')) {
        message.error('You have already applied for this position. Duplicate submissions are strictly prohibited.');
      } else {
        message.error(err.response?.data?.message || 'Application failed!');
      }
    } finally {
      setApplying(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.enterpriseName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // UC-52: Match My Profile filter
    const matchesProfile = !matchProfile || 
      job.requiredSkills?.some((skill: string) => 
        techFilter.includes(skill.toLowerCase())
      );
    
    // UC-52: Tech filter
    const matchesTech = techFilter.length === 0 || 
      job.requiredSkills?.some((skill: string) => 
        techFilter.includes(skill.toLowerCase())
      );
    
    return matchesSearch && matchesProfile && matchesTech;
  });

  const toggleTechFilter = (tech: string) => {
    const t = tech.toLowerCase();
    setTechFilter(prev => prev.includes(t) ? prev.filter(item => item !== t) : [...prev, t]);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: cc.text, margin: '0 0 6px' }}>Job Board</h2>
          <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>Browse and apply for internship positions (UC-52, UC-53, UC-54)</p>
        </div>

        {/* Search & Filters */}
        <NeuSurface style={{ padding: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Search by position, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, padding: '10px 16px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, outline: 'none', fontFamily: "'Inter', sans-serif", color: cc.text }}
            />
            <CTAButton variant="primary" icon={<SearchOutlined />}>Search</CTAButton>
          </div>
          {/* UC-52: Match My Profile & Tech Filter */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <label htmlFor="matchProfile" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input id="matchProfile" type="checkbox" checked={matchProfile} onChange={(e) => setMatchProfile(e.target.checked)} style={{ width: 18, height: 18 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: cc.text }}>Match My Profile</span>
            </label>
            <span style={{ fontSize: 12, color: cc.textMuted }}>Filter by:</span>
            {['React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS'].map(tech => (
              <button
                key={tech}
                onClick={() => toggleTechFilter(tech)}
                style={{
                  padding: '4px 10px', borderRadius: cc.radiusFull, fontSize: 12, fontWeight: 600,
                  border: `1px solid ${techFilter.includes(tech.toLowerCase()) ? cc.primary : cc.border}`,
                  background: techFilter.includes(tech.toLowerCase()) ? cc.primaryMuted : 'transparent',
                  color: techFilter.includes(tech.toLowerCase()) ? cc.primary : cc.textMuted,
                  cursor: 'pointer'
                }}
              >
                {tech}
              </button>
            ))}
          </div>
        </NeuSurface>

        {/* Apply Confirmation Modal (UC-54) */}
        {confirmApply && (
          <NeuSurface style={{ padding: 24, marginBottom: 20, border: `2px solid ${cc.warning}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <WarningOutlined style={{ fontSize: 24, color: cc.warning }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: cc.text, margin: 0 }}>Confirm Application</h3>
            </div>
            <p style={{ fontSize: 13, color: cc.textMuted, margin: '0 0 12px' }}>You are applying for:</p>
            <div style={{ padding: 12, borderRadius: cc.radiusMd, background: cc.bgLight, marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: cc.text, margin: 0 }}>{confirmApply.title}</p>
              <p style={{ fontSize: 13, color: cc.textMuted, margin: '4px 0 0' }}>{confirmApply.enterpriseName}</p>
            </div>
            <div style={{ padding: 12, borderRadius: cc.radiusMd, background: cc.dangerMuted, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: cc.dangerText, margin: 0, fontWeight: 600 }}>
                Are you sure you want to apply? You can only submit your application ONCE for each job posting. No modifications are allowed after submission.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <CTAButton variant="ghost" onClick={() => setConfirmApply(null)}>Cancel</CTAButton>
              <CTAButton variant="primary" icon={<SendOutlined />} onClick={handleApply} loading={applying}>Confirm & Submit</CTAButton>
            </div>
          </NeuSurface>
        )}

        {/* UC-52 E1: No results */}
        {filteredJobs.length === 0 ? (
          <EmptyState icon={<TrophyOutlined style={{ fontSize: 32 }} />} title="No matching job postings found" description="Please try refining your keywords or filters" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {filteredJobs.map((job, index) => (
              <motion.div key={job.jobPostId || index} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <NeuSurface style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setSelectedJob(job)}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: cc.radiusMd, background: hexToRgba(cc.primary, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.primary, fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
                      {job.enterpriseName?.charAt(0) || 'E'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600, color: cc.text, margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.title || 'Internship Position'}</h4>
                      <p style={{ fontSize: 12, color: cc.textMuted, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.enterpriseName || 'Company'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                    {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: cc.textMuted }}><CalendarOutlined style={{ fontSize: 12 }} />{job.location}</span>}
                    {job.maxPositions && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: cc.textMuted }}><TeamOutlined style={{ fontSize: 12 }} />{job.maxPositions} positions</span>}
                  </div>
                  <p style={{ fontSize: 13, color: cc.textMuted, margin: '0 0 14px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{job.description || 'Job description...'}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: `1px solid ${cc.borderSubtle}` }}>
                    <SmallBadge label={job.status === 'OPEN' ? 'Open' : 'Closed'} variant={job.status === 'OPEN' ? 'success' : 'neutral'} />
                    <CTAButton variant="ghost" size="sm" icon={<RightOutlined />} onClick={(e) => { e?.stopPropagation(); setSelectedJob(job); }}>View details</CTAButton>
                  </div>
                </NeuSurface>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Job Detail Drawer */}
      {selectedJob && (
        <div onClick={() => setSelectedJob(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} style={{ background: cc.surface, borderRadius: `${cc.radiusXl}px ${cc.radiusXl}px 0 0`, maxWidth: 600, width: '100%', maxHeight: '85vh', overflow: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: cc.radiusLg, background: hexToRgba(cc.primary, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.primary, fontSize: 24, fontWeight: 700, flexShrink: 0 }}>{selectedJob.enterpriseName?.charAt(0) || 'E'}</div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: cc.text, margin: '0 0 4px' }}>{selectedJob.title}</h2>
                  <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>{selectedJob.enterpriseName}</p>
                </div>
              </div>
              <CTAButton variant="ghost" size="sm" icon={<CloseCircleOutlined />} onClick={() => setSelectedJob(null)}>Close</CTAButton>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              {selectedJob.location && <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: cc.radiusMd, background: cc.bgLight, fontSize: 13, color: cc.textMuted }}><CalendarOutlined style={{ fontSize: 14 }} />{selectedJob.location}</span>}
              {selectedJob.maxPositions && <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: cc.radiusMd, background: cc.bgLight, fontSize: 13, color: cc.textMuted }}><TeamOutlined style={{ fontSize: 14 }} />{selectedJob.maxPositions} positions</span>}
            </div>
            {selectedJob.description && <div style={{ marginBottom: 18 }}><h3 style={{ fontSize: 13, fontWeight: 600, color: cc.text, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</h3><p style={{ fontSize: 13, color: cc.textMuted, lineHeight: 1.6, margin: 0 }}>{selectedJob.description}</p></div>}
            {selectedJob.requirements && <div style={{ marginBottom: 18 }}><h3 style={{ fontSize: 13, fontWeight: 600, color: cc.text, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Requirements</h3><p style={{ fontSize: 13, color: cc.textMuted, lineHeight: 1.6, margin: 0 }}>{selectedJob.requirements}</p></div>}
            {selectedJob.benefits && <div style={{ marginBottom: 18 }}><h3 style={{ fontSize: 13, fontWeight: 600, color: cc.text, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Benefits</h3><p style={{ fontSize: 13, color: cc.textMuted, lineHeight: 1.6, margin: 0 }}>{selectedJob.benefits}</p></div>}
            {selectedJob.applicationDeadline && <div style={{ padding: 16, borderRadius: cc.radiusMd, background: cc.warningMuted, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}><ClockCircleOutlined style={{ fontSize: 20, color: cc.warning }} /><div><p style={{ fontSize: 11, color: cc.warningText, margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Application Deadline</p><p style={{ fontSize: 14, color: cc.warningText, margin: '2px 0 0', fontWeight: 600 }}>{new Date(selectedJob.applicationDeadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div></div>}
            <CTAButton variant="primary" size="lg" fullWidth icon={<SendOutlined />} onClick={() => {
              if (selectedJob.applicationDeadline && new Date(selectedJob.applicationDeadline) < new Date()) {
                message.error('This job posting has reached its deadline and is closed for registration.');
              } else {
                setConfirmApply(selectedJob);
              }
            }} disabled={selectedJob.status !== 'OPEN'} loading={applying}>
              {selectedJob.status === 'OPEN' ? 'Apply Now' : 'Applications Closed'}
            </CTAButton>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// APPLICATIONS TAB (UC-46, UC-55, UC-57)
// ============================================================
const ApplicationsTab: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/applications/my-applications');
      setApplications(res.data || []);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    try {
      await api.put(`/applications/${applicationId}/withdraw`);
      message.success('Application withdrawn successfully!');
      fetchApplications();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to withdraw application!');
    }
  };

  const filteredApps = filter === 'all' ? applications : applications.filter(app => app.status === filter.toUpperCase());

  const statusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
    switch (status?.toUpperCase()) {
      case 'PASSED': case 'APPROVED': return 'success';
      case 'PENDING': case 'SUBMITTED': return 'warning';
      case 'REJECTED': case 'FAILED': return 'error';
      case 'SCHEDULED': return 'info';
      default: return 'neutral';
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: cc.text, margin: '0 0 6px' }}>My Applications</h2>
          <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>Track all your job applications in one place</p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['all', 'pending', 'passed', 'rejected'].map(f => (
            <CTAButton key={f} variant={filter === f ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</CTAButton>
          ))}
        </div>

        {filteredApps.length === 0 ? (
          <EmptyState icon={<FileTextOutlined style={{ fontSize: 32 }} />} title="No applications yet" description="Start applying to internships to see your applications here" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredApps.map((app, index) => (
              <motion.div key={app.applicationId || index} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <NeuSurface style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ width: 52, height: 52, borderRadius: cc.radiusMd, background: hexToRgba(cc.primary, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.primary, fontSize: 20, fontWeight: 700 }}>
                        {app.enterpriseName?.charAt(0) || 'E'}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 600, color: cc.text, margin: '0 0 4px' }}>{app.jobTitle || 'Internship Position'}</h4>
                        <p style={{ fontSize: 12, color: cc.textMuted, margin: '0 0 8px' }}>{app.enterpriseName}</p>
                        <SmallBadge label={app.status || 'PENDING'} variant={statusVariant(app.status)} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {app.status === 'PENDING' && (
                        <CTAButton variant="danger" size="sm" icon={<CloseCircleOutlined />} onClick={() => handleWithdraw(app.applicationId)}>Withdraw</CTAButton>
                      )}
                      <CTAButton variant="ghost" size="sm" icon={<EyeOutlined />}>View</CTAButton>
                    </div>
                  </div>
                </NeuSurface>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ============================================================
// SCHEDULE TAB (UC-58, UC-59)
// ============================================================
const ScheduleTab: React.FC = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [declining, setDeclining] = useState<any>(null);
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => { fetchInterviews(); }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/interviews/my-schedules');
      setInterviews(res.data || []);
    } catch (err) {
      console.error('Failed to fetch interviews', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (interviewId: string) => {
    try {
      await api.put(`/interviews/${interviewId}/confirm`);
      message.success('Interview confirmed successfully! The company will be notified of your commitment.');
      setConfirming(null);
      fetchInterviews();
    } catch (err: any) {
      if (err.response?.data?.message?.includes('expired')) {
        message.error('Action failed. This interview invitation has expired as the scheduled time has already passed.');
      } else {
        message.error(err.response?.data?.message || 'Failed to confirm!');
      }
    }
  };

  // BR-40: Reason for refusal is mandatory
  const handleDecline = async () => {
    if (!declineReason.trim()) {
      message.error('Action denied. You must provide a valid reason for declining the interview invitation.');
      return;
    }
    try {
      await api.put(`/interviews/${declining.interviewId}/decline`, { reason: declineReason });
      message.success('You have declined the interview invitation. The company has been notified.');
      setDeclining(null);
      setDeclineReason('');
      fetchInterviews();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to decline!');
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: cc.text, margin: '0 0 6px' }}>Interview Schedule</h2>
          <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>Your upcoming interviews and appointments (UC-57, UC-58, BR-49)</p>
        </div>

        {/* Confirm Modal (BR-49: Attendance Irreversibility) */}
        {confirming && (
          <NeuSurface style={{ padding: 24, marginBottom: 20, border: `2px solid ${cc.info}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <ExclamationCircleOutlined style={{ fontSize: 24, color: cc.info }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: cc.text, margin: 0 }}>Confirm Interview Attendance</h3>
            </div>
            <p style={{ fontSize: 13, color: cc.textMuted, margin: '0 0 20px', lineHeight: 1.6 }}>
              Are you sure you want to accept this interview schedule? The company will be notified of your commitment. <strong>Note: This action cannot be undone (BR-49).</strong>
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <CTAButton variant="ghost" onClick={() => setConfirming(null)}>Cancel</CTAButton>
              <CTAButton variant="success" icon={<CheckCircleOutlined />} onClick={() => handleConfirm(confirming)}>Yes, Confirm</CTAButton>
            </div>
          </NeuSurface>
        )}

        {/* Decline Modal (BR-40: Mandatory reason) */}
        {declining && (
          <NeuSurface style={{ padding: 24, marginBottom: 20, border: `2px solid ${cc.danger}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <WarningOutlined style={{ fontSize: 24, color: cc.danger }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: cc.text, margin: 0 }}>Decline Interview Invitation</h3>
            </div>
            <div style={{ padding: 12, borderRadius: cc.radiusMd, background: cc.dangerMuted, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: cc.dangerText, margin: 0, fontWeight: 600 }}>
                Are you sure you want to decline this interview? This action will formally withdraw you from this application cycle.
              </p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div>
                Reason for Refusal <span style={{ color: cc.danger }}>*</span>
              </div>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={3}
                placeholder="Please provide your reason for declining..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <CTAButton variant="ghost" onClick={() => { setDeclining(null); setDeclineReason(''); }}>No, Keep It</CTAButton>
              <CTAButton variant="danger" icon={<CloseCircleOutlined />} onClick={handleDecline}>Confirm Decline</CTAButton>
            </div>
          </NeuSurface>
        )}

        {interviews.length === 0 ? (
          <EmptyState icon={<CalendarOutlined style={{ fontSize: 32 }} />} title="No scheduled interviews" description="You have no upcoming interview invitations at this moment." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {interviews.map((interview, index) => (
              <motion.div key={interview.interviewId || index} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <NeuSurface style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 600, color: cc.text, margin: '0 0 8px' }}>{interview.jobTitle || 'Interview'}</h4>
                      <p style={{ fontSize: 13, color: cc.textMuted, margin: '0 0 8px' }}><BankOutlined /> {interview.enterpriseName}</p>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: cc.text }}><CalendarOutlined /> {new Date(interview.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: cc.text }}><ClockCircleOutlined /> {new Date(interview.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        {interview.type && <SmallBadge label={interview.type} variant="info" />}
                      </div>
                      {interview.meetingLink && (
                        <p style={{ fontSize: 12, color: cc.info, margin: '8px 0 0' }}>
                          <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" style={{ color: cc.info }}><LinkOutlined /> Join Meeting</a>
                        </p>
                      )}
                      {interview.location && (
                        <p style={{ fontSize: 12, color: cc.textMuted, margin: '4px 0 0' }}><EnvironmentOutlined /> {interview.location}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      {(() => {
                        let v: "success" | "error" | "warning" = "warning";
                        if (interview.status === 'CONFIRMED') v = 'success';
                        else if (interview.status === 'DECLINED') v = 'error';
                        return <SmallBadge label={interview.status || 'PENDING'} variant={v} />;
                      })()}
                      {interview.status === 'PENDING' && (
                        <>
                          <CTAButton variant="success" size="sm" icon={<CheckCircleOutlined />} onClick={() => setConfirming(interview.interviewId)}>Confirm</CTAButton>
                          <CTAButton variant="danger" size="sm" icon={<CloseCircleOutlined />} onClick={() => setDeclining(interview)}>Decline</CTAButton>
                        </>
                      )}
                    </div>
                  </div>
                </NeuSurface>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ============================================================
// TRAINING PLAN TAB (UC-61)
// ============================================================
const TrainingPlanTab: React.FC = () => {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPlan(); }, []);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const res = await api.get('/training-plans/my-plan');
      setPlan(res.data);
    } catch (err) {
      console.error('Failed to fetch training plan', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: cc.text, margin: '0 0 6px' }}>Training Plan</h2>
          <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>Your internship training roadmap from Enterprise</p>
        </div>

        {plan ? (
          <NeuSurface style={{ padding: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: cc.text, margin: '0 0 8px' }}>{plan.title || 'OJT Training Plan'}</h3>
              <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}><BankOutlined /> {plan.enterpriseName} • Started: {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(plan.tasks || []).map((task: any, i: number) => (
                <div key={task.title || i} style={{ display: 'flex', gap: 12, padding: 16, borderRadius: cc.radiusMd, background: cc.bgLight, border: `1px solid ${cc.borderSubtle}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: cc.radiusFull, background: cc.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.primary, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: cc.text, margin: '0 0 4px' }}>{task.title}</h4>
                    <p style={{ fontSize: 12, color: cc.textMuted, margin: 0 }}>{task.description}</p>
                  </div>
                  {(() => {
                    let v: "success" | "info" | "warning" = "warning";
                    if (task.status === 'COMPLETED') v = 'success';
                    else if (task.status === 'IN_PROGRESS') v = 'info';
                    return <SmallBadge label={task.status || 'PENDING'} variant={v} />;
                  })()}
                </div>
              ))}
            </div>
          </NeuSurface>
        ) : (
          <EmptyState icon={<BookOutlined style={{ fontSize: 32 }} />} title="No training plan yet" description="Your training plan will appear once assigned by your enterprise" />
        )}
      </motion.div>
    </div>
  );
};

// ============================================================
// REPORTS TAB (UC-61, UC-62, UC-63)
// ============================================================
const ReportsTab: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [formData, setFormData] = useState({ weekNumber: '', content: '', attachments: [] as File[] });

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/weekly-reports/my-reports');
      setReports(res.data || []);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.weekNumber || !formData.content) {
      message.error('Please fill in all required fields!');
      return;
    }
    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('weekNumber', formData.weekNumber);
      data.append('content', formData.content);
      formData.attachments.forEach(f => data.append('files', f));
      await api.post('/weekly-reports', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      message.success('Report submitted successfully!');
      setShowForm(false);
      setFormData({ weekNumber: '', content: '', attachments: [] });
      fetchReports();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Submit failed!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (report: any) => {
    setEditingReport(report);
    setFormData({ weekNumber: String(report.weekNumber), content: report.content || '', attachments: [] });
  };

  const handleUpdate = async () => {
    if (!formData.content) {
      message.error('Report content cannot be empty!');
      return;
    }
    try {
      setSubmitting(true);
      await api.put(`/weekly-reports/${editingReport.reportId}`, { content: formData.content });
      message.success('Report updated successfully!');
      setEditingReport(null);
      setFormData({ weekNumber: '', content: '', attachments: [] });
      fetchReports();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Update failed!');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'SUBMITTED': return 'warning';
      default: return 'neutral';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'SUBMITTED': return 'Pending';
      case 'NOT_SUBMITTED': return 'Not Submitted';
      default: return status || 'Draft';
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: cc.text, margin: '0 0 6px' }}>Weekly Reports</h2>
          <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>Track your internship progress on a weekly basis (UC-61, UC-62, UC-63)</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <CTAButton variant="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>Submit Report</CTAButton>
        </div>

        {/* Submit Form Modal (UC-62) */}
        {showForm && (
          <NeuSurface style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: cc.text, margin: '0 0 16px' }}>Submit Weekly Report</h3>
            <div style={{ marginBottom: 16 }}>
              <div>Week Number *</div>
              <input type="number" value={formData.weekNumber} onChange={(e) => setFormData({ ...formData, weekNumber: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div>Report Content *</div>
              <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={5} placeholder="Describe your work progress this week..." style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <CTAButton variant="ghost" onClick={() => { setShowForm(false); setFormData({ weekNumber: '', content: '', attachments: [] }); }}>Cancel</CTAButton>
              <CTAButton variant="primary" icon={<SendOutlined />} onClick={handleSubmit} loading={submitting}>Submit</CTAButton>
            </div>
          </NeuSurface>
        )}

        {/* Edit Form Modal (UC-63) */}
        {editingReport && (
          <NeuSurface style={{ padding: 24, marginBottom: 20, border: `2px solid ${cc.warning}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: 12, borderRadius: cc.radiusMd, background: cc.warningMuted }}>
              <WarningOutlined style={{ fontSize: 20, color: cc.warning }} />
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: cc.warningText, margin: 0 }}>Edit Rejected Report</h3>
                <p style={{ fontSize: 12, color: cc.warningText, margin: '4px 0 0' }}>Week {editingReport.weekNumber} - Resubmit based on enterprise feedback</p>
              </div>
            </div>
            {editingReport.feedback && (
              <div style={{ marginBottom: 16, padding: 12, borderRadius: cc.radiusMd, background: cc.dangerMuted }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: cc.dangerText, margin: '0 0 6px' }}>Enterprise Feedback:</p>
                <p style={{ fontSize: 13, color: cc.dangerText, margin: 0 }}>{editingReport.feedback}</p>
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <div>Revised Content *</div>
              <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={5} placeholder="Revise your report based on the feedback..." style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <CTAButton variant="ghost" onClick={() => { setEditingReport(null); setFormData({ weekNumber: '', content: '', attachments: [] }); }}>Cancel</CTAButton>
              <CTAButton variant="warning" icon={<SendOutlined />} onClick={handleUpdate} loading={submitting}>Resubmit Report</CTAButton>
            </div>
          </NeuSurface>
        )}

        {reports.length === 0 ? (
          <EmptyState icon={<SnippetsOutlined style={{ fontSize: 32 }} />} title="No reports yet" description="Your weekly reports will appear once you start your internship" action={<CTAButton variant="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>Submit First Report</CTAButton>} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {reports.map((report, index) => (
              <motion.div key={report.reportId || index} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <NeuSurface style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ width: 52, height: 52, borderRadius: cc.radiusMd, background: hexToRgba(cc.primary, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.primary, fontSize: 14, fontWeight: 700 }}>
                        W{report.weekNumber}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 600, color: cc.text, margin: '0 0 4px' }}>Week {report.weekNumber} Report</h4>
                        <p style={{ fontSize: 12, color: cc.textMuted, margin: '0 0 8px' }}>Submitted: {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                        <SmallBadge label={getStatusLabel(report.status)} variant={getStatusVariant(report.status)} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: 'column' }}>
                      {report.feedback && (
                        <div style={{ fontSize: 12, color: cc.dangerText, maxWidth: 200, textAlign: 'right', padding: '4px 8px', background: cc.dangerMuted, borderRadius: cc.radiusSm }}>
                          {report.feedback.length > 60 ? report.feedback.substring(0, 60) + '...' : report.feedback}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 8 }}>
                        {report.status === 'REJECTED' && (
                          <CTAButton variant="warning" size="sm" icon={<EditOutlined />} onClick={() => handleEdit(report)}>Edit & Resubmit</CTAButton>
                        )}
                        <CTAButton variant="ghost" size="sm" icon={<EyeOutlined />}>View</CTAButton>
                      </div>
                    </div>
                  </div>
                </NeuSurface>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ============================================================
// FEEDBACK TAB (UC-59)
// ============================================================
const RatingInput: React.FC<{ label: string; value: number; onChange: (v: number) => void; required?: boolean }> = ({ label, value, onChange, required }) => (
  <div style={{ marginBottom: 16 }}>
    <div>
      {label} {required && <span style={{ color: cc.danger }}>*</span>}
    </div>
    <div style={{ display: 'flex', gap: 8 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} onClick={() => onChange(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, color: star <= value ? cc.warning : cc.border }}>
          <StarOutlined />
        </button>
      ))}
      <span style={{ fontSize: 13, color: cc.textMuted, marginLeft: 8, alignSelf: 'center' }}>{value}/5</span>
    </div>
  </div>
);

const FeedbackTab: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ratings, setRatings] = useState({ trainingQuality: 5, supervisorSupport: 5, workEnvironment: 5, overall: 5 });
  const [comment, setComment] = useState('');

  useEffect(() => { fetchFeedbacks(); }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/feedbacks/my-feedbacks');
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error('Failed to fetch feedbacks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // BR-55: Validate all ratings are 1-5
    const { trainingQuality, supervisorSupport, workEnvironment, overall } = ratings;
    if (!trainingQuality || !supervisorSupport || !workEnvironment || !overall) {
      message.error('Please complete all rating categories!');
      return;
    }
    if (trainingQuality < 1 || trainingQuality > 5 || supervisorSupport < 1 || supervisorSupport > 5 ||
        workEnvironment < 1 || workEnvironment > 5 || overall < 1 || overall > 5) {
      message.error('All ratings must be between 1 and 5 stars!');
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/feedbacks', { ...ratings, comment });
      message.success('Thank you! Your feedback has been submitted successfully.');
      setRatings({ trainingQuality: 5, supervisorSupport: 5, workEnvironment: 5, overall: 5 });
      setComment('');
      fetchFeedbacks();
    } catch (err: any) {
      if (err.response?.data?.message?.includes('already')) {
        message.error('You have already submitted feedback for this enterprise. You can only submit once per semester.');
      } else {
        message.error(err.response?.data?.message || 'Submit failed!');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: cc.text, margin: '0 0 6px' }}>Enterprise Feedback</h2>
          <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>Rate your internship experience (UC-59, BR-28, BR-53, BR-55)</p>
        </div>

        {/* Submit Feedback Form (UC-59) */}
        <NeuSurface style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: 12, borderRadius: cc.radiusMd, background: cc.infoMuted }}>
            <ExclamationCircleOutlined style={{ fontSize: 20, color: cc.info }} />
            <p style={{ fontSize: 12, color: cc.infoText, margin: 0 }}>Your feedback is confidential and only visible to the Training Manager (BR-28)</p>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: cc.text, margin: '0 0 16px' }}>Rate Your Internship Experience</h3>
          
          <RatingInput label="Training Quality" value={ratings.trainingQuality} onChange={(v) => setRatings({ ...ratings, trainingQuality: v })} required />
          <RatingInput label="Supervisor Support" value={ratings.supervisorSupport} onChange={(v) => setRatings({ ...ratings, supervisorSupport: v })} required />
          <RatingInput label="Work Environment" value={ratings.workEnvironment} onChange={(v) => setRatings({ ...ratings, workEnvironment: v })} required />
          
          <div style={{ borderTop: `1px solid ${cc.borderSubtle}`, paddingTop: 16, marginTop: 8 }}>
            <RatingInput label="Overall Rating" value={ratings.overall} onChange={(v) => setRatings({ ...ratings, overall: v })} required />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div>Written Comments (Optional)</div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="Share your detailed experience..." style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <CTAButton variant="ghost" onClick={() => { setRatings({ trainingQuality: 5, supervisorSupport: 5, workEnvironment: 5, overall: 5 }); setComment(''); }}>Clear</CTAButton>
            <CTAButton variant="primary" icon={<SendOutlined />} onClick={handleSubmit} loading={submitting}>Submit Feedback</CTAButton>
          </div>
        </NeuSurface>

        {/* Feedback List */}
        {feedbacks.length === 0 ? (
          <EmptyState icon={<StarOutlined style={{ fontSize: 32 }} />} title="No feedback yet" description="Company feedback will appear after you complete your internship" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {feedbacks.map((fb, index) => (
              <motion.div key={fb.feedbackId || index} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <NeuSurface style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 18 }}>{'★'.repeat(fb.rating || 0)}</span>
                        <SmallBadge label={fb.isAnonymous ? 'Anonymous' : fb.enterpriseName || 'Company'} variant="info" />
                      </div>
                      <p style={{ fontSize: 14, color: cc.text, margin: 0, lineHeight: 1.5 }}>{fb.comment}</p>
                      <p style={{ fontSize: 12, color: cc.textMuted, margin: '8px 0 0' }}>{fb.createdAt ? new Date(fb.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                    </div>
                  </div>
                </NeuSurface>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ============================================================
// FINAL REPORT TAB (UC-64)
// ============================================================
const FinalReportTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finalReport, setFinalReport] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => { fetchFinalReport(); }, []);

  const fetchFinalReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/final-reports/my-report');
      setFinalReport(res.data);
    } catch (err) {
      console.error('Failed to fetch final report', err);
      setFinalReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      // BR-50: Must be PDF format
      if (f.type !== 'application/pdf') {
        message.error('Invalid file. Please upload your final report strictly in PDF format under 20MB.');
        return;
      }
      // BR-45: File size limit 20MB
      if (f.size > 20 * 1024 * 1024) {
        message.error('File too large. Final report must not exceed 20MB.');
        return;
      }
      setFile(f);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      message.error('Please upload your final report PDF!');
      return;
    }
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/final-reports', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      message.success('Final report submitted successfully!');
      fetchFinalReport();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Submit failed!');
    } finally {
      setSubmitting(false);
      setFile(null);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: cc.text, margin: '0 0 6px' }}>Final Internship Report</h2>
          <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>Compile and submit your official final internship report (PDF) for academic grading (UC-64)</p>
        </div>

        {/* Instructions */}
        <NeuSurface style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: cc.text, margin: '0 0 12px' }}>Report Requirements</h3>
          <ul style={{ fontSize: 13, color: cc.textMuted, margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
            <li>File format: <strong>PDF only</strong> (BR-50)</li>
            <li>Maximum file size: <strong>20MB</strong> (BR-45)</li>
            <li>Include: Cover page, table of contents, weekly summaries, learning outcomes</li>
            <li>Must be approved by your enterprise supervisor before submission</li>
          </ul>
        </NeuSurface>

        {/* Upload Area */}
        <NeuSurface style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: cc.radiusMd, background: cc.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.primary }}>
              <FileOutlined style={{ fontSize: 20 }} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: cc.text, margin: 0 }}>Upload Final Report</h3>
              <p style={{ fontSize: 12, color: cc.textMuted, margin: '2px 0 0' }}>Submit your completed internship report in PDF format</p>
            </div>
          </div>

          <div
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('final-report-input')?.click()}
            style={{
              border: `2px dashed ${dragActive ? cc.primary : cc.border}`,
              borderRadius: cc.radiusLg, padding: '36px 24px', textAlign: 'center',
              background: dragActive ? cc.primaryMuted : cc.bgLight,
              transition: 'all 0.2s ease', cursor: 'pointer',
            }}
          >
            <input id="final-report-input" type="file" accept=".pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) { if (f.type !== 'application/pdf') message.error('Only PDF allowed! (BR-50)'); else if (f.size > 20 * 1024 * 1024) message.error('Max 20MB allowed! (BR-45)'); else setFile(f); }}} style={{ display: 'none' }} />
            {file ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <FileOutlined style={{ fontSize: 32, color: cc.success }} />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: cc.text, margin: 0 }}>{file.name}</p>
                  <p style={{ fontSize: 12, color: cc.textMuted, margin: '2px 0 0' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <>
                <UploadOutlined style={{ fontSize: 40, color: cc.textMuted, marginBottom: 12 }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: cc.text, margin: '0 0 4px' }}>Drag & drop your final report here</p>
                <p style={{ fontSize: 12, color: cc.textMuted, margin: 0 }}>or click to browse files</p>
              </>
            )}
          </div>
          {file && (
            <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <CTAButton variant="ghost" onClick={() => setFile(null)}>Cancel</CTAButton>
              <CTAButton variant="primary" icon={<UploadOutlined />} onClick={handleSubmit} loading={submitting}>Submit Report</CTAButton>
            </div>
          )}
        </NeuSurface>

        {/* Submitted Report */}
        {finalReport && (
          <NeuSurface style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: cc.text, margin: 0 }}>Submitted Report</h3>
              {(() => {
                let v: "success" | "error" | "warning" = "warning";
                if (finalReport.status === 'APPROVED') v = 'success';
                else if (finalReport.status === 'REJECTED') v = 'error';
                return <SmallBadge label={finalReport.status || 'SUBMITTED'} variant={v} />;
              })()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: cc.radiusMd, background: cc.bgLight }}>
              <FileOutlined style={{ fontSize: 32, color: cc.primary }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: cc.text, margin: 0 }}>{finalReport.fileName || 'Final_Report.pdf'}</p>
                <p style={{ fontSize: 12, color: cc.textMuted, margin: '4px 0 0' }}>Submitted: {finalReport.submittedAt ? new Date(finalReport.submittedAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              <CTAButton variant="ghost" size="sm" icon={<EyeOutlined />} onClick={() => window.open(finalReport.fileUrl, '_blank')}>View</CTAButton>
            </div>
          </NeuSurface>
        )}
      </motion.div>
    </div>
  );
};

// ============================================================
// EVALUATION TAB (UC-65)
// ============================================================
const EvaluationTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState<any>(null);

  useEffect(() => { fetchEvaluation(); }, []);

  const fetchEvaluation = async () => {
    try {
      setLoading(true);
      const res = await api.get('/evaluations/my-evaluation');
      setEvaluation(res.data);
    } catch (err) {
      console.error('Failed to fetch evaluation', err);
      setEvaluation(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  const rubricScores = evaluation?.rubricScores || [
    { name: 'Weekly Reports (20%)', score: 18, maxScore: 20 },
    { name: 'Final Report (25%)', score: 22, maxScore: 25 },
    { name: 'Enterprise Evaluation (30%)', score: 27, maxScore: 30 },
    { name: 'Final Presentation (15%)', score: 14, maxScore: 15 },
    { name: 'Documentation (10%)', score: 9, maxScore: 10 },
  ];

  const totalScore = rubricScores.reduce((sum: number, r: any) => sum + r.score, 0);
  const maxScore = rubricScores.reduce((sum: number, r: any) => sum + r.maxScore, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A', color: cc.success };
    if (pct >= 80) return { grade: 'B', color: cc.info };
    if (pct >= 70) return { grade: 'C', color: cc.warning };
    if (pct >= 60) return { grade: 'D', color: '#f97316' };
    return { grade: 'F', color: cc.danger };
  };

  const { grade, color } = getGrade(percentage);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: cc.text, margin: '0 0 6px' }}>Internship Evaluation</h2>
          <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>View final Rubrics scores, enterprise feedback, and official course grades (UC-65)</p>
        </div>

        {evaluation ? (
          <>
            {/* Grade Overview */}
            <NeuSurface style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ width: 100, height: 100, borderRadius: cc.radiusXl, background: `linear-gradient(135deg, ${color}20, ${color}10)`, border: `3px solid ${color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1 }}>{grade}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: cc.textMuted, marginTop: 4 }}>{percentage}%</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: cc.text, margin: '0 0 8px' }}>Final Grade: {grade}</h3>
                  <p style={{ fontSize: 13, color: cc.textMuted, margin: 0, lineHeight: 1.6 }}>
                    Total Score: {totalScore}/{maxScore} points
                  </p>
                  <div style={{ marginTop: 12, height: 8, borderRadius: 4, background: cc.borderSubtle, overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </div>
            </NeuSurface>

            {/* Rubric Scores */}
            <NeuSurface style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: cc.text, margin: '0 0 16px' }}>Rubric Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {rubricScores.map((rubric: any) => {
                  const pct = Math.round((rubric.score / rubric.maxScore) * 100);
                  const rubricColor = pct >= 80 ? cc.success : pct >= 60 ? cc.warning : cc.danger;
                  return (
                    <div key={rubric.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: cc.text }}>{rubric.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: rubricColor }}>{rubric.score}/{rubric.maxScore}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: cc.borderSubtle, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: rubricColor, borderRadius: 3, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </NeuSurface>

            {/* Enterprise Feedback */}
            {evaluation.enterpriseFeedback && (
              <NeuSurface style={{ padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: cc.text, margin: '0 0 12px' }}>Enterprise Feedback</h3>
                <p style={{ fontSize: 13, color: cc.textMuted, lineHeight: 1.6, margin: 0 }}>{evaluation.enterpriseFeedback}</p>
              </NeuSurface>
            )}

            {/* TM Feedback */}
            {evaluation.tmFeedback && (
              <NeuSurface style={{ padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: cc.text, margin: '0 0 12px' }}>Training Manager Feedback</h3>
                <p style={{ fontSize: 13, color: cc.textMuted, lineHeight: 1.6, margin: 0 }}>{evaluation.tmFeedback}</p>
              </NeuSurface>
            )}
          </>
        ) : (
          <EmptyState icon={<TrophyOutlined style={{ fontSize: 32 }} />} title="Evaluation not available" description="Your final evaluation will appear after you complete your internship and submit all required reports" />
        )}
      </motion.div>
    </div>
  );
};

// ============================================================
// SETTINGS TAB (UC-05)
// ============================================================
const SettingsTab: React.FC = () => {
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
      await api.put('/users/change-password', { currentPassword: formData.currentPassword, newPassword: formData.newPassword });
      message.success('Password changed successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to change password!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
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
              <p style={{ fontSize: 12, color: cc.textMuted, margin: '2px 0 0' }}>Update your account password (BR-04)</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div>Current Password</div>
              <input type="password" value={formData.currentPassword} onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13 }} />
            </div>
            <div>
              <div>New Password</div>
              <input type="password" value={formData.newPassword} onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13 }} />
            </div>
            <div>
              <div>Confirm New Password</div>
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
      </motion.div>
    </div>
  );
};

// ============================================================
// MAIN STUDENT DASHBOARD
// ============================================================
export const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState({ applications: 0, interviews: 0, reports: 0, daysRemaining: 0 });

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/student-stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
      setStats({ applications: 3, interviews: 1, reports: 4, daysRemaining: 28 });
    }
  };

  const navItems: NavItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <CalendarOutlined /> },
    { key: 'profile', label: 'Profile', icon: <UserOutlined /> },
    { key: 'jobs', label: 'Job Board', icon: <TrophyOutlined /> },
    { key: 'applications', label: 'Applications', icon: <FileTextOutlined /> },
    { key: 'schedule', label: 'Interview', icon: <CalendarOutlined /> },
    { key: 'training-plan', label: 'Training', icon: <BookOutlined /> },
    { key: 'reports', label: 'Reports', icon: <SnippetsOutlined /> },
    { key: 'final-report', label: 'Final Report', icon: <FileOutlined /> },
    { key: 'evaluation', label: 'Evaluation', icon: <TrophyOutlined /> },
    { key: 'feedback', label: 'Feedback', icon: <CheckCircleOutlined /> },
    { key: 'settings', label: 'Settings', icon: <SettingOutlined /> },
  ];

  const sparklineData = [12, 19, 15, 22, 18, 25, 20];

  const tabComponents: Record<string, React.ReactNode> = {
    dashboard: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all .4s ease-out' }}>
        <style>{`
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; align-items: stretch; }
          .bottom-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; align-items: stretch; }
          @media (max-width: 1024px) {
            .kpi-grid { grid-template-columns: repeat(2, 1fr); }
            .bottom-grid { grid-template-columns: 1fr; }
          }
          @media (max-width: 640px) {
            .kpi-grid { grid-template-columns: 1fr; }
          }
        `}</style>

        {/* HERO CARD */}
        <div style={{ position: 'relative', padding: '28px 30px', borderRadius: 28, background: 'linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(255,244,236,.92) 48%, rgba(255,250,246,.96) 100%)', border: '1px solid rgba(233,101,0,.12)', boxShadow: '0 20px 50px rgba(15,23,42,.10), 0 8px 22px rgba(233,101,0,.10)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at top right, rgba(233,101,0,.14), transparent 30%), radial-gradient(circle at 20% 20%, rgba(255,138,90,.10), transparent 25%)' }} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: 'linear-gradient(180deg, #FF662C, #FF824D, #FF9B73)' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'stretch', flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0, flex: '1 1 480px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 999, background: 'rgba(233,101,0,.08)', color: cc.primaryDark, fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
                  <CalendarOutlined /> Summer 2026
                </div>
                <h1 style={{ fontSize: 34, lineHeight: 1.06, fontWeight: 900, color: cc.text, margin: 0, letterSpacing: '-1.2px' }}>Your internship journey, at a glance.</h1>
                <p style={{ fontSize: 14.5, color: cc.textMuted, marginTop: 10, maxWidth: 720, lineHeight: 1.7 }}>
                  {stats.applications} applications, {stats.interviews} interviews scheduled, {stats.reports} reports submitted this semester.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
                <HeroMiniCard label="Applications" value={stats.applications} delay={0.1} />
                <HeroMiniCard label="Interviews" value={stats.interviews} delay={0.2} />
                <HeroMiniCard label="Reports" value={stats.reports} delay={0.3} />
                <HeroMiniCard label="Days Left" value={stats.daysRemaining} delay={0.4} />
              </div>
            </div>
            <div style={{ flex: '0 1 320px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <motion.div whileHover={{ y: -2, transition: { duration: 0.2 }, boxShadow: '0 8px 24px rgba(15,23,42,.12)' }} style={{ padding: 16, borderRadius: 20, background: 'rgba(255,255,255,.72)', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 6px 18px rgba(15,23,42,.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: cc.textMuted, fontWeight: 700 }}>Progress</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: cc.text, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>68%</div>
                    <div style={{ fontSize: 12, color: cc.success, fontWeight: 700, marginTop: 4 }}>On track</div>
                  </div>
                  <div style={{ width: 62, height: 62, borderRadius: 18, background: `linear-gradient(135deg, ${cc.primary}26, ${cc.primaryLight}10)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrophyOutlined style={{ fontSize: 22, color: cc.primary }} />
                  </div>
                </div>
                <div style={{ marginTop: 12 }}><Sparkline data={sparklineData} color={cc.primary} width={260} height={42} /></div>
              </motion.div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'stretch' }}>
                <motion.div whileHover={{ y: -2, transition: { duration: 0.2 }, boxShadow: '0 8px 24px rgba(15,23,42,.12)' }} style={{ padding: 14, borderRadius: 18, background: 'rgba(255,255,255,.72)', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 6px 18px rgba(15,23,42,.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 80 }}>
                  <div>
                    <div style={{ fontSize: 12, color: cc.textMuted, fontWeight: 700 }}>Status</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: cc.success, lineHeight: 1.1, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>Active</div>
                  </div>
                  <div style={{ fontSize: 12, color: cc.success, marginTop: 4, fontWeight: 600 }}>Internship running</div>
                </motion.div>
                <motion.div whileHover={{ y: -2, transition: { duration: 0.2 }, boxShadow: '0 8px 24px rgba(15,23,42,.12)' }} style={{ padding: 14, borderRadius: 18, background: 'rgba(255,255,255,.72)', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 6px 18px rgba(15,23,42,.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 80 }}>
                  <div>
                    <div style={{ fontSize: 12, color: cc.textMuted, fontWeight: 700 }}>Reports Due</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: cc.warning, lineHeight: 1.1, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>1</div>
                  </div>
                  <div style={{ fontSize: 12, color: cc.warning, marginTop: 4, fontWeight: 600 }}>This week</div>
                </motion.div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <CTAButton variant="primary" icon={<PlusOutlined />} onClick={() => setActiveTab('reports')}>Submit Report</CTAButton>
                <CTAButton variant="ghost" icon={<SearchOutlined />} onClick={() => setActiveTab('jobs')}>Browse Jobs</CTAButton>
              </div>
            </div>
          </div>
        </div>

        {/* 4 KPI STAT CARDS */}
        <div className="kpi-grid">
          <AnimatedStatCard label="Applications" value={stats.applications} icon={<FileTextOutlined style={{ fontSize: 20 }} />} color={cc.info} trend="Total" insight="Job applications sent" sparkline={[1, 2, 1, 3, 2, 3, 3]} delay={100} />
          <AnimatedStatCard label="Interviews" value={stats.interviews} icon={<CalendarOutlined style={{ fontSize: 20 }} />} color={cc.warning} trend="Scheduled" insight="Upcoming interviews" sparkline={[0, 0, 1, 1, 0, 1, 1]} delay={200} />
          <AnimatedStatCard label="Reports Submitted" value={stats.reports} icon={<SnippetsOutlined style={{ fontSize: 20 }} />} color={cc.success} trend="This semester" insight="Weekly reports completed" sparkline={[0, 1, 2, 2, 3, 4, 4]} delay={300} />
          <AnimatedStatCard label="Days Remaining" value={stats.daysRemaining} icon={<ClockCircleOutlined style={{ fontSize: 20 }} />} color={cc.primary} trend="Until end" insight="OJT duration" sparkline={[90, 85, 80, 75, 70, 65, 60]} delay={400} />
        </div>

        {/* BOTTOM ROW */}
        <div className="bottom-grid">
          <NeuSurface style={{ padding: 24, opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all .4s ease-out .3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: cc.text, margin: 0 }}>Report Progress</h2>
                <span style={{ fontSize: 12, color: cc.textMuted }}>Weekly submission trend</span>
              </div>
              <SmallPill color={cc.success} glow>Live tracking</SmallPill>
            </div>
            <div style={{ height: 170 }}><AreaChart data={[0, 1, 2, 2, 3, 4, 4]} color={cc.primary} /></div>
          </NeuSurface>

          <NeuSurface style={{ padding: 24, opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all .4s ease-out .4s', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: cc.text, margin: 0 }}>Recent Activity</h2>
              <SmallPill color={cc.warning}>Live</SmallPill>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {[
                { title: 'Application submitted to TechCorp', meta: '2 hours ago', tone: cc.info },
                { title: 'Weekly report W22 approved', meta: 'Yesterday', tone: cc.success },
                { title: 'Interview scheduled for Jul 15', meta: '3 days ago', tone: cc.warning },
              ].map((item) => (
                <motion.div key={item.title} whileHover={{ x: 2, transition: { duration: 0.15 } }} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 16, background: '#fff', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 4px 16px rgba(15,23,42,.04)', cursor: 'pointer' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.tone, boxShadow: `0 0 0 4px ${item.tone}20`, marginTop: 4 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: cc.text }}>{item.title}</div>
                    <div style={{ fontSize: 11.5, color: cc.textMuted, marginTop: 3 }}>{item.meta}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </NeuSurface>
        </div>
      </div>
    ),

    profile: <ProfileTab />,
    jobs: <JobBoardTab />,
    applications: <ApplicationsTab />,
    schedule: <ScheduleTab />,
    'training-plan': <TrainingPlanTab />,
    reports: <ReportsTab />,
    'final-report': <FinalReportTab />,
    evaluation: <EvaluationTab />,
    feedback: <FeedbackTab />,
    settings: <SettingsTab />,
  };

  return (
    <div style={{ minHeight: '100vh', background: cc.bg }}>
      {/* Top Navigation */}
      <div style={{ background: cc.surface, borderBottom: `1px solid ${cc.border}`, padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', maxWidth: 1200, margin: '0 auto' }}>
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '14px 16px',
                background: 'none', border: 'none', borderBottom: activeTab === item.key ? `3px solid ${cc.primary}` : '3px solid transparent',
                color: activeTab === item.key ? cc.primary : cc.textMuted,
                fontSize: 13, fontWeight: activeTab === item.key ? 700 : 500,
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease',
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 40px' }}>
        {tabComponents[activeTab] || tabComponents['dashboard']}
      </div>
    </div>
  );
};

export default StudentDashboard;
