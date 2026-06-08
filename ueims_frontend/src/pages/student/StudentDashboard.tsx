import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { message } from 'antd';
import { ModernLayout } from '@/components/layout/ModernLayout';
import type { NavItem } from '@/components/layout/ModernLayout';
import {
  User,
  Briefcase,
  FileText,
  GraduationCap,
  Bell,
  Settings,
  Home,
  BookOpen,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  X,
  Upload,
  File,
  Building2,
  MapPin,
  DollarSign,
  Users,
  Star,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  Eye,
  Download,
} from 'lucide-react';
import { api } from '@/services/api';

// ============================================================
// DESIGN TOKENS — Student Portal (matching TM Dashboard style)
// ============================================================
export const sp = {
  brand: '#FF7A30',
  brandHover: '#E86A20',
  brandActive: '#CC5A18',
  brandMuted: '#FFF3E8',
  brandSubtle: '#FFF8F0',
  brandStrong: '#9B4A10',

  success: '#10B981',
  successMuted: '#D1FAE5',
  successText: '#065F46',
  error: '#EF4444',
  errorMuted: '#FEE2E2',
  errorText: '#991B1B',
  warning: '#F59E0B',
  warningMuted: '#FEF3C7',
  warningText: '#92400E',
  info: '#3B82F6',
  infoMuted: '#DBEAFE',
  infoText: '#1E40AF',

  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textDisabled: '#D1D5DB',

  surface: '#FFFFFF',
  bg: 'transparent',
  neutralBg: '#F9FAFB',
  border: '#E5E7EB',
  borderSubtle: '#F3F4F6',

  radiusSm: 6,
  radiusMd: 8,
  radiusLg: 12,
  radiusXl: 16,
  radiusFull: 9999,

  shadowSm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  shadowMd: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)',
  shadowLg: '0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)',
  shadowXl: '0 20px 25px rgba(0,0,0,0.10), 0 8px 10px rgba(0,0,0,0.04)',
  shadowBrand: '0 4px 12px rgba(255,122,48,0.25)',
  shadowSuccess: '0 4px 12px rgba(16,185,129,0.25)',
  shadowError: '0 4px 12px rgba(239,68,68,0.25)',
  shadowWarning: '0 4px 12px rgba(245,158,11,0.25)',
};

// ============================================================
// HELPER UTILITIES
// ============================================================
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================
// SHARED UI COMPONENTS
// ============================================================
const CardWrapper: React.FC<{
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
        boxShadow: hovered && hoverable ? sp.shadowMd : sp.shadowSm,
      }}
      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
      style={{
        background: sp.surface,
        borderRadius: sp.radiusLg,
        border: `1px solid ${sp.borderSubtle}`,
        boxShadow: sp.shadowSm,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
};

const Label: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = '', style }) => (
  <span
    className={className}
    style={{
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: sp.textMuted,
      ...style,
    }}
  >
    {children}
  </span>
);

const CTAButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'amber' | 'red' | 'ghost' | 'success';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', fullWidth = false, size = 'md', icon, disabled = false }) => {
  const variants: Record<string, { bg: string; text: string; shadow: string }> = {
    primary: { bg: sp.brand, text: '#fff', shadow: sp.shadowBrand },
    success: { bg: sp.success, text: '#fff', shadow: sp.shadowSuccess },
    amber: { bg: sp.warning, text: '#fff', shadow: sp.shadowWarning },
    red: { bg: sp.error, text: '#fff', shadow: sp.shadowError },
    ghost: { bg: 'transparent', text: sp.brand, shadow: 'none' },
  };
  const { bg, text: textColor, shadow } = variants[variant];
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 12 },
    md: { padding: '9px 16px', fontSize: 13 },
    lg: { padding: '11px 20px', fontSize: 14 },
  };
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
        color: disabled ? sp.textMuted : textColor,
        background: disabled ? sp.borderSubtle : bg,
        border: variant === 'ghost' ? `1px solid ${sp.border}` : 'none',
        borderRadius: sp.radiusMd,
        boxShadow: variant === 'ghost' ? 'none' : shadow,
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        justifyContent: 'center',
        fontFamily: 'Inter, -apple-system, sans-serif',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
      {icon === false ? null : (icon || <ArrowRight size={size === 'sm' ? 12 : 14} />)}
    </motion.button>
  );
};

