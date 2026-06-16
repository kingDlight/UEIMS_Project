import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { App, Spin, Pagination } from 'antd';
import { motion } from 'framer-motion';
import { FileTextOutlined, CloseCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { NeuSurface } from '../components/shared/NeuSurface';
import { SmallBadge } from '../components/shared/SmallBadge';
import { ApplicationService } from '@/services/ApplicationService';
import { cc, hexToRgba } from '../constants';

const CTAButton: React.FC<{
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: 'primary' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}> = ({ children, onClick, variant = 'primary', size = 'sm', icon, disabled = false, loading = false }) => {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    primary: { bg: cc.primary, text: '#fff', border: 'none' },
    ghost: { bg: '#fff', text: cc.primary, border: cc.border },
    success: { bg: '#fff', text: cc.success, border: `${cc.success}40` },
    danger: { bg: cc.dangerMuted, text: cc.danger, border: `${cc.danger}30` },
  };
  const { bg, text, border } = styles[variant];
  const sizes = { sm: { padding: '8px 14px', fontSize: 12 }, md: { padding: '10px 16px', fontSize: 13 } };
  const { padding, fontSize } = sizes[size];

  return (
    <motion.button
      onClick={onClick}
      whileHover={disabled ? {} : { y: -1 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding, fontSize, fontWeight: 700,
        color: disabled ? cc.textMuted : text, background: disabled ? cc.neutralBg : bg,
        border: variant === 'primary' ? 'none' : `1px solid ${border}`, borderRadius: cc.radiusMd,
        cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: "'Inter', sans-serif", opacity: disabled ? 0.6 : 1,
      }}
    >
      {loading ? <Spin size="small" /> : icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </motion.button>
  );
};

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <NeuSurface style={{ padding: 56, textAlign: 'center' }}>
    <div style={{ width: 72, height: 72, borderRadius: '50%', background: cc.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: cc.primary }}>{icon}</div>
    <h3 style={{ fontSize: 16, fontWeight: 600, color: cc.textPrimary, margin: '0 0 6px' }}>{title}</h3>
    <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>{description}</p>
  </NeuSurface>
);

