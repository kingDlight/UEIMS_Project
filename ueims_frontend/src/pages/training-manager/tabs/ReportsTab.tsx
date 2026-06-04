import React, { useState, useEffect } from 'react';
import { Spin, message } from 'antd';
import { c } from '../constants';
import { feedbackSamples } from '../data';
import { NeuSurface } from '../components/shared/NeuSurface';
import { SmallPill } from '../components/shared/SmallPill';
import { FinalGradeService } from '@/services/FinalGradeService';

export const ReportsTab: React.FC = () => {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGrades = async () => {
    try {
      setLoading(true);
      const data = await FinalGradeService.getAll();
      setGrades(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách điểm số.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrades();
  }, []);

  const getStatusTone = (status: string) => {
    if (status === 'PASS') return c.success;
    if (status === 'FAIL') return c.danger;
    return c.warning;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <NeuSurface style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: c.text, margin: 0 }}>Final Grade & Feedback</h2>
            <p style={{ fontSize: 14, color: c.textMuted, marginTop: 6 }}>Review rubric scores, finalize internship grades, and inspect anonymous student feedback</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={{ padding: '10px 14px', borderRadius: 14, border: 'none', background: c.primary, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Input Final Grade</button>
            <button style={{ padding: '10px 14px', borderRadius: 14, border: '1px solid rgba(233,101,0,.16)', background: '#fff', color: c.primaryDark, fontWeight: 800, cursor: 'pointer' }}>Export Grade Report (PDF)</button>
          </div>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {grades.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: c.textMuted }}>Chưa có dữ liệu điểm.</div>
              ) : (
                grades.map((row: any) => (
                  <div key={row.finalGradeId} style={{ padding: '14px 16px', borderRadius: 18, background: '#fff', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 4px 16px rgba(15,23,42,.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>{row.student?.fullName || 'N/A'}</div>
                        <div style={{ fontSize: 11.5, color: c.textMuted, marginTop: 3 }}>
                          {row.student?.studentCode || 'N/A'} - Kì {row.semester?.semesterCode}
                        </div>
                      </div>
                      <SmallPill color={getStatusTone(row.overallStatus)}>{row.overallStatus}</SmallPill>
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 10, fontSize: 12.5, color: c.textMuted }}>
                      <span>Enterprise Score: {row.enterpriseTotalScore}</span>
                      <span>Final Academic Grade: <strong style={{ color: c.text }}>{row.finalGrade}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {feedbackSamples.map((feedback) => (
                <div key={`${feedback.student}-${feedback.enterprise}`} style={{ padding: '14px 16px', borderRadius: 18, background: '#fff', border: '1px solid rgba(226,232,240,.9)', boxShadow: '0 4px 16px rgba(15,23,42,.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>{feedback.enterprise}</div>
                      <div style={{ fontSize: 11.5, color: c.textMuted, marginTop: 3 }}>Anonymous student feedback</div>
                    </div>
                    <SmallPill color={feedback.tone}>{feedback.score.toFixed(1)} / 5</SmallPill>
                  </div>
                  <div style={{ fontSize: 12.5, color: c.textMuted, lineHeight: 1.6, marginTop: 10 }}>{feedback.comment}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </NeuSurface>
    </div>
  );
};

