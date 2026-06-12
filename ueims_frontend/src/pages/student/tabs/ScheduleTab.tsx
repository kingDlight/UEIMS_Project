import React, { useEffect, useState } from 'react';
import { message, Spin } from 'antd';
import { motion } from 'framer-motion';
import { CalendarOutlined, ClockCircleOutlined, BankOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, ExclamationCircleOutlined, LinkOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { NeuSurface } from '../components/shared/NeuSurface';
import { SmallBadge } from '../components/shared/SmallBadge';
import { InterviewService } from '@/services/InterviewService';
import { cc, hexToRgba } from '../constants';

const CTAButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
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

export const ScheduleTab: React.FC = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [declining, setDeclining] = useState<any>(null);
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => { fetchInterviews(); }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await InterviewService.getMySchedules();
      setInterviews(res.data || []);
    } catch (err) {
      console.error('Failed to fetch interviews', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (interviewId: string) => {
    try {
      await InterviewService.confirm(interviewId);
      message.success('Interview confirmed successfully!');
      setConfirming(null);
      fetchInterviews();
    } catch (err: any) {
      if (err.response?.data?.message?.includes('expired')) {
        message.error('This interview invitation has expired.');
      } else {
        message.error(err.response?.data?.message || 'Failed to confirm!');
      }
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      message.error('You must provide a valid reason for declining.');
      return;
    }
    try {
      await InterviewService.decline(declining.interviewId, declineReason);
      message.success('You have declined the interview invitation.');
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
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: cc.textPrimary, margin: '0 0 6px', letterSpacing: '-0.01em' }}>Interview Schedule</h2>
        <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>Your upcoming interviews and appointments</p>
      </div>

      {/* Confirm Modal */}
      {confirming && (
        <NeuSurface style={{ padding: 24, marginBottom: 20, border: `2px solid ${cc.info}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <ExclamationCircleOutlined style={{ fontSize: 24, color: cc.info }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: cc.textPrimary, margin: 0 }}>Confirm Interview Attendance</h3>
          </div>
          <p style={{ fontSize: 13, color: cc.textMuted, margin: '0 0 20px', lineHeight: 1.6 }}>
            Are you sure you want to accept this interview schedule? The company will be notified of your commitment. <strong>This action cannot be undone.</strong>
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <CTAButton variant="ghost" onClick={() => setConfirming(null)}>Cancel</CTAButton>
            <CTAButton variant="success" icon={<CheckCircleOutlined />} onClick={() => handleConfirm(confirming)}>Yes, Confirm</CTAButton>
          </div>
        </NeuSurface>
      )}

      {/* Decline Modal */}
      {declining && (
        <NeuSurface style={{ padding: 24, marginBottom: 20, border: `2px solid ${cc.danger}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <WarningOutlined style={{ fontSize: 24, color: cc.danger }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: cc.textPrimary, margin: 0 }}>Decline Interview Invitation</h3>
          </div>
          <div style={{ padding: 12, borderRadius: cc.radiusMd, background: cc.dangerMuted, marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: cc.dangerText, margin: 0, fontWeight: 600 }}>
              Are you sure you want to decline this interview? This action will formally withdraw you from this application cycle.
            </p>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, display: 'block', marginBottom: 6 }}>
              Reason for Refusal <span style={{ color: cc.danger }}>*</span>
            </label>
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
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: cc.textPrimary, margin: '0 0 8px' }}>{interview.jobTitle || 'Interview'}</h4>
                    <p style={{ fontSize: 13, color: cc.textMuted, margin: '0 0 8px' }}><BankOutlined /> {interview.enterpriseName}</p>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: cc.textSecondary }}><CalendarOutlined /> {new Date(interview.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: cc.textSecondary }}><ClockCircleOutlined /> {new Date(interview.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
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
                    <SmallBadge label={interview.status || 'PENDING'} variant={interview.status === 'CONFIRMED' ? 'success' : interview.status === 'DECLINED' ? 'error' : 'warning'} />
                    {interview.status === 'PENDING' && (
                      <>
                        <CTAButton variant="success" icon={<CheckCircleOutlined />} onClick={() => setConfirming(interview.interviewId)}>Confirm</CTAButton>
                        <CTAButton variant="danger" icon={<CloseCircleOutlined />} onClick={() => setDeclining(interview)}>Decline</CTAButton>
                      </>
                    )}
                  </div>
                </div>
              </NeuSurface>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
