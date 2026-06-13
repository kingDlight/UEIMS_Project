import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { NeuSurface } from '../components/shared/NeuSurface';
import { api } from '@/services/api';

const cc = {
  primary: '#E67E22',
  primaryMuted: '#fff0e6',
  text: '#1e293b',
  textMuted: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  bgLight: '#f5f7fa',
  borderSubtle: '#f1f5f9',
  surface: '#ffffff',
  radiusMd: 8,
  radiusXl: 16,
};

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <NeuSurface style={{ padding: 56, textAlign: 'center' }}>
    <div style={{ width: 72, height: 72, borderRadius: '50%', background: cc.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: cc.primary }}>{icon}</div>
    <h3 style={{ fontSize: 16, fontWeight: 600, color: cc.text, margin: '0 0 6px' }}>{title}</h3>
    <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>{description}</p>
  </NeuSurface>
);

export const EvaluationTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState<any>(null);

  useEffect(() => { fetchEvaluation(); }, []);

  const fetchEvaluation = async () => {
    try {
      setLoading(true);
      const res = await api.get('/enterprise-evaluations/my-evaluation');
      const data = res.data?.result ?? res.data;
      setEvaluation(data || null);
    } catch {
      setEvaluation(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  const rubricScores = evaluation ? [
    { name: 'Attitude (20%)', score: evaluation.attitudeScore, maxScore: 10 },
    { name: 'Professionalism (40%)', score: evaluation.professionalismScore, maxScore: 10 },
    { name: 'Soft Skills (20%)', score: evaluation.softSkillsScore, maxScore: 10 },
    { name: 'Progress (20%)', score: evaluation.progressScore, maxScore: 10 },
  ] : [];

  const totalScore = rubricScores.reduce((sum: number, r: any) => sum + r.score, 0);
  const maxScore = rubricScores.reduce((sum: number, r: any) => sum + r.maxScore, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A', color: cc.success };
    if (pct >= 80) return { grade: 'B', color: cc.info };
    if (pct >= 70) return { grade: 'C', color: cc.warning };
    if (pct >= 60) return { grade: 'D', color: '#f97316' };
    return { grade: 'F', color: cc.danger };
  };

  const { grade, color } = getGrade(percentage);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: cc.text, margin: '0 0 6px' }}>Internship Evaluation</h2>
        <p style={{ fontSize: 13, color: cc.textMuted, margin: 0 }}>View final Rubrics scores, enterprise feedback, and official course grades</p>
      </div>

      {!evaluation ? (
        <EmptyState icon={<TrophyOutlined style={{ fontSize: 32 }} />} title="Evaluation not available" description="Your final evaluation will appear after you complete your internship" />
      ) : (
        <>
          {/* Grade Overview */}
          <NeuSurface style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ width: 100, height: 100, borderRadius: cc.radiusXl, background: `linear-gradient(135deg, ${color}20, ${color}10)`, border: `3px solid ${color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1 }}>{grade}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: cc.textMuted, marginTop: 4 }}>{percentage}%</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: cc.text, margin: '0 0 8px' }}>Final Grade: {grade}</h3>
                <p style={{ fontSize: 13, color: cc.textMuted, margin: 0, lineHeight: 1.6 }}>
                  Total Score: {totalScore}/{maxScore} points
                </p>
                <div style={{ marginTop: 12, height: 8, borderRadius: 4, background: cc.borderSubtle, overflow: 'hidden' }}>
                  <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            </div>
          </NeuSurface>

          {/* Rubric Scores */}
          <NeuSurface style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: cc.text, margin: '0 0 16px' }}>Rubric Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {rubricScores.map((rubric: any, i: number) => {
                const pct = Math.round((rubric.score / rubric.maxScore) * 100);
                const rubricColor = pct >= 80 ? cc.success : pct >= 60 ? cc.warning : cc.danger;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: cc.text }}>{rubric.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: rubricColor }}>{rubric.score}/{rubric.maxScore}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: cc.borderSubtle, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: rubricColor, borderRadius: 3, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </NeuSurface>

          {/* Enterprise Feedback */}
          {evaluation.overallComments && (
            <NeuSurface style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: cc.text, margin: '0 0 12px' }}>Enterprise Feedback</h3>
              <p style={{ fontSize: 13, color: cc.textMuted, lineHeight: 1.6, margin: 0 }}>{evaluation.overallComments}</p>
            </NeuSurface>
          )}
        </>
      )}
    </div>
  );
};