const StatusBadge: React.FC<{ label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }> = ({ label, variant }) => {
  const config: Record<string, { bg: string; color: string; borderColor: string }> = {
    success: { bg: hexToRgba(sp.success, 0.08), color: sp.success, borderColor: hexToRgba(sp.success, 0.25) },
    warning: { bg: hexToRgba(sp.warning, 0.08), color: sp.warning, borderColor: hexToRgba(sp.warning, 0.25) },
    error: { bg: hexToRgba(sp.error, 0.08), color: sp.error, borderColor: hexToRgba(sp.error, 0.25) },
    info: { bg: hexToRgba(sp.info, 0.08), color: sp.info, borderColor: hexToRgba(sp.info, 0.25) },
    default: { bg: hexToRgba(sp.textMuted, 0.08), color: sp.textMuted, borderColor: hexToRgba(sp.textMuted, 0.25) },
  };
  const { bg, color, borderColor } = config[variant];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 8px',
      borderRadius: sp.radiusMd,
      backgroundColor: bg,
      border: `1px solid ${borderColor}`,
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

// ============================================================
// PROFILE TAB — Drag & Drop CV Upload
// ============================================================
const ProfileTab: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

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
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Chỉ chấp nhận file PDF!';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'File CV không được vượt quá 5MB!';
    }
    return null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        message.error(error);
        return;
      }
      setCvFile(file);
      setCvUrl(URL.createObjectURL(file));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        message.error(error);
        return;
      }
      setCvFile(file);
      setCvUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadCV = async () => {
    if (!cvFile) return;
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', cvFile);
      
      await api.post('/student-profiles/upload-cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      message.success('Upload CV thành công!');
      fetchProfile();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Upload thất bại!');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="sp-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: sp.brand }} />
          <p style={{ marginTop: 12, color: sp.textMuted }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile Header Card */}
        <CardWrapper style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            {/* Avatar */}
            <div style={{
              width: 80,
              height: 80,
              borderRadius: sp.radiusLg,
              background: `linear-gradient(135deg, ${sp.brand}, ${sp.brandHover})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 28,
              fontWeight: 800,
              flexShrink: 0,
            }}>
              {profile?.fullName?.substring(0, 2).toUpperCase() || 'ST'}
            </div>
            
            {/* Info */}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: sp.textPrimary, margin: '0 0 4px' }}>
                {profile?.fullName || 'Sinh viên'}
              </h2>
              <p style={{ fontSize: 14, color: sp.textSecondary, margin: '0 0 8px' }}>
                {profile?.email || 'email@student.fpt.edu.vn'}
              </p>
              <StatusBadge label="Đang thực tập" variant="success" />
            </div>
          </div>
        </CardWrapper>

        {/* CV Upload Section */}
        <CardWrapper style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: sp.radiusMd,
              background: `${sp.info}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: sp.info,
            }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: sp.textPrimary, margin: 0 }}>Hồ sơ CV của bạn</h3>
              <p style={{ fontSize: 12, color: sp.textMuted, margin: '2px 0 0' }}>Upload CV định dạng PDF, tối đa 5MB</p>
            </div>
          </div>

          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragActive ? sp.brand : sp.border}`,
              borderRadius: sp.radiusLg,
              padding: '32px 24px',
              textAlign: 'center',
              background: dragActive ? sp.brandMuted : sp.neutralBg,
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onClick={() => document.getElementById('cv-input')?.click()}
          >
            <input
              id="cv-input"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {cvFile ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <File size={32} color={sp.success} />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: sp.textPrimary, margin: 0 }}>{cvFile.name}</p>
                  <p style={{ fontSize: 12, color: sp.textMuted, margin: '2px 0 0' }}>
                    {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setCvFile(null); setCvUrl(null); }}
                  style={{
                    marginLeft: 8,
                    padding: 8,
                    borderRadius: sp.radiusMd,
                    background: sp.errorMuted,
                    border: 'none',
                    cursor: 'pointer',
                    color: sp.error,
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={40} color={sp.textMuted} style={{ marginBottom: 12 }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: sp.textPrimary, margin: '0 0 4px' }}>
                  Kéo thả file CV vào đây
                </p>
                <p style={{ fontSize: 12, color: sp.textMuted, margin: 0 }}>
                  hoặc click để chọn file
                </p>
              </>
            )}
          </div>

          {cvFile && (
            <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <CTAButton variant="ghost" onClick={() => { setCvFile(null); setCvUrl(null); }}>
                Hủy
              </CTAButton>
              <CTAButton variant="primary" onClick={handleUploadCV} disabled={uploading}>
                {uploading ? (
                  <>
                    <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    Đang upload...
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Upload CV
                  </>
                )}
              </CTAButton>
            </div>
          )}

          {/* Current CV */}
          {profile?.cvFileUrl && !cvFile && (
            <div style={{
              marginTop: 20,
              padding: 16,
              borderRadius: sp.radiusMd,
              background: sp.successMuted,
              border: `1px solid ${hexToRgba(sp.success, 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckCircle size={20} color={sp.success} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: sp.successText, margin: 0 }}>CV đã được upload</p>
                  <p style={{ fontSize: 12, color: sp.successText, opacity: 0.8, margin: '2px 0 0' }}>
                    {profile.cvFileName || 'cv_document.pdf'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <CTAButton variant="ghost" size="sm" icon={<Eye size={14} />} onClick={() => window.open(profile.cvFileUrl, '_blank')}>
                  Xem
                </CTAButton>
              </div>
            </div>
          )}
        </CardWrapper>

        {/* Skills Section */}
        <CardWrapper style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: sp.textPrimary, margin: '0 0 16px' }}>Kỹ năng</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['React', 'TypeScript', 'Node.js', 'Java', 'Python', 'SQL'].map((skill) => (
              <span
                key={skill}
                style={{
                  padding: '6px 12px',
                  borderRadius: sp.radiusFull,
                  background: sp.brandMuted,
                  color: sp.brand,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </CardWrapper>
      </motion.div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// ============================================================
// JOB BOARD TAB — Grid Card Layout
// ============================================================
const JobBoardTab: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applying, setApplying] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

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
      await api.post('/applications', {
        jobPostId: selectedJob.jobPostId,
        cvFileUrl: selectedJob.appliedCvUrl,
      });
      message.success('Ứng tuyển thành công!');
      setShowConfirmModal(false);
      setSelectedJob(null);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ứng tuyển thất bại!');
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
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: sp.brand }} />
          <p style={{ marginTop: 12, color: sp.textMuted }}>Đang tải tin tuyển dụng...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: sp.textPrimary, margin: '0 0 8px' }}>
            Bảng tin tuyển dụng
          </h2>
          <p style={{ fontSize: 14, color: sp.textMuted, margin: 0 }}>
            Tìm kiếm vị trí thực tập phù hợp với bạn
          </p>
        </div>

        {/* Search Bar */}
        <CardWrapper style={{ padding: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              placeholder="Tìm kiếm vị trí, công ty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: sp.radiusMd,
                border: `1px solid ${sp.border}`,
                fontSize: 14,
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
              }}
            />
            <CTAButton variant="primary" icon={<span style={{ fontSize: 16 }}>🔍</span>}>
              Tìm kiếm
            </CTAButton>
          </div>
        </CardWrapper>

        {/* Job Grid */}
        {filteredJobs.length === 0 ? (
          <CardWrapper style={{ padding: 48, textAlign: 'center' }}>
            <Briefcase size={48} color={sp.textMuted} style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: sp.textPrimary, margin: '0 0 8px' }}>
              Không có tin tuyển dụng nào
            </h3>
            <p style={{ fontSize: 14, color: sp.textMuted, margin: 0 }}>
              {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Hiện chưa có vị trí thực tập nào'}
            </p>
          </CardWrapper>
        ) : (
          <div className="sp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.jobPostId || index}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <CardWrapper
                  hoverable
                  onClick={() => setSelectedJob(job)}
                  style={{ padding: 20, cursor: 'pointer' }}
                >
                  {/* Enterprise Logo & Name */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: sp.radiusMd,
                      background: `linear-gradient(135deg, ${sp.brand}20, ${sp.brand}40)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: sp.brand,
                      fontSize: 20,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {job.enterpriseName?.charAt(0) || 'E'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 600, color: sp.textPrimary, margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {job.title || 'Vị trí thực tập'}
                      </h4>
                      <p style={{ fontSize: 13, color: sp.textSecondary, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {job.enterpriseName || 'Doanh nghiệp'}
                      </p>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {job.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: sp.textMuted }}>
                        <MapPin size={12} />
                        {job.location}
                      </div>
                    )}
                    {job.maxPositions && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: sp.textMuted }}>
                        <Users size={12} />
                        {job.maxPositions} vị trí
                      </div>
                    )}
                  </div>

                  {/* Description Preview */}
                  <p style={{ fontSize: 13, color: sp.textSecondary, margin: '0 0 16px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {job.description || 'Mô tả công việc...'}
                  </p>

                  {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: `1px solid ${sp.borderSubtle}` }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <StatusBadge 
                        label={job.status === 'OPEN' ? 'Đang tuyển' : 'Đã đóng'} 
                        variant={job.status === 'OPEN' ? 'success' : 'default'} 
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: sp.brand, fontWeight: 600 }}>
                      Xem chi tiết <ChevronRight size={14} />
                    </div>
                  </div>
                </CardWrapper>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Job Detail Modal / Drawer */}
      {selectedJob && (
        <div 
          onClick={() => setSelectedJob(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: sp.surface,
              borderRadius: `${sp.radiusXl}px ${sp.radiusXl}px 0 0`,
              maxWidth: 600,
              width: '100%',
              maxHeight: '85vh',
              overflow: 'auto',
              padding: 24,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: sp.radiusLg,
                  background: `linear-gradient(135deg, ${sp.brand}20, ${sp.brand}40)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: sp.brand,
                  fontSize: 24,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {selectedJob.enterpriseName?.charAt(0) || 'E'}
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: sp.textPrimary, margin: '0 0 4px' }}>
                    {selectedJob.title}
                  </h2>
                  <p style={{ fontSize: 14, color: sp.textSecondary, margin: 0 }}>{selectedJob.enterpriseName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                style={{
                  padding: 8,
                  borderRadius: sp.radiusMd,
                  background: sp.neutralBg,
                  border: 'none',
                  cursor: 'pointer',
                  color: sp.textMuted,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              {selectedJob.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: sp.radiusMd, background: sp.neutralBg, fontSize: 13 }}>
                  <MapPin size={14} color={sp.textMuted} />
                  {selectedJob.location}
                </div>
              )}
              {selectedJob.maxPositions && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: sp.radiusMd, background: sp.neutralBg, fontSize: 13 }}>
                  <Users size={14} color={sp.textMuted} />
                  {selectedJob.maxPositions} vị trí
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: sp.textPrimary, margin: '0 0 8px' }}>Mô tả công việc</h3>
              <p style={{ fontSize: 14, color: sp.textSecondary, lineHeight: 1.6, margin: 0 }}>
                {selectedJob.description || 'Không có mô tả'}
              </p>
            </div>

            {/* Requirements */}
            {selectedJob.requirements && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: sp.textPrimary, margin: '0 0 8px' }}>Yêu cầu</h3>
                <p style={{ fontSize: 14, color: sp.textSecondary, lineHeight: 1.6, margin: 0 }}>
                  {selectedJob.requirements}
                </p>
              </div>
            )}

            {/* Benefits */}
            {selectedJob.benefits && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: sp.textPrimary, margin: '0 0 8px' }}>Phúc lợi</h3>
                <p style={{ fontSize: 14, color: sp.textSecondary, lineHeight: 1.6, margin: 0 }}>
                  {selectedJob.benefits}
                </p>
              </div>
            )}

            {/* Deadline */}
            {selectedJob.applicationDeadline && (
              <div style={{ 
                padding: 16, 
                borderRadius: sp.radiusMd, 
                background: sp.warningMuted,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <Clock size={20} color={sp.warning} />
                <div>
                  <p style={{ fontSize: 12, color: sp.warningText, margin: 0, fontWeight: 600 }}>Hạn nộp hồ sơ</p>
                  <p style={{ fontSize: 14, color: sp.warningText, margin: '2px 0 0', fontWeight: 600 }}>
                    {new Date(selectedJob.applicationDeadline).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            )}

            {/* Apply Button */}
            <CTAButton 
              variant="primary" 
              size="lg" 
              fullWidth 
              icon={<Send size={16} />}
              onClick={() => {
                setShowConfirmModal(true);
              }}
              disabled={selectedJob.status !== 'OPEN'}
            >
              {selectedJob.status === 'OPEN' ? 'Ứng tuyển ngay' : 'Đã hết hạn tuyển dụng'}
            </CTAButton>
          </motion.div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && selectedJob && (
        <div 
          onClick={() => setShowConfirmModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: sp.surface,
              borderRadius: sp.radiusXl,
              padding: 24,
              maxWidth: 400,
              width: '100%',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: sp.brandMuted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <AlertCircle size={32} color={sp.brand} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: sp.textPrimary, margin: '0 0 8px' }}>
                Xác nhận ứng tuyển
              </h3>
              <p style={{ fontSize: 14, color: sp.textSecondary, margin: 0 }}>
                Bạn sắp ứng tuyển vị trí <strong>{selectedJob.title}</strong> tại <strong>{selectedJob.enterpriseName}</strong>.
                Bạn chỉ được ứng tuyển <strong>1 lần</strong> cho vị trí này và không thể thay đổi sau khi gửi.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <CTAButton variant="ghost" fullWidth onClick={() => setShowConfirmModal(false)}>
                Hủy
              </CTAButton>
              <CTAButton variant="primary" fullWidth onClick={handleApply} disabled={applying}>
                {applying ? 'Đang gửi...' : 'Xác nhận ứng tuyển'}
              </CTAButton>
            </div>
          </motion.div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .sp-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

// ============================================================
// REPORTS TAB — Weekly Reports List
// ============================================================
const ReportsTab: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

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
        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: sp.brand }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: sp.textPrimary, margin: '0 0 8px' }}>
            Báo cáo tuần
          </h2>
          <p style={{ fontSize: 14, color: sp.textMuted, margin: 0 }}>
            Theo dõi tiến độ thực tập hàng tuần của bạn
          </p>
        </div>

        {reports.length === 0 ? (
          <CardWrapper style={{ padding: 48, textAlign: 'center' }}>
            <FileText size={48} color={sp.textMuted} style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: sp.textPrimary, margin: '0 0 8px' }}>
              Chưa có báo cáo nào
            </h3>
            <p style={{ fontSize: 14, color: sp.textMuted, margin: 0 }}>
              Báo cáo tuần sẽ xuất hiện sau khi bạn bắt đầu thực tập
            </p>
          </CardWrapper>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reports.map((report, index) => (
              <motion.div
                key={report.reportId || index}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <CardWrapper hoverable style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: sp.radiusMd,
                        background: `${sp.info}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: sp.info,
                        fontSize: 16,
                        fontWeight: 700,
                      }}>
                        W{report.weekNumber}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 15, fontWeight: 600, color: sp.textPrimary, margin: '0 0 4px' }}>
                          Báo cáo tuần {report.weekNumber}
                        </h4>
                        <p style={{ fontSize: 13, color: sp.textMuted, margin: '0 0 8px' }}>
                          {report.submittedAt ? `Đã gửi: ${new Date(report.submittedAt).toLocaleDateString('vi-VN')}` : 'Chưa gửi'}
                        </p>
                        <StatusBadge 
                          label={
                            report.status === 'APPROVED' ? 'Đã duyệt' :
                            report.status === 'REJECTED' ? 'Bị từ chối' :
                            report.status === 'SUBMITTED' ? 'Chờ duyệt' :
                            report.status === 'NOT_SUBMITTED' ? 'Chưa nộp' : 'Nháp'
                          }
                          variant={
                            report.status === 'APPROVED' ? 'success' :
                            report.status === 'REJECTED' ? 'error' :
                            report.status === 'SUBMITTED' ? 'warning' : 'default'
                          }
                        />
                      </div>
                    </div>
                    <CTAButton variant="ghost" size="sm" icon={<Eye size={14} />}>
                      Xem
                    </CTAButton>
                  </div>
                </CardWrapper>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// ============================================================
// MAIN STUDENT DASHBOARD COMPONENT
// ============================================================
export const StudentDashboard: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const activeTab = tab || 'dashboard';

  const handleNavigate = (key: string) => {
    navigate(`/student-dashboard/${key}`);
  };

  const navItems: NavItem[] = [
    { key: 'dashboard', label: 'Trang chủ', icon: <Home size={18} /> },
    { key: 'profile', label: 'Hồ sơ', icon: <User size={18} /> },
    { key: 'jobs', label: 'Tin tuyển dụng', icon: <Briefcase size={18} /> },
    { key: 'reports', label: 'Báo cáo tuần', icon: <FileText size={18} /> },
    { key: 'applications', label: 'Đơn ứng tuyển', icon: <Send size={18} /> },
    { key: 'schedule', label: 'Lịch phỏng vấn', icon: <Calendar size={18} /> },
    { key: 'feedback', label: 'Đánh giá', icon: <Star size={18} /> },
    { key: 'settings', label: 'Cài đặt', icon: <Settings size={18} /> },
  ];

  const tabComponents: Record<string, React.ReactNode> = {
    dashboard: (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: sp.textPrimary, margin: '0 0 8px' }}>
              Xin chào, Sinh viên! 👋
            </h1>
            <p style={{ fontSize: 16, color: sp.textMuted, margin: 0 }}>
              Theo dõi tiến độ thực tập và quản lý hồ sơ của bạn
            </p>
          </div>

          <div className="sp-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Đơn đã ứng tuyển', value: '3', icon: <Send size={20} />, color: sp.info },
              { label: 'Phỏng vấn sắp tới', value: '1', icon: <Calendar size={20} />, color: sp.warning },
              { label: 'Báo cáo tuần này', value: '✓', icon: <CheckCircle size={20} />, color: sp.success },
              { label: 'Ngày còn lại', value: '28', icon: <Clock size={20} />, color: sp.brand },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <CardWrapper style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: sp.radiusMd,
                      background: `${stat.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.color,
                    }}>
                      {stat.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: 24, fontWeight: 700, color: sp.textPrimary, margin: 0 }}>{stat.value}</p>
                      <p style={{ fontSize: 12, color: sp.textMuted, margin: 0 }}>{stat.label}</p>
                    </div>
                  </div>
                </CardWrapper>
              </motion.div>
            ))}
          </div>

          <CardWrapper style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: sp.textPrimary, margin: '0 0 16px' }}>
              Thao tác nhanh
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <CTAButton variant="primary" icon={<FileText size={14} />} onClick={() => handleNavigate('reports')}>
                Nộp báo cáo tuần
              </CTAButton>
              <CTAButton variant="ghost" icon={<Briefcase size={14} />} onClick={() => handleNavigate('jobs')}>
                Xem tin tuyển dụng
              </CTAButton>
              <CTAButton variant="ghost" icon={<User size={14} />} onClick={() => handleNavigate('profile')}>
                Cập nhật hồ sơ
              </CTAButton>
            </div>
          </CardWrapper>
        </motion.div>

        <style>{`
          @media (max-width: 1024px) {
            .sp-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
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
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px', textAlign: 'center' }}>
        <Briefcase size={64} color={sp.textMuted} style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, color: sp.textPrimary, margin: '0 0 8px' }}>
          Đơn ứng tuyển
        </h2>
        <p style={{ fontSize: 14, color: sp.textMuted }}>
          Tính năng đang được phát triển...
        </p>
      </div>
    ),
    schedule: (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px', textAlign: 'center' }}>
        <Calendar size={64} color={sp.textMuted} style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, color: sp.textPrimary, margin: '0 0 8px' }}>
          Lịch phỏng vấn
        </h2>
        <p style={{ fontSize: 14, color: sp.textMuted }}>
          Tính năng đang được phát triển...
        </p>
      </div>
    ),
    feedback: (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px', textAlign: 'center' }}>
        <Star size={64} color={sp.textMuted} style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, color: sp.textPrimary, margin: '0 0 8px' }}>
          Đánh giá doanh nghiệp
        </h2>
        <p style={{ fontSize: 14, color: sp.textMuted }}>
          Tính năng đang được phát triển...
        </p>
      </div>
    ),
    settings: (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px', textAlign: 'center' }}>
        <Settings size={64} color={sp.textMuted} style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, color: sp.textPrimary, margin: '0 0 8px' }}>
          Cài đặt
        </h2>
        <p style={{ fontSize: 14, color: sp.textMuted }}>
          Tính năng đang được phát triển...
        </p>
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
