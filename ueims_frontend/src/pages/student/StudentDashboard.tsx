import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { message } from 'antd';
import { ModernLayout } from '@/components/layout/ModernLayout';
import type { NavItem } from '@/components/layout/ModernLayout';
import {
  User,
  Briefcase,
  FileText,
  Settings,
  Home,
  Calendar,
  CheckCircle,
  Clock,
  Send,
  X,
  Upload,
  File,
  MapPin,
  Users,
  Star,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  Eye,
  Inbox,
  TrendingUp,
  Award,
} from 'lucide-react';
import { api } from '@/services/api';

// ============================================================
// DESIGN TOKENS — Student Portal (aligned with TM cc / constants)
// ============================================================
const cc = {
  // Brand
  primary: '#E96500',
  primaryHover: '#CC5800',
  primaryLight: '#FFF3E8',
  brand: '#FF7A30',
  brandStrong: '#9B4A10',

  // Semantic
  success: '#22c55e',
  successMuted: '#dcfce7',
  successText: '#166534',
  warning: '#f59e0b',
  warningMuted: '#fef3c7',
  warningText: '#92400e',
  error: '#ef4444',
  errorMuted: '#fee2e2',
  errorText: '#991b1b',
  info: '#3b82f6',
  infoMuted: '#dbeafe',
  infoText: '#1e40af',

  // Neutrals
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  surface: '#ffffff',
  bg: '#f8fafc',
  border: '#e2e8f0',
  borderSubtle: '#f1f5f9',

  // Radii
  radiusSm: 6,
  radiusMd: 8,
  radiusLg: 12,
  radiusXl: 16,
  radius2xl: 22,
  radiusFull: 9999,

  // Shadows
  shadowSm: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  shadowMd: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
  shadowLg: '0 10px 20px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)',
  shadowXl: '0 20px 40px rgba(0,0,0,0.10), 0 8px 16px rgba(0,0,0,0.06)',
  shadowBrand: '0 4px 12px rgba(233,101,0,0.22)',
  shadowSuccess: '0 4px 12px rgba(34,197,94,0.22)',
  shadowError: '0 4px 12px rgba(239,68,68,0.22)',
  shadowWarning: '0 4px 12px rgba(245,158,11,0.22)',
};

// ============================================================
// HELPER UTILITIES
// ============================================================
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================
// SHARED UI COMPONENTS (matching TM quality)
// ============================================================
const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  hoverable?: boolean;
}> = ({ children, className = '', style, onClick, hoverable = false }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      className={className}
      onClick={onClick}
      onMouseEnter={() => hoverable && setHovered(true)}
      onMouseLeave={() => hoverable && setHovered(false)}
      animate={{
        y: hovered && hoverable ? -2 : 0,
        boxShadow: hovered && hoverable ? cc.shadowMd : cc.shadowSm,
      }}
      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
      style={{
        background: cc.surface,
        borderRadius: cc.radiusLg,
        border: `1px solid ${cc.border}`,
        boxShadow: cc.shadowSm,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
};

const NeuSurface: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className = '', style }) => (
  <div
    className={className}
    style={{
      background: cc.surface,
      borderRadius: cc.radius2xl,
      boxShadow: '0 4px 20px rgba(15,23,42,.06)',
      border: '1px solid rgba(226,232,240,.9)',
      ...style,
    }}
  >
    {children}
  </div>
);

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  trendUp?: boolean;
}> = ({ label, value, icon, color, trend, trendUp }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <Card style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: cc.radiusMd,
          background: hexToRgba(color, 0.12),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px' }}>
            {label}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: cc.textPrimary, margin: 0, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {value}
            </p>
            {trend && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                fontSize: 11,
                fontWeight: 600,
                color: trendUp ? cc.success : cc.error,
                background: trendUp ? cc.successMuted : cc.errorMuted,
                padding: '2px 6px',
                borderRadius: cc.radiusFull,
              }}>
                <TrendingUp size={10} style={{ transform: trendUp ? 'none' : 'rotate(180deg)' }} />
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

const SectionTitle: React.FC<{ children: React.ReactNode; action?: React.ReactNode }> = ({ children, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
    <h3 style={{ fontSize: 15, fontWeight: 600, color: cc.textPrimary, margin: 0 }}>{children}</h3>
    {action}
  </div>
);

const TextLink: React.FC<{ children: React.ReactNode; onClick?: () => void; icon?: React.ReactNode }> = ({ children, onClick, icon }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ opacity: 0.75, x: 2 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.15 }}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 12,
      fontWeight: 600,
      color: cc.primary,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
    }}
  >
    {children}
    {icon || <ArrowRight size={13} />}
  </motion.button>
);

