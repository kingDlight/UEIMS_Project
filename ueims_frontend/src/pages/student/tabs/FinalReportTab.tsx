import React, { useEffect, useState } from 'react';
import { message, Spin } from 'antd';
import { FileOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { NeuSurface } from '../components/shared/NeuSurface';
import { SmallBadge } from '../components/shared/SmallBadge';
import { FinalReportService } from '@/services/FinalReportService';
import { EnterpriseAssignmentService } from '@/services/EnterpriseAssignmentService';
import { api } from '@/services/api';
import { cc, hexToRgba } from '../constants';

const CTAButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}> = ({ children, onClick, variant = 'primary', size = 'sm', icon, disabled = false, loading = false }) => {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    primary: { bg: cc.primary, text: '#fff', border: 'none' },
    ghost: { bg: '#fff', text: cc.primary, border: cc.border },
  };
  const { bg, text, border } = styles[variant];
  const sizes = { sm: { padding: '8px 14px', fontSize: 12 }, md: { padding: '10px 16px', fontSize: 13 } };
  const { padding, fontSize } = sizes[size];

  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding, fontSize, fontWeight: 700,
      color: disabled ? cc.textMuted : text, background: disabled ? cc.neutralBg : bg,
      border: variant === 'primary' ? 'none' : `1px solid ${border}`, borderRadius: cc.radiusMd,
      cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: "'Inter', sans-serif", opacity: disabled ? 0.6 : 1,
    }}>
      {loading ? <Spin size="small" /> : icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </button>
  );
};

export const FinalReportTab: React.FC = () => {
  const { t } = useTranslation(['finalReport', 'common']);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finalReport, setFinalReport] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => { fetchFinalReport(); }, []);

  const fetchFinalReport = async () => {
    try {
      setLoading(true);
      const res = await FinalReportService.getMyReport();
      const data = res.data?.result ?? res.data;
      setFinalReport(data || null);
    } catch {
      setFinalReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      if (f.type !== 'application/pdf') {
        message.error(t('invalidFileError', 'Invalid file. Please upload your final report strictly in PDF format under 20MB.'));
        return;
      }
      if (f.size > 20 * 1024 * 1024) {
        message.error(t('fileTooLargeError', 'File too large. Final report must not exceed 20MB.'));
        return;
      }
      setFile(f);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      message.error(t('pleaseUploadPdf', 'Please upload your final report PDF!'));
      return;
    }
    try {
      setSubmitting(true);
      // Get current student's assignment ID first
      const assignmentRes = await EnterpriseAssignmentService.getMyAssignment();
      const assignment = assignmentRes.data?.result ?? assignmentRes.data;
      if (!assignment?.assignmentId) {
        message.error(t('noAssignmentError', 'You do not have an active internship assignment yet.'));
        return;
      }
      await FinalReportService.upload(assignment.assignmentId, file);
      message.success(t('submitSuccess', 'Final report submitted successfully!'));
      setFile(null);
      fetchFinalReport();
    } catch (err: any) {
      message.error(err.response?.data?.message || t('submitFailed', 'Submit failed!'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: cc.textPrimary, margin: '0 0 6px', letterSpacing: '-0.01em' }}>{t('pageTitle', 'Final Internship Report')}</h2>
        <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>{t('pageSubtitle', 'Compile and submit your official final internship report (PDF) for academic grading')}</p>
      </div>

      {/* Instructions */}
      <NeuSurface style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: cc.textPrimary, margin: '0 0 12px' }}>{t('requirementsTitle', 'Report Requirements')}</h3>
        <ul style={{ fontSize: 13, color: cc.textMuted, margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
          <li>{t('req1', 'File format: PDF only')}</li>
          <li>{t('req2', 'Maximum file size: 20MB')}</li>
          <li>{t('req3', 'Include: Cover page, table of contents, weekly summaries, learning outcomes')}</li>
          <li>{t('req4', 'Must be approved by your enterprise supervisor before submission')}</li>
        </ul>
      </NeuSurface>

      {/* Upload Area */}
      <NeuSurface style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: cc.radiusMd, background: cc.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cc.primary }}>
            <FileOutlined style={{ fontSize: 20 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: cc.textPrimary, margin: 0 }}>{t('uploadTitle', 'Upload Final Report')}</h3>
            <p style={{ fontSize: 12, color: cc.textMuted, margin: '2px 0 0' }}>{t('uploadSubtitle', 'Submit your completed internship report in PDF format')}</p>
          </div>
        </div>

        <div
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById('final-report-input')?.click()}
          style={{
            border: `2px dashed ${dragActive ? cc.primary : cc.border}`,
            borderRadius: cc.radiusLg, padding: '36px 24px', textAlign: 'center',
            background: dragActive ? cc.primaryMuted : cc.neutralBg,
            transition: 'all 0.2s ease', cursor: 'pointer',
          }}
        >
          <input id="final-report-input" type="file" accept=".pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) { if (f.type !== 'application/pdf') message.error(t('onlyPdfAllowed', 'Only PDF allowed!')); else if (f.size > 20 * 1024 * 1024) message.error(t('max20Mb', 'Max 20MB!')); else setFile(f); }}} style={{ display: 'none' }} />
          {file ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <FileOutlined style={{ fontSize: 32, color: cc.success }} />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: cc.textPrimary, margin: 0 }}>{file.name}</p>
                <p style={{ fontSize: 12, color: cc.textMuted, margin: '2px 0 0' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          ) : (
            <>
              <UploadOutlined style={{ fontSize: 40, color: cc.textMuted, marginBottom: 12 }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: cc.textPrimary, margin: '0 0 4px' }}>{t('dragDrop', 'Drag & drop your final report here')}</p>
              <p style={{ fontSize: 12, color: cc.textMuted, margin: 0 }}>{t('orBrowse', 'or click to browse files')}</p>
            </>
          )}
        </div>
        {file && (
          <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <CTAButton variant="ghost" onClick={() => setFile(null)}>{t('cancel', 'Cancel')}</CTAButton>
            <CTAButton variant="primary" icon={<UploadOutlined />} onClick={handleSubmit} loading={submitting}>{t('submitReport', 'Submit Report')}</CTAButton>
          </div>
        )}
      </NeuSurface>

      {/* Submitted Report */}
      {finalReport && (
        <NeuSurface style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: cc.textPrimary, margin: 0 }}>{t('submittedReport', 'Submitted Report')}</h3>
            <SmallBadge label={finalReport.status || 'SUBMITTED'} variant={finalReport.status === 'APPROVED' ? 'success' : finalReport.status === 'REJECTED' ? 'error' : 'warning'} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: cc.radiusMd, background: cc.neutralBg }}>
            <FileOutlined style={{ fontSize: 32, color: cc.primary }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: cc.textPrimary, margin: 0 }}>{finalReport.fileName || 'Final_Report.pdf'}</p>
              <p style={{ fontSize: 12, color: cc.textMuted, margin: '4px 0 0' }}>{t('submittedDate', 'Submitted')}: {finalReport.submittedAt ? new Date(finalReport.submittedAt).toLocaleDateString() : 'N/A'}</p>
            </div>
            <CTAButton variant="ghost" size="sm" icon={<EyeOutlined />} onClick={() => window.open(finalReport.fileUrl, '_blank')}>{t('view', 'View')}</CTAButton>
          </div>
        </NeuSurface>
      )}
    </div>
  );
};
