import React, { useEffect, useState, useMemo } from 'react';
import { message, Spin, Pagination } from 'antd';
import { motion } from 'framer-motion';
import { StarOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { NeuSurface } from '../components/shared/NeuSurface';
import { StudentEnterpriseFeedbackService } from '@/services/StudentEnterpriseFeedbackService';
import { EnterpriseAssignmentService } from '@/services/EnterpriseAssignmentService';
import { api } from '@/services/api';
import { cc } from '../constants';

const CTAButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'warning';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}> = ({ children, onClick, variant = 'primary', size = 'sm', icon, disabled = false, loading = false }) => {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    primary: { bg: 'linear-gradient(135deg, #E67E22, #E67E22)', text: '#fff', border: 'none' },
    ghost: { bg: '#fff', text: cc.primary, border: cc.border },
    warning: { bg: '#fff', text: cc.warning, border: `${cc.warning}40` },
  };
  const { bg, text, border } = styles[variant];
  const sizes = { sm: { padding: '6px 12px', fontSize: 12 }, md: { padding: '10px 16px', fontSize: 13 } };
  const { padding, fontSize } = sizes[size];

  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding, fontSize, fontWeight: 700,
      color: disabled ? cc.textMuted : text, background: disabled ? '#f5f7fa' : bg,
      border: variant === 'primary' ? 'none' : `1px solid ${border}`, borderRadius: 12,
      cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: "'Inter', sans-serif", opacity: disabled ? 0.6 : 1,
    }}>
      {loading ? <span>...</span> : icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </button>
  );
};

export const FeedbackTab: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ratings, setRatings] = useState({ trainingQuality: 5, supervisorSupport: 5, workEnvironment: 5, overall: 5 });
  const [comment, setComment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentAssignment, setCurrentAssignment] = useState<any>(null);
  const pageSize = 5;

  useEffect(() => { fetchFeedbacks(); fetchAssignment(); }, []);

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

  const paginatedFeedbacks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return feedbacks.slice(start, start + pageSize);
  }, [feedbacks, currentPage]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await StudentEnterpriseFeedbackService.getMyFeedbacks();
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error('Failed to fetch feedbacks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentAssignment?.assignmentId) {
      message.error('You must have an active internship assignment to submit feedback.');
      return;
    }
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
      await StudentEnterpriseFeedbackService.create({
        enterpriseId: currentAssignment.enterprise?.enterpriseId || currentAssignment.enterpriseId,
        semesterId: currentAssignment.semester?.semesterId || currentAssignment.semesterId,
        trainingQualityScore: trainingQuality,
        supervisorSupportScore: supervisorSupport,
        workEnvironmentScore: workEnvironment,
        overallScore: overall,
        positiveFeedback: comment,
        improvementFeedback: '',
        additionalComments: '',
      });
      message.success('Thank you! Your feedback has been submitted successfully.');
      setRatings({ trainingQuality: 5, supervisorSupport: 5, workEnvironment: 5, overall: 5 });
      setComment('');
      fetchFeedbacks();
    } catch (err: any) {
      if (err.response?.data?.message?.includes('already')) {
        message.error('You have already submitted feedback for this enterprise.');
      } else {
        message.error(err.response?.data?.message || 'Submit failed!');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const RatingInput: React.FC<{ label: string; value: number; onChange: (v: number) => void; required?: boolean }> = ({ label, value, onChange, required }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 8 }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
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

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: cc.text, margin: '0 0 6px' }}>Enterprise Feedback</h2>
        <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>Rate your internship experience</p>
      </div>

      {/* Submit Feedback Form */}
      <NeuSurface style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: 12, borderRadius: cc.radiusMd, background: cc.infoMuted }}>
          <ExclamationCircleOutlined style={{ fontSize: 20, color: cc.info }} />
          <p style={{ fontSize: 12, color: cc.infoText, margin: 0 }}>Your feedback is confidential and only visible to the Training Manager</p>
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: cc.text, margin: '0 0 16px' }}>Rate Your Internship Experience</h3>
        
        <RatingInput label="Training Quality" value={ratings.trainingQuality} onChange={(v) => setRatings({ ...ratings, trainingQuality: v })} required />
        <RatingInput label="Supervisor Support" value={ratings.supervisorSupport} onChange={(v) => setRatings({ ...ratings, supervisorSupport: v })} required />
        <RatingInput label="Work Environment" value={ratings.workEnvironment} onChange={(v) => setRatings({ ...ratings, workEnvironment: v })} required />
        
        <div style={{ borderTop: `1px solid ${cc.borderSubtle}`, paddingTop: 16, marginTop: 8 }}>
          <RatingInput label="Overall Rating" value={ratings.overall} onChange={(v) => setRatings({ ...ratings, overall: v })} required />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>Written Comments (Optional)</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="Share your detailed experience..." style={{ width: '100%', padding: '10px 12px', borderRadius: cc.radiusMd, border: `1px solid ${cc.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <CTAButton variant="ghost" onClick={() => { setRatings({ trainingQuality: 5, supervisorSupport: 5, workEnvironment: 5, overall: 5 }); setComment(''); }}>Clear</CTAButton>
          <CTAButton variant="primary" onClick={handleSubmit} loading={submitting}>Submit Feedback</CTAButton>
        </div>
      </NeuSurface>

      {/* Feedback List */}
      {feedbacks.length > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {paginatedFeedbacks.map((fb, index) => (
              <motion.div key={fb.feedbackId || index} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <NeuSurface style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 18 }}>{'★'.repeat(fb.overallScore || 0)}</span>
                        <span style={{ fontSize: 12, color: cc.info, background: cc.infoMuted, padding: '2px 8px', borderRadius: 4 }}>{fb.enterprise?.enterpriseName || 'Company'}</span>
                      </div>
                      {fb.positiveFeedback && (
                        <p style={{ fontSize: 14, color: cc.text, margin: '0 0 4px', lineHeight: 1.5 }}>{fb.positiveFeedback}</p>
                      )}
                      <p style={{ fontSize: 12, color: cc.textMuted, margin: '8px 0 0' }}>{fb.submittedAt ? new Date(fb.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                    </div>
                  </div>
                </NeuSurface>
              </motion.div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={feedbacks.length}
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