const SmallPill: React.FC<{ label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' }> = ({ label, variant }) => {
  const map: Record<string, { bg: string; color: string }> = {
    success: { bg: cc.successMuted, color: cc.successText },
    warning: { bg: cc.warningMuted, color: cc.warningText },
    error: { bg: cc.errorMuted, color: cc.errorText },
    info: { bg: cc.infoMuted, color: cc.infoText },
    neutral: { bg: cc.borderSubtle, color: cc.textSecondary },
  };
  const { bg, color } = map[variant];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 8px',
      borderRadius: cc.radiusFull,
      background: bg,
      color,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      {label}
    </span>
  );
};

const CTAButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', size = 'md', fullWidth = false, icon, disabled = false }) => {
  const styles: Record<string, { bg: string; text: string; border: string; shadow: string }> = {
    primary: { bg: cc.primary, text: '#fff', border: 'transparent', shadow: cc.shadowBrand },
    ghost: { bg: 'transparent', text: cc.primary, border: cc.border, shadow: 'none' },
    success: { bg: cc.success, text: '#fff', border: 'transparent', shadow: cc.shadowSuccess },
    danger: { bg: cc.error, text: '#fff', border: 'transparent', shadow: cc.shadowError },
  };
  const { bg, text, border, shadow } = styles[variant];
  const sizes = { sm: { padding: '6px 12px', fontSize: 12 }, md: { padding: '9px 16px', fontSize: 13 }, lg: { padding: '11px 20px', fontSize: 14 } };
  const { padding, fontSize } = sizes[size];

  return (
    <motion.button
      onClick={onClick}
      whileHover={disabled ? {} : { y: -1, boxShadow: shadow }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding,
        fontSize,
        fontWeight: 600,
        color: disabled ? cc.textMuted : text,
        background: disabled ? cc.borderSubtle : bg,
        border: `1px solid ${border}`,
        borderRadius: cc.radiusMd,
        boxShadow: variant === 'ghost' ? 'none' : shadow,
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        justifyContent: 'center',
        fontFamily: "'Inter', -apple-system, sans-serif",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </motion.button>
  );
};

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }> = ({ icon, title, description, action }) => (
  <Card style={{ padding: 56, textAlign: 'center' }}>
    <div style={{
      width: 72,
      height: 72,
      borderRadius: '50%',
      background: cc.primaryLight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      color: cc.primary,
    }}>
      {icon}
    </div>
    <h3 style={{ fontSize: 16, fontWeight: 600, color: cc.textPrimary, margin: '0 0 6px' }}>{title}</h3>
    <p style={{ fontSize: 13, color: cc.textMuted, margin: '0 0 20px', maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>{description}</p>
    {action}
  </Card>
);

// ============================================================
// PROFILE TAB
// ============================================================
const ProfileTab: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/myInfo');
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') return 'Only PDF files are accepted!';
    if (file.size > 5 * 1024 * 1024) return 'CV file must not exceed 5MB!';
    return null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) { message.error(error); return; }
      setCvFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <RefreshCw size={28} color={cc.primary} />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Profile Header */}
        <Card style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{
              width: 80, height: 80,
              borderRadius: cc.radiusLg,
              background: `linear-gradient(135deg, ${cc.primary}, ${cc.primaryHover})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 28, fontWeight: 800, flexShrink: 0,
              boxShadow: cc.shadowBrand,
            }}>
              {profile?.fullName?.substring(0, 2).toUpperCase() || 'ST'}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: cc.textPrimary, margin: '0 0 4px' }}>
                {profile?.fullName || 'Student'}
              </h2>
              <p style={{ fontSize: 13, color: cc.textMuted, margin: '0 0 10px' }}>
                {profile?.email || 'email@student.fpt.edu.vn'}
              </p>
              <SmallPill label="Active Intern" variant="success" />
            </div>
          </div>
        </Card>

        {/* CV Upload */}
        <Card style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 44, height: 44, borderRadius: cc.radiusMd,
              background: hexToRgba(cc.info, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.info,
            }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: cc.textPrimary, margin: 0 }}>Your CV / Resume</h3>
              <p style={{ fontSize: 12, color: cc.textMuted, margin: '2px 0 0' }}>Upload in PDF format, max 5MB</p>
            </div>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('cv-input')?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if(e.key === 'Enter') document.getElementById('cv-input')?.click(); }}
            style={{
              border: `2px dashed ${dragActive ? cc.primary : cc.border}`,
              borderRadius: cc.radiusLg,
              padding: '36px 24px',
              textAlign: 'center',
              background: dragActive ? cc.primaryLight : cc.bg,
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
          >
            <input id="cv-input" type="file" accept=".pdf" onChange={handleFileSelect} style={{ display: 'none' }} />

            {cvFile ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <File size={32} color={cc.success} />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: cc.textPrimary, margin: 0 }}>{cvFile.name}</p>
                  <p style={{ fontSize: 12, color: cc.textMuted, margin: '2px 0 0' }}>{(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setCvFile(null); }}
                  style={{
                    marginLeft: 8, padding: 8, borderRadius: cc.radiusMd,
                    background: cc.errorMuted, border: 'none', cursor: 'pointer', color: cc.error,
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={40} color={cc.textMuted} style={{ marginBottom: 12 }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: cc.textPrimary, margin: '0 0 4px' }}>Drag & drop your CV here</p>
                <p style={{ fontSize: 12, color: cc.textMuted, margin: 0 }}>or click to browse files</p>
              </>
            )}
          </div>

          {cvFile && (
            <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <CTAButton variant="ghost" onClick={() => { setCvFile(null); }}>Cancel</CTAButton>
              <CTAButton variant="primary" onClick={handleUploadCV} disabled={uploading} icon={uploading ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><RefreshCw size={14} /></motion.span> : <Upload size={14} />}>
                {uploading ? 'Uploading...' : 'Upload CV'}
              </CTAButton>
            </div>
          )}

          {profile?.cvFileUrl && !cvFile && (
            <div style={{
              marginTop: 20, padding: 16, borderRadius: cc.radiusMd,
              background: cc.successMuted, border: `1px solid ${hexToRgba(cc.success, 0.2)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckCircle size={20} color={cc.success} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: cc.successText, margin: 0 }}>CV uploaded</p>
                  <p style={{ fontSize: 12, color: cc.successText, opacity: 0.8, margin: '2px 0 0' }}>{profile.cvFileName || 'cv_document.pdf'}</p>
                </div>
              </div>
              <CTAButton variant="ghost" size="sm" icon={<Eye size={14} />} onClick={() => window.open(profile.cvFileUrl, '_blank')}>View</CTAButton>
            </div>
          )}
        </Card>

        {/* Skills */}
        <Card style={{ padding: 24 }}>
          <SectionTitle>Skills</SectionTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['React', 'TypeScript', 'Node.js', 'Java', 'Python', 'SQL'].map((skill) => (
              <span key={skill} style={{
                padding: '6px 14px', borderRadius: cc.radiusFull,
                background: cc.primaryLight, color: cc.primary,
                fontSize: 12, fontWeight: 600,
              }}>
                {skill}
              </span>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

// ============================================================
// JOB BOARD TAB
// ============================================================
const JobBoardTab: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applying, setApplying] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/job-posts/active');
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    try {
      setApplying(true);
      await api.post('/applications', { jobPostId: selectedJob.jobPostId, cvFileUrl: selectedJob.appliedCvUrl });
      message.success('Application submitted successfully!');
      setShowConfirmModal(false);
      setSelectedJob(null);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Application failed!');
    } finally {
      setApplying(false);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.enterpriseName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <RefreshCw size={28} color={cc.primary} />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: cc.textPrimary, margin: '0 0 6px' }}>Job Board</h2>
          <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>Find the perfect internship opportunity for you</p>
        </div>

        {/* Search */}
        <Card style={{ padding: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              placeholder="Search by position, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: cc.radiusMd,
                border: `1px solid ${cc.border}`, fontSize: 13, outline: 'none',
                fontFamily: "'Inter', sans-serif", color: cc.textPrimary,
              }}
            />
            <CTAButton variant="primary" icon={<span style={{ fontSize: 16 }}>🔍</span>}>Search</CTAButton>
          </div>
        </Card>

        {/* Job Grid */}
        {filteredJobs.length === 0 ? (
          <EmptyState
            icon={<Inbox size={32} />}
            title="No job postings found"
            description={searchTerm ? 'Try adjusting your search terms' : 'No active internship positions available at the moment'}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.jobPostId || index}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card hoverable onClick={() => setSelectedJob(job)} style={{ padding: 20 }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: cc.radiusMd,
                      background: hexToRgba(cc.primary, 0.1),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: cc.primary, fontSize: 20, fontWeight: 700, flexShrink: 0,
                    }}>
                      {job.enterpriseName?.charAt(0) || 'E'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{
                        fontSize: 14, fontWeight: 600, color: cc.textPrimary, margin: '0 0 2px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {job.title || 'Internship Position'}
                      </h4>
                      <p style={{
                        fontSize: 12, color: cc.textMuted, margin: 0,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {job.enterpriseName || 'Company'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                    {job.location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: cc.textMuted }}>
                        <MapPin size={12} />{job.location}
                      </span>
                    )}
                    {job.maxPositions && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: cc.textMuted }}>
                        <Users size={12} />{job.maxPositions} positions
                      </span>
                    )}
                  </div>

                  <p style={{
                    fontSize: 13, color: cc.textSecondary, margin: '0 0 14px', lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {job.description || 'Job description...'}
                  </p>

                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: 14, borderTop: `1px solid ${cc.borderSubtle}`,
                  }}>
                    <SmallPill label={job.status === 'OPEN' ? 'Open' : 'Closed'} variant={job.status === 'OPEN' ? 'success' : 'neutral'} />
                    <TextLink onClick={() => setSelectedJob(job)}>View details <ChevronRight size={13} /></TextLink>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Job Detail Drawer */}
      {selectedJob && (
        <div
          onClick={() => setSelectedJob(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if(e.key === 'Escape' || e.key === 'Enter') setSelectedJob(null); }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: cc.surface, borderRadius: `${cc.radiusXl}px ${cc.radiusXl}px 0 0`,
              maxWidth: 600, width: '100%', maxHeight: '85vh', overflow: 'auto', padding: 28,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: cc.radiusLg,
                  background: hexToRgba(cc.primary, 0.1), display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: cc.primary,
                  fontSize: 24, fontWeight: 700, flexShrink: 0,
                }}>
                  {selectedJob.enterpriseName?.charAt(0) || 'E'}
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: cc.textPrimary, margin: '0 0 4px' }}>{selectedJob.title}</h2>
                  <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>{selectedJob.enterpriseName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedJob(null)} style={{
                padding: 8, borderRadius: cc.radiusMd, background: cc.bg, border: 'none', cursor: 'pointer', color: cc.textMuted,
              }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              {selectedJob.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: cc.radiusMd, background: cc.bg, fontSize: 13, color: cc.textSecondary }}>
                  <MapPin size={14} color={cc.textMuted} />{selectedJob.location}
                </span>
              )}
              {selectedJob.maxPositions && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: cc.radiusMd, background: cc.bg, fontSize: 13, color: cc.textSecondary }}>
                  <Users size={14} color={cc.textMuted} />{selectedJob.maxPositions} positions
                </span>
              )}
            </div>

            {selectedJob.description && (
              <div style={{ marginBottom: 18 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: cc.textPrimary, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</h3>
                <p style={{ fontSize: 13, color: cc.textSecondary, lineHeight: 1.6, margin: 0 }}>{selectedJob.description}</p>
              </div>
            )}

            {selectedJob.requirements && (
              <div style={{ marginBottom: 18 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: cc.textPrimary, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Requirements</h3>
                <p style={{ fontSize: 13, color: cc.textSecondary, lineHeight: 1.6, margin: 0 }}>{selectedJob.requirements}</p>
              </div>
            )}

            {selectedJob.benefits && (
              <div style={{ marginBottom: 18 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: cc.textPrimary, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Benefits</h3>
                <p style={{ fontSize: 13, color: cc.textSecondary, lineHeight: 1.6, margin: 0 }}>{selectedJob.benefits}</p>
              </div>
            )}

            {selectedJob.applicationDeadline && (
              <div style={{
                padding: 16, borderRadius: cc.radiusMd, background: cc.warningMuted,
                marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <Clock size={20} color={cc.warning} />
                <div>
                  <p style={{ fontSize: 11, color: cc.warningText, margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Application Deadline</p>
                  <p style={{ fontSize: 14, color: cc.warningText, margin: '2px 0 0', fontWeight: 600 }}>
                    {new Date(selectedJob.applicationDeadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )}

            <CTAButton
              variant="primary" size="lg" fullWidth icon={<Send size={16} />}
              onClick={() => setShowConfirmModal(true)}
              disabled={selectedJob.status !== 'OPEN'}
            >
              {selectedJob.status === 'OPEN' ? 'Apply Now' : 'Applications Closed'}
            </CTAButton>
          </motion.div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && selectedJob && (
        <div
          onClick={() => setShowConfirmModal(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if(e.key === 'Escape' || e.key === 'Enter') setShowConfirmModal(false); }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{ background: cc.surface, borderRadius: cc.radiusXl, padding: 28, maxWidth: 420, width: '100%' }}
          >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: cc.primaryLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', color: cc.primary,
              }}>
                <Award size={32} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: cc.textPrimary, margin: '0 0 8px' }}>Confirm Application</h3>
              <p style={{ fontSize: 13, color: cc.textSecondary, margin: 0, lineHeight: 1.6 }}>
                You are about to apply for <strong>{selectedJob.title}</strong> at <strong>{selectedJob.enterpriseName}</strong>.
                You can only apply <strong>once</strong> and cannot change this after submission.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <CTAButton variant="ghost" fullWidth onClick={() => setShowConfirmModal(false)}>Cancel</CTAButton>
              <CTAButton variant="primary" fullWidth onClick={handleApply} disabled={applying}>
                {applying ? 'Submitting...' : 'Confirm Apply'}
              </CTAButton>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const ReportCardItem: React.FC<{ report: any, index: number }> = ({ report, index }) => {
  const isApproved = report.status === 'APPROVED';
  const isRejected = report.status === 'REJECTED';
  const isSubmitted = report.status === 'SUBMITTED';
  const isNotSubmitted = report.status === 'NOT_SUBMITTED';

  const label = isApproved ? 'Approved' : isRejected ? 'Rejected' : isSubmitted ? 'Pending Review' : isNotSubmitted ? 'Not Submitted' : 'Draft';
  const variant = isApproved ? 'success' : isRejected ? 'error' : isSubmitted ? 'warning' : 'neutral';

  return (
    <motion.div
      key={report.reportId || `report-${index}`}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card hoverable style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: cc.radiusMd,
              background: hexToRgba(cc.primary, 0.1), display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: cc.primary, fontSize: 14, fontWeight: 700,
            }}>
              W{report.weekNumber}
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: cc.textPrimary, margin: '0 0 4px' }}>
                Week {report.weekNumber} Report
              </h4>
              <p style={{ fontSize: 12, color: cc.textMuted, margin: '0 0 8px' }}>
                {report.submittedAt ? `Submitted: ${new Date(report.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Not submitted'}
              </p>
              <SmallPill label={label} variant={variant} />
            </div>
          </div>
          <CTAButton variant="ghost" size="sm" icon={<Eye size={14} />}>View</CTAButton>
        </div>
      </Card>
    </motion.div>
  );
};

// ============================================================
// REPORTS TAB
// ============================================================
const ReportsTab: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/weekly-reports/my-reports');
      setReports(res.data || []);
    } catch (err) {
      console.error('Failed to fetch reports', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <RefreshCw size={28} color={cc.primary} />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: cc.textPrimary, margin: '0 0 6px' }}>Weekly Reports</h2>
          <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>Track your internship progress on a weekly basis</p>
        </div>

        {reports.length === 0 ? (
          <EmptyState
            icon={<FileText size={32} />}
            title="No reports yet"
            description="Your weekly reports will appear once you start your internship"
            action={<CTAButton variant="primary" icon={<FileText size={14} />} onClick={() => {}}>Submit First Report</CTAButton>}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {reports.map((report, index) => (
              <ReportCardItem key={report.reportId || index} report={report} index={index} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ============================================================
// MAIN STUDENT DASHBOARD
// ============================================================
export const StudentDashboard: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const activeTab = tab || 'dashboard';

  const handleNavigate = (key: string) => {
    navigate(`/student-dashboard/${key}`);
  };

  const navItems: NavItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { key: 'profile', label: 'Profile', icon: <User size={18} /> },
    { key: 'jobs', label: 'Jobs', icon: <Briefcase size={18} /> },
    { key: 'reports', label: 'Reports', icon: <FileText size={18} /> },
    { key: 'applications', label: 'Applications', icon: <Send size={18} /> },
    { key: 'schedule', label: 'Schedule', icon: <Calendar size={18} /> },
    { key: 'feedback', label: 'Feedback', icon: <Star size={18} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const tabComponents: Record<string, React.ReactNode> = {
    dashboard: (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* Welcome */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: cc.textPrimary, margin: '0 0 6px' }}>
              Welcome back! 👋
            </h1>
            <p style={{ fontSize: 14, color: cc.textMuted, margin: 0 }}>
              Track your internship progress and manage your profile
            </p>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }} className="sp-grid-4">
            <StatCard label="Applications" value="3" icon={<Send size={22} />} color={cc.info} trend="+2" trendUp />
            <StatCard label="Interviews" value="1" icon={<Calendar size={22} />} color={cc.warning} />
            <StatCard label="Reports This Week" value="1" icon={<CheckCircle size={22} />} color={cc.success} />
            <StatCard label="Days Remaining" value="28" icon={<Clock size={22} />} color={cc.primary} />
          </div>

          {/* Quick Actions + Recent Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="sp-grid-2">
            <Card style={{ padding: 24 }}>
              <SectionTitle>Quick Actions</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Submit Weekly Report', icon: <FileText size={15} />, key: 'reports', variant: 'primary' as const },
                  { label: 'Browse Job Postings', icon: <Briefcase size={15} />, key: 'jobs', variant: 'ghost' as const },
                  { label: 'Update My Profile', icon: <User size={15} />, key: 'profile', variant: 'ghost' as const },
                ].map(action => (
                  <CTAButton
                    key={action.key}
                    variant={action.variant}
                    icon={action.icon}
                    fullWidth
                    onClick={() => handleNavigate(action.key)}
                  >
                    {action.label}
                  </CTAButton>
                ))}
              </div>
            </Card>

            <Card style={{ padding: 24 }}>
              <SectionTitle>Recent Activity</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { text: 'Application submitted to TechCorp Vietnam', time: '2 hours ago', icon: <Send size={14} />, color: cc.info },
                  { text: 'Weekly report W22 approved by TM', time: 'Yesterday', icon: <CheckCircle size={14} />, color: cc.success },
                  { text: 'Interview scheduled for Jul 15 at 2:00 PM', time: '3 days ago', icon: <Calendar size={14} />, color: cc.warning },
                ].map((item) => (
                  <div key={item.text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: hexToRgba(item.color, 0.1),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: item.color, flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: cc.textPrimary, margin: 0, lineHeight: 1.4 }}>{item.text}</p>
                      <p style={{ fontSize: 11, color: cc.textMuted, margin: '2px 0 0' }}>{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>

        <style>{`
          @media (max-width: 1024px) {
            .sp-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
            .sp-grid-2 { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 640px) {
            .sp-grid-4 { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    ),

    profile: <ProfileTab />,
    jobs: <JobBoardTab />,
    reports: <ReportsTab />,

    applications: (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: cc.textPrimary, margin: '0 0 6px' }}>My Applications</h2>
          <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>Track all your job applications in one place</p>
        </div>
        <EmptyState
          icon={<FileText size={32} />}
          title="No applications yet"
          description="Start applying to internships to see your applications here"
          action={<CTAButton variant="primary" icon={<Briefcase size={14} />} onClick={() => handleNavigate('jobs')}>Browse Jobs</CTAButton>}
        />
      </div>
    ),

    schedule: (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: cc.textPrimary, margin: '0 0 6px' }}>Interview Schedule</h2>
          <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>Your upcoming interviews and appointments</p>
        </div>
        <EmptyState
          icon={<Calendar size={32} />}
          title="No scheduled interviews"
          description="Interviews will appear here once they are scheduled by companies"
        />
      </div>
    ),

    feedback: (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: cc.textPrimary, margin: '0 0 6px' }}>Company Feedback</h2>
          <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>Reviews and ratings from companies you've interned with</p>
        </div>
        <EmptyState
          icon={<Star size={32} />}
          title="No feedback received"
          description="Company feedback will appear after you complete your internship"
        />
      </div>
    ),

    settings: (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: cc.textPrimary, margin: '0 0 6px' }}>Settings</h2>
          <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>Manage your account and preferences</p>
        </div>
        <Card style={{ padding: 24 }}>
          <p style={{ fontSize: 14, color: cc.textMuted, textAlign: 'center' }}>Account settings coming soon...</p>
        </Card>
      </div>
    ),
  };

  return (
    <ModernLayout
      navItems={navItems}
      defaultRoute="dashboard"
      basePath="/student-dashboard"
    >
      {tabComponents[activeTab] || tabComponents['dashboard']}
    </ModernLayout>
  );
};

export default StudentDashboard;
