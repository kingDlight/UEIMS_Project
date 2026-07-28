import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { App, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  LeftOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  SendOutlined,
  BankOutlined,
  ContactsOutlined,
  MailOutlined,
  ExperimentOutlined,
  GiftOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { NeuSurface } from './components/shared/NeuSurface';
import { SmallBadge } from './components/shared/SmallBadge';
import { JobPostService } from '@/services/JobPostService';
import { ApplicationService } from '@/services/ApplicationService';
import { EnterpriseAssignmentService } from '@/services/EnterpriseAssignmentService';
import { useStudentProfileQuery } from '@/hooks/useStudentProfile';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { navItems, cc, hexToRgba } from './constants';
import { resolveEnterpriseLogo, enterpriseInitials } from '@/utils/enterpriseLogo';

const CTAButton: React.FC<{
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: 'primary' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}> = ({ children, onClick, variant = 'primary', size = 'sm', icon, disabled = false, loading = false, fullWidth = false }) => {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    primary: { bg: cc.primary, text: '#fff', border: 'none' },
    ghost: { bg: 'transparent', text: cc.primary, border: cc.border },
    success: { bg: cc.success, text: '#fff', border: 'none' },
    danger: { bg: cc.danger, text: '#fff', border: 'none' },
  };
  const { bg, text, border } = styles[variant];
  const padding = size === 'lg' ? '14px 24px' : size === 'md' ? '10px 16px' : '8px 14px';
  const fontSize = size === 'lg' ? 15 : size === 'md' ? 13 : 12;
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.01, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding, fontSize, fontWeight: 700,
        color: disabled ? cc.textMuted : text, background: disabled ? cc.neutralBg : bg,
        border: variant === 'primary' ? 'none' : `1px solid ${border}`, borderRadius: cc.radiusMd,
        cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: "'Inter', sans-serif", opacity: disabled ? 0.6 : 1,
        ...(fullWidth ? { width: '100%' } : {}),
      }}
    >
      {loading ? <Spin size="small" /> : icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </motion.button>
  );
};

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { message } = App.useApp();
  const { t } = useTranslation(['jobs']);
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());
  const [applied, setApplied] = useState(false);

  const { data: profile } = useStudentProfileQuery();
  const hasCv = !!profile?.cvFileUrl;
  const currentSemester = profile?.currentSemester ?? 5;

  const [hasActivePlacement, setHasActivePlacement] = useState(false);

  useEffect(() => {
    EnterpriseAssignmentService.getMyAssignment()
      .then(res => {
        const data = res.data?.result ?? res.data;
        setHasActivePlacement(!!data);
      })
      .catch(() => setHasActivePlacement(false));
  }, []);

  const getFilteredNavItems = (sem: number, hasPlacement: boolean) => {
    if (sem >= 1 && sem <= 4) {
      return navItems.filter(item => ['dashboard', 'profile', 'jobs'].includes(item.key));
    }
    if (sem === 5) {
      return navItems.filter(item => ['dashboard', 'profile', 'jobs', 'applications', 'schedule'].includes(item.key));
    }
    if (sem === 6) {
      if (hasPlacement) {
        return navItems.filter(item => ['dashboard', 'profile', 'training-plan', 'reports', 'final-report'].includes(item.key));
      }
      return navItems.filter(item => ['dashboard', 'profile', 'jobs', 'applications', 'schedule'].includes(item.key));
    }
    if (sem >= 7 && sem <= 9) {
      return navItems.filter(item => ['dashboard', 'profile', 'feedback', 'evaluation'].includes(item.key));
    }
    return navItems;
  };

  useEffect(() => {
    fetchJobDetail();
    fetchAppliedJobIds();
  }, [id]);

  const fetchJobDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await JobPostService.getById(id);
      const data = res.data?.result ?? res.data;
      setJob(data);
      setApplied(appliedJobIds.has(data?.jobPostId));
    } catch {
      message.error('Failed to load job details.');
      navigate('/student/jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobIds = async () => {
    try {
      const res = await ApplicationService.getMyApplications();
      const applications = res.data?.result ?? res.data ?? [];
      const ids = new Set<number>(applications.map((a: any) => a.jobPostId));
      setAppliedJobIds(ids);
    } catch {
      // non-fatal
    }
  };

  const handleApply = async () => {
    if (!job) return;

    if (isExpired(job.applicationDeadline)) {
      message.error(t('jobDeadlineReached', 'This job posting has reached its deadline.'));
      return;
    }

    try {
      setApplying(true);
      await ApplicationService.create({ jobPostId: job.jobPostId });
      message.success(t('applicationSuccess', 'Application submitted successfully!'));
      setAppliedJobIds(prev => new Set([...prev, job.jobPostId]));
      setApplied(true);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || '';
      if (errorMsg.includes('already') || errorMsg.includes('duplicate')) {
        message.error(t('alreadyApplied', 'You have already applied for this position.'));
      } else if (errorMsg.includes('CV') && errorMsg.includes('upload')) {
        message.error(t('pleaseUploadCv', 'Please upload your CV in Profile before applying.'));
      } else if (errorMsg.includes('deadline') || errorMsg.includes('expired')) {
        message.error(t('jobDeadlineReached', 'This job posting has reached its deadline.'));
      } else {
        message.error(errorMsg || t('applicationFailed', 'Application failed!'));
      }
    } finally {
      setApplying(false);
    }
  };

  const isExpired = (deadline?: string | null) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const getApplyButtonState = () => {
    if (applied || appliedJobIds.has(job?.jobPostId)) return 'applied';
    if (job?.status !== 'OPEN') return 'closed';
    if (isExpired(job?.applicationDeadline)) return 'expired';
    // FIX 049: positionsCount is now the runtime open count; full <= 0 = full.
    if ((job?.positionsCount ?? 0) <= 0) return 'full';
    if (currentSemester < 5) return 'browse';
    if (!hasCv) return 'nocv';
    return 'apply';
  };

  const getApplyButtonLabel = () => {
    const state = getApplyButtonState();
    switch (state) {
      case 'applied': return t('applied', 'Applied');
      case 'closed': return t('applicationsClosed', 'Applications Closed');
      case 'expired': return t('deadlineExpired', 'Deadline Expired');
      case 'full': return t('positionFull', 'Position Full');
      case 'browse': return t('browseOnly', 'Browse Only');
      case 'nocv': return t('cvRequired', 'CV Required');
      default: return t('applyNow', 'Apply Now');
    }
  };

  const getApplyButtonAction = () => {
    const state = getApplyButtonState();
    if (state === 'applied') { message.info(t('alreadyAppliedMsg', 'You have already applied for this position.')); return; }
    if (state === 'browse') { message.warning('Browse only mode enabled for your semester.'); return; }
    if (state === 'nocv') { message.warning('Please upload your CV in Profile before applying.'); return; }
    if (state === 'closed') { message.error('This job posting is no longer accepting applications.'); return; }
    if (state === 'expired') { message.error('This job posting has reached its deadline.'); return; }
    if (state === 'full') { message.warning('This position is fully booked. Please check other openings.'); return; }
    handleApply();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: cc.neutralBg }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!job) return null;

  // Flat snapshots populated by JobPostService.populateEnterpriseSnapshot()
  // (the nested `enterprise` field is suppressed by @JsonBackReference, so the
  // job detail page must read from these top-level fields instead).
  const enterpriseName = job.enterpriseName;
  const enterpriseLogoUrl = job.enterpriseLogoUrl;
  const enterprise = job.enterprise;

  const filteredNavItems = getFilteredNavItems(currentSemester, hasActivePlacement);

  return (
    <ModernLayout navItems={filteredNavItems} defaultRoute="jobs" basePath="/student">
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px 60px' }}>

        {/* Back Button */}
        <button
          onClick={() => navigate('/student/jobs')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: cc.textMuted, fontSize: 14, fontWeight: 500, padding: '6px 0', marginBottom: 24 }}
        >
          <LeftOutlined /> {t('backToJobs', 'Back to Job Board')}
        </button>

        {/* Hero Card */}
        <NeuSurface style={{ padding: 28, marginBottom: 20, borderRadius: cc.radiusLg }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{
                width: 68, height: 68, borderRadius: cc.radiusLg,
                background: hexToRgba(cc.primary, 0.08), display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: cc.primary, fontSize: 24, fontWeight: 800, flexShrink: 0,
                overflow: 'hidden'
              }}>
                {(() => {
                  const logoUrl = resolveEnterpriseLogo(enterpriseName, enterpriseLogoUrl);
                  return logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={enterpriseName || 'Enterprise'}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : enterpriseInitials(enterpriseName);
                })()}
              </div>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: cc.textPrimary, margin: '0 0 4px', letterSpacing: '-0.01em' }}>{job.title}</h1>
                <p style={{ fontSize: 15, color: cc.textMuted, margin: 0, fontWeight: 500 }}>{enterpriseName || '—'}</p>
              </div>
            </div>
            <SmallBadge label={job.status === 'OPEN' ? t('open', 'Open') : t('closed', 'Closed')} variant={job.status === 'OPEN' ? 'success' : 'neutral'} />
          </div>

          {/* Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {enterprise?.address && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: cc.radiusFull, background: cc.neutralBg, border: `1px solid ${cc.border}`, fontSize: 13, color: cc.textSecondary, fontWeight: 500 }}>
                <EnvironmentOutlined style={{ fontSize: 12 }} />{enterprise.address}
              </span>
            )}
            {job.positionsCount != null && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: cc.radiusFull, background: cc.neutralBg, border: `1px solid ${cc.border}`, fontSize: 13, color: cc.textSecondary, fontWeight: 500 }}>
                <TeamOutlined style={{ fontSize: 12 }} />
                {(() => {
                  // FIX 049: positionsCount is the runtime open count.
                  const open = Math.max(0, job.positionsCount);
                  const taken = job.currentApplicationCount ?? 0;
                  return `${open} ${open === 1 ? t('positionOpen', 'position') : t('positionsOpen', 'positions')} open (${taken} applied)`;
                })()}
              </span>
            )}
            {job.requiredSkills && (() => {
              try {
                const skills = JSON.parse(job.requiredSkills);
                return Array.isArray(skills) ? skills.slice(0, 4).map((s: string) => (
                  <span key={s} style={{ padding: '6px 14px', borderRadius: cc.radiusFull, background: cc.primaryMuted, border: `1px solid ${cc.primary}30`, fontSize: 13, color: cc.primary, fontWeight: 600 }}>
                    {s}
                  </span>
                )) : null;
              } catch { return null; }
            })()}
          </div>
        </NeuSurface>

        {/* Company Info */}
        {enterprise && (
          <NeuSurface style={{ padding: 22, marginBottom: 20, borderRadius: cc.radiusLg }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <BankOutlined style={{ fontSize: 16, color: cc.primary }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: cc.textPrimary, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {t('companyDetails', 'Company Details')}
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {enterprise.industry && (
                <div>
                  <p style={{ fontSize: 11, color: cc.textMuted, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{t('industry', 'Industry')}</p>
                  <p style={{ fontSize: 14, color: cc.textPrimary, margin: 0, fontWeight: 600 }}>{enterprise.industry}</p>
                </div>
              )}
              {enterprise.address && (
                <div>
                  <p style={{ fontSize: 11, color: cc.textMuted, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{t('address', 'Address')}</p>
                  <p style={{ fontSize: 14, color: cc.textPrimary, margin: 0, fontWeight: 600 }}>{enterprise.address}</p>
                </div>
              )}
              {enterprise.contactPerson && (
                <div>
                  <p style={{ fontSize: 11, color: cc.textMuted, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}><ContactsOutlined style={{ fontSize: 10 }} /> {t('contactPerson', 'Contact Person')}</p>
                  <p style={{ fontSize: 14, color: cc.textPrimary, margin: 0, fontWeight: 600 }}>{enterprise.contactPerson}</p>
                </div>
              )}
              {enterprise.contactEmail && (
                <div>
                  <p style={{ fontSize: 11, color: cc.textMuted, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}><MailOutlined style={{ fontSize: 10 }} /> {t('email', 'Email')}</p>
                  <p style={{ fontSize: 14, color: cc.primary, margin: 0, fontWeight: 600 }}>{enterprise.contactEmail}</p>
                </div>
              )}
            </div>
            {enterprise.description && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${cc.borderSubtle}` }}>
                <p style={{ fontSize: 14, color: cc.textSecondary, lineHeight: 1.7, margin: 0 }}>{enterprise.description}</p>
              </div>
            )}
          </NeuSurface>
        )}

        {/* Job Content */}
        <NeuSurface style={{ padding: 22, marginBottom: 20, borderRadius: cc.radiusLg }}>

          {/* Deadline */}
          {job.applicationDeadline && (
            <div style={{ padding: 14, borderRadius: cc.radiusMd, background: cc.warningMuted, marginBottom: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
              <ClockCircleOutlined style={{ fontSize: 18, color: cc.warning }} />
              <div>
                <p style={{ fontSize: 11, color: cc.warningText, margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('applicationDeadline', 'Application Deadline')}</p>
                <p style={{ fontSize: 15, color: cc.warningText, margin: '2px 0 0', fontWeight: 700 }}>{new Date(job.applicationDeadline).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          )}

          {/* Job Description */}
          {job.description && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <FileTextOutlined style={{ fontSize: 15, color: cc.primary }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: cc.textPrimary, margin: 0 }}>{t('jobDescription', 'Job Description')}</h3>
              </div>
              <p style={{ fontSize: 14, color: cc.textSecondary, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>{job.description}</p>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <ExperimentOutlined style={{ fontSize: 15, color: cc.primary }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: cc.textPrimary, margin: 0 }}>{t('requirements', 'Requirements')}</h3>
              </div>
              <p style={{ fontSize: 14, color: cc.textSecondary, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>{job.requirements}</p>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (
            <div style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <GiftOutlined style={{ fontSize: 15, color: cc.primary }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: cc.textPrimary, margin: 0 }}>{t('benefits', 'Benefits')}</h3>
              </div>
              <p style={{ fontSize: 14, color: cc.textSecondary, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>{job.benefits}</p>
            </div>
          )}
        </NeuSurface>

        {/* Warnings */}
        {currentSemester < 5 && (
          <div style={{ padding: 14, borderRadius: cc.radiusMd, background: cc.warningMuted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <WarningOutlined style={{ fontSize: 16, color: cc.warning }} />
            <span style={{ fontSize: 13, color: cc.warningText }}>{t('browseOnlySemester', 'Browse only mode — Applications open in Semester 5 (Current: Semester {{sem}})', { sem: currentSemester })}</span>
          </div>
        )}
        {!hasCv && currentSemester >= 5 && (
          <div style={{ padding: 14, borderRadius: cc.radiusMd, background: cc.dangerMuted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <WarningOutlined style={{ fontSize: 16, color: cc.danger }} />
            <span style={{ fontSize: 13, color: cc.dangerText }}>{t('pleaseUploadCv', 'Please upload your CV in Profile before applying.')}</span>
          </div>
        )}

        {/* Apply Button */}
        <CTAButton
          variant="primary"
          size="lg"
          fullWidth
          icon={applied || appliedJobIds.has(job.jobPostId) ? null : <SendOutlined />}
          onClick={getApplyButtonAction}
          disabled={getApplyButtonState() === 'applied' || getApplyButtonState() === 'expired'}
          loading={applying}
        >
          {getApplyButtonLabel()}
        </CTAButton>
      </div>
    </ModernLayout>
  );
};