export const ApplicationsTab: React.FC = () => {
  const { message } = App.useApp();
  const { t } = useTranslation(['applications']);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await ApplicationService.getMyApplications();
      const apps = res.data?.result ?? res.data ?? [];
      setApplications(Array.isArray(apps) ? apps : []);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    try {
      await ApplicationService.withdraw(applicationId);
      message.success(t('applicationWithdrawn', 'Application withdrawn successfully!'));
      fetchApplications();
    } catch (err: any) {
      message.error(err.response?.data?.message || t('failedWithdraw', 'Failed to withdraw application!'));
    }
  };

  const filteredApps = useMemo(() => {
    if (filter === 'all') return applications;
    return applications.filter(app => {
      const status = app.status?.toUpperCase();
      switch (filter) {
        case 'pending': return status === 'PENDING';
        case 'screening': return status === 'SCREENING_PASSED';
        case 'interview': return status === 'INTERVIEW_SCHEDULED';
        case 'rejected': return status === 'SCREENING_REJECTED' || status === 'REJECTED';
        case 'accepted': return status === 'ACCEPTED';
        default: return true;
      }
    });
  }, [applications, filter]);

  useEffect(() => { setCurrentPage(1); }, [filter]);

  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApps.slice(start, start + pageSize);
  }, [filteredApps, currentPage]);

  const statusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
    switch (status?.toUpperCase()) {
      case 'SCREENING_PASSED': return 'success';
      case 'INTERVIEW_SCHEDULED': return 'info';
      case 'ACCEPTED': return 'success';
      case 'SCREENING_REJECTED':
      case 'REJECTED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'neutral';
    }
  };

  const statusLabel = (status: string): string => {
    switch (status?.toUpperCase()) {
      case 'SCREENING_PASSED': return t('statusScreeningPassed', 'Screening Passed');
      case 'INTERVIEW_SCHEDULED': return t('statusInterviewScheduled', 'Interview Scheduled');
      case 'SCREENING_REJECTED': return t('statusScreeningRejected', 'Screening Rejected');
      default: return status || t('statusUnknown', 'Unknown');
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: cc.textPrimary, margin: '0 0 6px', letterSpacing: '-0.01em' }}>{t('myApplicationsTitle', 'My Applications')}</h2>
        <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>{t('myApplicationsDesc', 'Track all your job applications in one place')}</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'all', label: t('all', 'All') },
          { key: 'pending', label: t('pending', 'Pending') },
          { key: 'screening', label: t('screening', 'Screening') },
          { key: 'interview', label: t('interview', 'Interview') },
          { key: 'accepted', label: t('accepted', 'Accepted') },
          { key: 'rejected', label: t('rejected', 'Rejected') },
        ].map(f => (
          <CTAButton key={f.key} variant={filter === f.key ? 'primary' : 'ghost'} onClick={() => setFilter(f.key)}>{f.label}</CTAButton>
        ))}
      </div>

      {filteredApps.length === 0 ? (
        <EmptyState icon={<FileTextOutlined style={{ fontSize: 32 }} />} title={t("noApplicationsYet", "No applications yet")} description={t("startApplying", "Start applying to internships to see your applications here")} />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {paginatedApps.map((app, index) => (
              <motion.div key={app.applicationId || index} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <NeuSurface style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ width: 52, height: 52, borderRadius: cc.radiusMd, background: hexToRgba(cc.primary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.primary, fontSize: 20, fontWeight: 700 }}>
                        {app.enterpriseName?.charAt(0) || 'E'}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 600, color: cc.textPrimary, margin: '0 0 4px' }}>{app.jobTitle || t('internshipPosition', 'Internship Position')}</h4>
                        <p style={{ fontSize: 12, color: cc.textMuted, margin: '0 0 8px' }}>{app.enterpriseName}</p>
                        <SmallBadge label={statusLabel(app.status)} variant={statusVariant(app.status)} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {app.status === 'PENDING' && (
                        <CTAButton variant="danger" icon={<CloseCircleOutlined />} onClick={() => handleWithdraw(app.applicationId)}>{t('withdraw', 'Withdraw')}</CTAButton>
                      )}
                      <CTAButton variant="ghost" icon={expandedApp === app.applicationId ? <UpOutlined /> : <DownOutlined />} onClick={() => setExpandedApp(expandedApp === app.applicationId ? null : app.applicationId)}>
                        {expandedApp === app.applicationId ? t('collapse', 'Collapse') : t('expand', 'Expand')}
                      </CTAButton>
                    </div>
                  </div>
                  {expandedApp === app.applicationId && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${cc.border}` }}>
                      <div style={{ display: 'grid', gap: 12 }}>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, margin: '0 0 4px' }}>{t('position', 'Position')}</p>
                          <p style={{ fontSize: 13, color: cc.textPrimary, margin: 0 }}>{app.jobTitle || 'N/A'}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, margin: '0 0 4px' }}>{t('enterprise', 'Enterprise')}</p>
                          <p style={{ fontSize: 13, color: cc.textPrimary, margin: 0 }}>{app.enterpriseName || 'N/A'}</p>
                        </div>
                        {app.coverLetter && (
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, margin: '0 0 4px' }}>{t('coverLetter', 'Cover Letter')}</p>
                            <p style={{ fontSize: 13, color: cc.textPrimary, margin: 0, whiteSpace: 'pre-wrap' }}>{app.coverLetter}</p>
                          </div>
                        )}
                        {app.appliedAt && (
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, margin: '0 0 4px' }}>{t('appliedAt', 'Applied At')}</p>
                            <p style={{ fontSize: 13, color: cc.textPrimary, margin: 0 }}>{new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </NeuSurface>
              </motion.div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredApps.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showTotal={(total, range) => `${range[0]}-${range[1]} ${t('ofTotal', 'of {{total}}', { total })}`}
            />
          </div>
        </>
      )}
    </div>
  );
};
