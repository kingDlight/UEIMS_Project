import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { App, Spin, Pagination } from 'antd';
import { motion } from 'framer-motion';
import { TrophyOutlined, CalendarOutlined, TeamOutlined, RightOutlined, SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { NeuSurface } from '../components/shared/NeuSurface';
import { SmallBadge } from '../components/shared/SmallBadge';
import { JobPostService } from '@/services/JobPostService';
import { ApplicationService } from '@/services/ApplicationService';
import { useStudentProfileQuery } from '@/hooks/useStudentProfile';
import { useActiveJobsQuery, useMyApplicationsIdsQuery } from '@/hooks/useStudentDashboardQueries';
import { cc, hexToRgba } from '../constants';

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
    primary: { bg: cc.primary, text: '#fff', border: 'none', shadow: cc.shadowBrand },
    ghost: { bg: '#fff', text: cc.primary, border: cc.border, shadow: 'none' },
    success: { bg: '#fff', text: cc.success, border: `${cc.success}40`, shadow: 'none' },
    danger: { bg: cc.dangerMuted, text: cc.danger, border: `${cc.danger}30`, shadow: 'none' },
    warning: { bg: '#fff', text: cc.warning, border: `${cc.warning}40`, shadow: 'none' },
  };
  const { bg, text, border, shadow } = styles[variant];
  const sizes = { sm: { padding: '8px 14px', fontSize: 12 }, md: { padding: '10px 16px', fontSize: 13 }, lg: { padding: '12px 22px', fontSize: 14 } };
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
        width: fullWidth ? '100%' : 'auto', justifyContent: 'center',
        boxShadow: shadow,
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

export const JobBoardTab: React.FC = () => {
  const { message } = App.useApp();
  const { t } = useTranslation(['jobs']);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [techFilter, setTechFilter] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  const { data: profile } = useStudentProfileQuery();
  const hasCv = !!profile?.cvFileUrl;
  const currentSemester = profile?.currentSemester ?? 5;

  const { data: jobs = [], isLoading: jobsLoading } = useActiveJobsQuery();
  const { data: appliedJobIds = new Set<number>(), isLoading: appsLoading } = useMyApplicationsIdsQuery();
  const loading = jobsLoading || appsLoading;

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = !searchTerm || 
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.enterpriseName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTech = techFilter.length === 0 ||
        (Array.isArray(job.requiredSkills) && job.requiredSkills.some((skill: string) => techFilter.includes(skill.toLowerCase())));
      return matchesSearch && matchesTech;
    });
  }, [jobs, searchTerm, techFilter]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, techFilter]);

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: cc.textPrimary, margin: '0 0 6px', letterSpacing: '-0.01em' }}>{t('jobBoardTitle', 'Job Board')}</h2>
        <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>{t('jobBoardDesc', 'Browse and apply for internship positions')}</p>
      </div>

      {/* Search & Filters */}
      <NeuSurface style={{ padding: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <input
            type="text"
            placeholder={t("searchPlaceholder", "Search by position, company...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: '10px 16px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, outline: 'none', fontFamily: "'Inter', sans-serif", color: cc.textPrimary }}
          />
          <CTAButton variant="primary" icon={<SearchOutlined />}>{t('search', 'Search')}</CTAButton>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: cc.textMuted }}>{t('filterBy', 'Filter by:')}</span>
          {['React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS'].map(tech => (
            <motion.button
              key={tech}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTechFilter(prev => prev.includes(tech.toLowerCase()) 
                ? prev.filter(t => t !== tech.toLowerCase()) 
                : [...prev, tech.toLowerCase()])}
              style={{
                padding: '6px 12px', borderRadius: cc.radiusFull, fontSize: 12, fontWeight: 600,
                border: `1px solid ${techFilter.includes(tech.toLowerCase()) ? cc.primary : cc.border}`,
                background: techFilter.includes(tech.toLowerCase()) ? cc.primaryMuted : 'transparent',
                color: techFilter.includes(tech.toLowerCase()) ? cc.primary : cc.textSecondary,
                cursor: 'pointer',
              }}
            >
              {tech}
            </motion.button>
          ))}
        </div>
      </NeuSurface>

      {/* Job Cards */}
      {filteredJobs.length === 0 ? (
        <EmptyState icon={<TrophyOutlined style={{ fontSize: 32 }} />} title={t("noJobsFound", "No matching job postings found")} description={t("refineFilters", "Please try refining your keywords or filters")} />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {paginatedJobs.map((job, index) => (
              <motion.div key={job.jobPostId || index} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} style={{ height: '100%' }}>
                <NeuSurface style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s', height: '100%', display: 'flex', flexDirection: 'column' }} onClick={() => navigate(`/job/${job.jobPostId}`)}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: cc.radiusMd, background: hexToRgba(cc.primary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.primary, fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
                      {job.enterpriseName?.charAt(0) || 'E'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600, color: cc.textPrimary, margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.title || t('internshipPosition', 'Internship Position')}</h4>
                      <p style={{ fontSize: 12, color: cc.textMuted, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.enterpriseName || t('company', 'Company')}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                    {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: cc.textMuted }}><EnvironmentOutlined style={{ fontSize: 12 }} />{job.location}</span>}
                    {job.positionsCount != null && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: cc.textMuted }}>
                        <TeamOutlined style={{ fontSize: 12 }} />
                        {job.currentApplicationCount != null
                          ? `${job.positionsCount - job.currentApplicationCount} ${job.positionsCount - job.currentApplicationCount === 1 ? 'position' : 'positions'} open`
                          : `${job.positionsCount} ${job.positionsCount === 1 ? 'position' : 'positions'}`}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: cc.textMuted, margin: '0 0 14px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{job.description || t('jobDescription', 'Job description...')}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: `1px solid ${cc.borderSubtle}`, marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {appliedJobIds.has(job.jobPostId) && <SmallBadge label={t('applied', 'Applied')} variant="info" />}
                      <SmallBadge label={job.status === 'OPEN' ? t('open', 'Open') : t('closed', 'Closed')} variant={job.status === 'OPEN' ? 'success' : 'neutral'} />
                    </div>
                    <CTAButton variant="ghost" size="sm" icon={<RightOutlined />} onClick={(e) => { e?.stopPropagation(); navigate(`/job/${job.jobPostId}`); }}>{t('viewDetails', 'View details')}</CTAButton>
                  </div>
                </NeuSurface>
              </motion.div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredJobs.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showTotal={(total, range) => `${range[0]}-${range[1]} ${t('ofTotalJobs', 'of {{total}} jobs', { total })}`}
            />
          </div>
        </>
      )}
    </div>
  );
};
