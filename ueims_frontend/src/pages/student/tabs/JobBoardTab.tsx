import React, { useEffect, useState } from 'react';
import { message, Spin } from 'antd';
import { motion } from 'framer-motion';
import { TrophyOutlined, CalendarOutlined, TeamOutlined, ClockCircleOutlined, RightOutlined, SendOutlined, CloseCircleOutlined, WarningOutlined, SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { NeuSurface } from '../components/shared/NeuSurface';
import { SmallBadge } from '../components/shared/SmallBadge';
import { api } from '@/services/api';
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
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applying, setApplying] = useState(false);
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

  const handleApply = async () => {
    if (!confirmApply) return;
    
    if (confirmApply.applicationDeadline && new Date(confirmApply.applicationDeadline) < new Date()) {
      message.error('Application failed. This job posting has reached its deadline.');
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
      if (err.response?.data?.message?.includes('already') || err.response?.data?.message?.includes('duplicate')) {
        message.error('You have already applied for this position.');
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
    const matchesTech = techFilter.length === 0 || 
      (job.requiredSkills && job.requiredSkills.some((skill: string) => techFilter.includes(skill.toLowerCase())));
    return matchesSearch && matchesTech;
  });

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: cc.textPrimary, margin: '0 0 6px', letterSpacing: '-0.01em' }}>Job Board</h2>
        <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>Browse and apply for internship positions</p>
      </div>

      {/* Search & Filters */}
      <NeuSurface style={{ padding: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Search by position, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: '10px 16px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, outline: 'none', fontFamily: "'Inter', sans-serif", color: cc.textPrimary }}
          />
          <CTAButton variant="primary" icon={<SearchOutlined />}>Search</CTAButton>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: cc.textMuted }}>Filter by:</span>
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

      {/* Confirm Apply Modal */}
      {confirmApply && (
        <NeuSurface style={{ padding: 24, marginBottom: 20, border: `2px solid ${cc.warning}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <WarningOutlined style={{ fontSize: 24, color: cc.warning }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: cc.textPrimary, margin: 0 }}>Confirm Application</h3>
          </div>
          <p style={{ fontSize: 13, color: cc.textMuted, margin: '0 0 12px' }}>You are applying for:</p>
          <div style={{ padding: 12, borderRadius: cc.radiusMd, background: cc.neutralBg, marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: cc.textPrimary, margin: 0 }}>{confirmApply.title}</p>
            <p style={{ fontSize: 13, color: cc.textMuted, margin: '4px 0 0' }}>{confirmApply.enterpriseName}</p>
          </div>
          <div style={{ padding: 12, borderRadius: cc.radiusMd, background: cc.dangerMuted, marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: cc.dangerText, margin: 0, fontWeight: 600 }}>
              Are you sure? You can only submit your application ONCE. No modifications allowed after submission.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <CTAButton variant="ghost" onClick={() => setConfirmApply(null)}>Cancel</CTAButton>
            <CTAButton variant="primary" icon={<SendOutlined />} onClick={handleApply} loading={applying}>Confirm & Submit</CTAButton>
          </div>
        </NeuSurface>
      )}

      {/* Job Cards */}
      {filteredJobs.length === 0 ? (
        <EmptyState icon={<TrophyOutlined style={{ fontSize: 32 }} />} title="No matching job postings found" description="Please try refining your keywords or filters" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {filteredJobs.map((job, index) => (
            <motion.div key={job.jobPostId || index} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
              <NeuSurface style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setSelectedJob(job)}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: cc.radiusMd, background: hexToRgba(cc.primary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.primary, fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
                    {job.enterpriseName?.charAt(0) || 'E'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: cc.textPrimary, margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.title || 'Internship Position'}</h4>
                    <p style={{ fontSize: 12, color: cc.textMuted, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.enterpriseName || 'Company'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                  {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: cc.textMuted }}><EnvironmentOutlined style={{ fontSize: 12 }} />{job.location}</span>}
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

      {/* Job Detail Drawer */}
      {selectedJob && (
        <div onClick={() => setSelectedJob(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} style={{ background: cc.surface, borderRadius: '24px 24px 0 0', maxWidth: 600, width: '100%', maxHeight: '85vh', overflow: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: cc.radiusLg, background: hexToRgba(cc.primary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.primary, fontSize: 24, fontWeight: 700, flexShrink: 0 }}>{selectedJob.enterpriseName?.charAt(0) || 'E'}</div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: cc.textPrimary, margin: '0 0 4px' }}>{selectedJob.title}</h2>
                  <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>{selectedJob.enterpriseName}</p>
                </div>
              </div>
              <CTAButton variant="ghost" size="sm" icon={<CloseCircleOutlined />} onClick={() => setSelectedJob(null)}>Close</CTAButton>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              {selectedJob.location && <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: cc.radiusMd, background: cc.neutralBg, fontSize: 13, color: cc.textSecondary }}><EnvironmentOutlined style={{ fontSize: 14 }} />{selectedJob.location}</span>}
              {selectedJob.maxPositions && <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: cc.radiusMd, background: cc.neutralBg, fontSize: 13, color: cc.textSecondary }}><TeamOutlined style={{ fontSize: 14 }} />{selectedJob.maxPositions} positions</span>}
            </div>
            {selectedJob.description && <div style={{ marginBottom: 18 }}><h3 style={{ fontSize: 13, fontWeight: 600, color: cc.textPrimary, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</h3><p style={{ fontSize: 13, color: cc.textSecondary, lineHeight: 1.6, margin: 0 }}>{selectedJob.description}</p></div>}
            {selectedJob.requirements && <div style={{ marginBottom: 18 }}><h3 style={{ fontSize: 13, fontWeight: 600, color: cc.textPrimary, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Requirements</h3><p style={{ fontSize: 13, color: cc.textSecondary, lineHeight: 1.6, margin: 0 }}>{selectedJob.requirements}</p></div>}
            {selectedJob.applicationDeadline && <div style={{ padding: 16, borderRadius: cc.radiusMd, background: cc.warningMuted, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}><ClockCircleOutlined style={{ fontSize: 20, color: cc.warning }} /><div><p style={{ fontSize: 11, color: cc.warningText, margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Application Deadline</p><p style={{ fontSize: 14, color: cc.warningText, margin: '2px 0 0', fontWeight: 600 }}>{new Date(selectedJob.applicationDeadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div></div>}
            <CTAButton variant="primary" size="lg" fullWidth icon={<SendOutlined />} onClick={() => {
              if (selectedJob.applicationDeadline && new Date(selectedJob.applicationDeadline) < new Date()) {
                message.error('This job posting has reached its deadline.');
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
