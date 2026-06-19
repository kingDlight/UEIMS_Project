import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { App, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  LeftOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  SendOutlined,
  CloseCircleOutlined,
  BankOutlined,
  ContactsOutlined,
  MailOutlined,
  ExperimentOutlined,
  GiftOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { NeuSurface } from '@/components/common';
import { CTAButton, SmallBadge } from '@/components/common';
import { JobPostService } from '@/services/JobPostService';
import { ApplicationService } from '@/services/ApplicationService';
import { useStudentProfileQuery } from '@/hooks/useStudentProfile';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { navItems } from '@/pages/student/constants';

const cc = {
  surface: '#ffffff',
  primary: '#2563eb',
  primaryMuted: 'rgba(37,99,235,0.06)',
  textPrimary: '#0f172a',
  textMuted: '#64748b',
  textSecondary: '#475569',
  border: '#e2e8f0',
  borderSubtle: '#f1f5f9',
  neutralBg: '#f8fafc',
  warning: '#d97706',
  warningMuted: 'rgba(217,119,6,0.08)',
  warningText: '#92400e',
  danger: '#dc2626',
  dangerMuted: 'rgba(220,38,38,0.08)',
  dangerText: '#991b1b',
  radiusMd: '8px',
  radiusLg: '12px',
  radiusFull: '9999px',
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
  const hasCv = !!profile?.cvUrl;
  const currentSemester = profile?.currentSemester ?? 5;

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

    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      message.error('This job posting has reached its deadline.');
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

  const getApplyButtonState = () => {
    if (applied || appliedJobIds.has(job?.jobPostId)) return 'applied';
    if (job?.status !== 'OPEN') return 'closed';
    if (currentSemester < 5) return 'browse';
    if (!hasCv) return 'nocv';
    return 'apply';
  };

  const getApplyButtonLabel = () => {
    const state = getApplyButtonState();
    switch (state) {
      case 'applied': return t('applied', 'Applied');
      case 'closed': return t('applicationsClosed', 'Applications Closed');
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

  const enterprise = job.enterprise;

  return (
    <ModernLayout navItems={navItems} defaultRoute="jobs" basePath="/student">
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
                background: cc.primaryMuted, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: cc.primary, fontSize: 28, fontWeight: 800, flexShrink: 0
              }}>
                {enterprise?.companyName?.charAt(0) || 'E'}
              </div>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: cc.textPrimary, margin: '0 0 4px', letterSpacing: '-0.01em' }}>{job.title}</h1>
                <p style={{ fontSize: 15, color: cc.textMuted, margin: 0, fontWeight: 500 }}>{enterprise?.companyName || '—'}</p>
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
            {job.maxPositions && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: cc.radiusFull, background: cc.neutralBg, border: `1px solid ${cc.border}`, fontSize: 13, color: cc.textSecondary, fontWeight: 500 }}>
                <TeamOutlined style={{ fontSize: 12 }} />{job.maxPositions} {t('positions', 'positions')}
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
          disabled={getApplyButtonState() === 'applied'}
          loading={applying}
        >
          {getApplyButtonLabel()}
        </CTAButton>
      </div>
    </ModernLayout>
  );
};
