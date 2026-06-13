import React, { useEffect, useState, useMemo } from 'react';
import { message, Spin, Pagination, Collapse } from 'antd';
import { motion } from 'framer-motion';
import { SnippetsOutlined, PlusOutlined, SendOutlined, EditOutlined, EyeOutlined, WarningOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { NeuSurface } from '../components/shared/NeuSurface';
import { SmallBadge } from '../components/shared/SmallBadge';
import { WeeklyReportService } from '@/services/WeeklyReportService';
import { EnterpriseAssignmentService } from '@/services/EnterpriseAssignmentService';
import { cc, hexToRgba } from '../constants';

const CTAButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'success' | 'danger' | 'warning';
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
    warning: { bg: '#fff', text: cc.warning, border: `${cc.warning}40` },
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

export const ReportsTab: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [currentAssignment, setCurrentAssignment] = useState<any>(null);
  const [formData, setFormData] = useState({ weekNumber: '', tasksCompleted: '', issuesChallenges: '', lessonsLearned: '', planNextWeek: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => { fetchReports(); fetchAssignment(); }, []);

  const fetchAssignment = async () => {
    try {
      const res = await EnterpriseAssignmentService.getMyAssignment();
      const data = res.data?.result ?? res.data;
      if (data) {
        setCurrentAssignment(data);
      }
    } catch (err) {
      console.error('No active assignment found', err);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await WeeklyReportService.getMyReports();
      const data = res.data?.result ?? res.data;
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.weekNumber || (!formData.tasksCompleted && !formData.lessonsLearned)) {
      message.error('Please fill in all required fields!');
      return;
    }
    if (!currentAssignment?.assignmentId) {
      message.error('No active internship assignment found. Please complete your internship assignment first.');
      return;
    }
    try {
      setSubmitting(true);
      await WeeklyReportService.create({
        assignmentId: currentAssignment.assignmentId,
        weekNumber: parseInt(formData.weekNumber),
        tasksCompleted: formData.tasksCompleted,
        issuesChallenges: formData.issuesChallenges,
        lessonsLearned: formData.lessonsLearned,
        planNextWeek: formData.planNextWeek,
      });
      message.success('Report submitted successfully!');
      setShowForm(false);
      setFormData({ weekNumber: '', tasksCompleted: '', issuesChallenges: '', lessonsLearned: '', planNextWeek: '' });
      fetchReports();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Submit failed!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.lessonsLearned) {
      message.error('Report content cannot be empty!');
      return;
    }
    try {
      setSubmitting(true);
      await WeeklyReportService.update(editingReport.reportId, {
        tasksCompleted: formData.tasksCompleted,
        issuesChallenges: formData.issuesChallenges,
        lessonsLearned: formData.lessonsLearned,
        planNextWeek: formData.planNextWeek,
      });
      message.success('Report updated successfully!');
      setEditingReport(null);
      setFormData({ weekNumber: '', tasksCompleted: '', issuesChallenges: '', lessonsLearned: '', planNextWeek: '' });
      fetchReports();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Update failed!');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'PENDING_REVIEW': return 'warning';
      case 'NOT_SUBMITTED': return 'warning';
      default: return 'warning';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'PENDING_REVIEW': return 'Pending Review';
      case 'NOT_SUBMITTED': return 'Not Submitted';
      case 'REVIEWED': return 'Reviewed';
      default: return status || 'Draft';
    }
  };

  useEffect(() => { setCurrentPage(1); }, [reports.length]);

  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return reports.slice(start, start + pageSize);
  }, [reports, currentPage]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: cc.textPrimary, margin: '0 0 6px', letterSpacing: '-0.01em' }}>Weekly Reports</h2>
        <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>Track your internship progress on a weekly basis</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <CTAButton variant="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>Submit Report</CTAButton>
      </div>

      {/* Submit Form */}
      {showForm && (
        <NeuSurface style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: cc.textPrimary, margin: '0 0 16px' }}>Submit Weekly Report</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>Week Number *</label>
            <input type="number" value={formData.weekNumber} onChange={(e) => setFormData({ ...formData, weekNumber: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>Tasks Completed *</label>
            <textarea value={formData.tasksCompleted} onChange={(e) => setFormData({ ...formData, tasksCompleted: e.target.value })} rows={3} placeholder="What did you accomplish this week?" style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>Issues & Challenges</label>
            <textarea value={formData.issuesChallenges} onChange={(e) => setFormData({ ...formData, issuesChallenges: e.target.value })} rows={2} placeholder="Any challenges you faced..." style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>Lessons Learned</label>
            <textarea value={formData.lessonsLearned} onChange={(e) => setFormData({ ...formData, lessonsLearned: e.target.value })} rows={2} placeholder="What did you learn this week?" style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>Plan for Next Week</label>
            <textarea value={formData.planNextWeek} onChange={(e) => setFormData({ ...formData, planNextWeek: e.target.value })} rows={2} placeholder="What are you planning for next week?" style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <CTAButton variant="ghost" onClick={() => { setShowForm(false); setFormData({ weekNumber: '', tasksCompleted: '', issuesChallenges: '', lessonsLearned: '', planNextWeek: '' }); }}>Cancel</CTAButton>
            <CTAButton variant="primary" icon={<SendOutlined />} onClick={handleSubmit} loading={submitting}>Submit</CTAButton>
          </div>
        </NeuSurface>
      )}

      {/* Submit Form */}
      {showForm && (
        <NeuSurface style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: cc.textPrimary, margin: '0 0 16px' }}>Submit Weekly Report</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>Week Number *</label>
            <input type="number" value={formData.weekNumber} onChange={(e) => setFormData({ ...formData, weekNumber: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>Tasks Completed *</label>
            <textarea value={formData.tasksCompleted} onChange={(e) => setFormData({ ...formData, tasksCompleted: e.target.value })} rows={3} placeholder="What did you accomplish this week?" style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>Issues & Challenges</label>
            <textarea value={formData.issuesChallenges} onChange={(e) => setFormData({ ...formData, issuesChallenges: e.target.value })} rows={2} placeholder="Any challenges you faced..." style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>Lessons Learned</label>
            <textarea value={formData.lessonsLearned} onChange={(e) => setFormData({ ...formData, lessonsLearned: e.target.value })} rows={2} placeholder="What did you learn this week?" style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>Plan for Next Week</label>
            <textarea value={formData.planNextWeek} onChange={(e) => setFormData({ ...formData, planNextWeek: e.target.value })} rows={2} placeholder="What are you planning for next week?" style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <CTAButton variant="ghost" onClick={() => { setShowForm(false); setFormData({ weekNumber: '', tasksCompleted: '', issuesChallenges: '', lessonsLearned: '', planNextWeek: '' }); }}>Cancel</CTAButton>
            <CTAButton variant="primary" icon={<SendOutlined />} onClick={handleSubmit} loading={submitting}>Submit</CTAButton>
          </div>
        </NeuSurface>
      )}

      {/* Edit Form */}
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
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>Tasks Completed *</label>
            <textarea value={formData.tasksCompleted} onChange={(e) => setFormData({ ...formData, tasksCompleted: e.target.value })} rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>Issues & Challenges</label>
            <textarea value={formData.issuesChallenges} onChange={(e) => setFormData({ ...formData, issuesChallenges: e.target.value })} rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>Lessons Learned</label>
            <textarea value={formData.lessonsLearned} onChange={(e) => setFormData({ ...formData, lessonsLearned: e.target.value })} rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>Plan for Next Week</label>
            <textarea value={formData.planNextWeek} onChange={(e) => setFormData({ ...formData, planNextWeek: e.target.value })} rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <CTAButton variant="ghost" onClick={() => { setEditingReport(null); setFormData({ weekNumber: '', tasksCompleted: '', issuesChallenges: '', lessonsLearned: '', planNextWeek: '' }); }}>Cancel</CTAButton>
            <CTAButton variant="warning" icon={<SendOutlined />} onClick={handleUpdate} loading={submitting}>Resubmit Report</CTAButton>
          </div>
        </NeuSurface>
      )}

      {reports.length === 0 ? (
        <EmptyState icon={<SnippetsOutlined style={{ fontSize: 32 }} />} title="No reports yet" description="Your weekly reports will appear once you start your internship" />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {paginatedReports.map((report, index) => (
              <motion.div key={report.reportId || index} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <NeuSurface style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ width: 52, height: 52, borderRadius: cc.radiusMd, background: hexToRgba(cc.primary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.primary, fontSize: 14, fontWeight: 700 }}>
                        W{report.weekNumber}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 600, color: cc.textPrimary, margin: '0 0 4px' }}>Week {report.weekNumber} Report</h4>
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
                          <CTAButton variant="warning" size="sm" icon={<EditOutlined />} onClick={() => { setEditingReport(report); setFormData({ weekNumber: String(report.weekNumber), tasksCompleted: report.tasksCompleted || '', issuesChallenges: report.issuesChallenges || '', lessonsLearned: report.lessonsLearned || '', planNextWeek: report.planNextWeek || '' }); }}>Edit & Resubmit</CTAButton>
                        )}
                        <CTAButton variant="ghost" size="sm" icon={expandedReport === report.reportId ? <UpOutlined /> : <DownOutlined />} onClick={() => setExpandedReport(expandedReport === report.reportId ? null : report.reportId)}>{expandedReport === report.reportId ? 'Collapse' : 'Expand'}</CTAButton>
                      </div>
                    </div>
                  </div>
                  {expandedReport === report.reportId && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${cc.border}` }}>
                      <div style={{ display: 'grid', gap: 12 }}>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, margin: '0 0 4px' }}>Tasks Completed</p>
                          <p style={{ fontSize: 13, color: cc.textPrimary, margin: 0, whiteSpace: 'pre-wrap' }}>{report.tasksCompleted || 'N/A'}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, margin: '0 0 4px' }}>Issues & Challenges</p>
                          <p style={{ fontSize: 13, color: cc.textPrimary, margin: 0, whiteSpace: 'pre-wrap' }}>{report.issuesChallenges || 'N/A'}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, margin: '0 0 4px' }}>Lessons Learned</p>
                          <p style={{ fontSize: 13, color: cc.textPrimary, margin: 0, whiteSpace: 'pre-wrap' }}>{report.lessonsLearned || 'N/A'}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, margin: '0 0 4px' }}>Plan for Next Week</p>
                          <p style={{ fontSize: 13, color: cc.textPrimary, margin: 0, whiteSpace: 'pre-wrap' }}>{report.planNextWeek || 'N/A'}</p>
                        </div>
                        {report.feedback && (
                          <div style={{ padding: 12, borderRadius: cc.radiusMd, background: cc.dangerMuted }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: cc.dangerText, margin: '0 0 4px' }}>Enterprise Feedback:</p>
                            <p style={{ fontSize: 13, color: cc.dangerText, margin: 0, whiteSpace: 'pre-wrap' }}>{report.feedback}</p>
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
              total={reports.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
            />
          </div>
        </>
      )}
    </div>
  );
};
