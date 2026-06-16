import React, { useEffect, useState } from 'react';
import { Spin, App } from 'antd';
import { motion } from 'framer-motion';
import { StarOutlined, LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { ApplicationService } from '@/services/ApplicationService';
import { EnterpriseEvaluationService } from '@/services/EnterpriseEvaluationService';
import { c } from '../constants';

// ============================================================
// TYPES
// ============================================================
interface AssignedStudent {
  assignmentId: string;
  studentName: string;
  studentCode: string;
  major: string;
  gpa: number;
  jobTitle: string;
  evaluationId?: string;
}

interface EvaluationRubric {
  id: string;
  label: string;
  description: string;
  weight: number;
  score: number;
}

interface ExistingEvaluation {
  evaluationId: string;
  studentId: string;
  studentName: string;
  scores: {
    attitude: number;
    professionalism: number;
    softSkills: number;
    progress: number;
  };
  overallComments: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
}

// ============================================================
// HELPERS
// ============================================================
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================
// RUBRIC LABELS
// ============================================================
const RUBRICS: EvaluationRubric[] = [
  { id: 'attitude',      label: 'Attitude',           description: 'Work attitude, punctuality, responsibility', weight: 20, score: 0 },
  { id: 'professionalism', label: 'Professionalism',   description: 'Technical skills, code quality, problem solving', weight: 40, score: 0 },
  { id: 'softSkills',    label: 'Soft Skills',         description: 'Communication, teamwork, adaptability', weight: 20, score: 0 },
  { id: 'progress',      label: 'Progress',             description: 'Learning speed, improvement over time', weight: 20, score: 0 },
];

const RUBRIC_COLORS: Record<string, string> = {
  attitude:         '#3b82f6',
  professionalism: '#e67e22',
  softSkills:      '#22c55e',
  progress:         '#f59e0b',
};

// ============================================================
// STAR RATING INPUT
// ============================================================
const StarRating: React.FC<{
  value: number;
  onChange: (v: number) => void;
  color: string;
  readonly?: boolean;
}> = ({ value, onChange, color, readonly = false }) => (
  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <motion.button
        key={star}
        whileHover={readonly ? {} : { scale: 1.15 }}
        whileTap={readonly ? {} : { scale: 0.9 }}
        onClick={() => !readonly && onChange(star)}
        style={{
          background: 'none',
          border: 'none',
          cursor: readonly ? 'default' : 'pointer',
          fontSize: 28,
          padding: '2px',
          lineHeight: 1,
          color: star <= value ? color : c.border,
          transition: 'color 0.15s',
        }}
      >
        <StarOutlined />
      </motion.button>
    ))}
    <span style={{
      marginLeft: 6,
      fontSize: 13,
      fontWeight: 700,
      color: value > 0 ? color : c.textMuted,
      minWidth: 28,
    }}>
      {value > 0 ? `${value}/5` : '—'}
    </span>
  </div>
);

// ============================================================
// SLIDER INPUT (alternative UI)
// ============================================================
const SliderRating: React.FC<{
  value: number;
  onChange: (v: number) => void;
  color: string;
  readonly?: boolean;
}> = ({ value, onChange, color, readonly = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: c.textMuted, fontWeight: 600 }}>1 — Poor</span>
      <span style={{ fontSize: 12, color: c.textMuted, fontWeight: 600 }}>5 — Excellent</span>
    </div>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.div
          key={n}
          whileHover={readonly ? {} : { scale: 1.1 }}
          onClick={() => !readonly && onChange(n)}
          style={{
            flex: 1,
            height: 36,
            borderRadius: 8,
            cursor: readonly ? 'default' : 'pointer',
            background: n <= value ? hexToRgba(color, 0.15 + n * 0.04) : c.borderSubtle,
            border: `2px solid ${n <= value ? color : 'transparent'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 13,
            color: n <= value ? color : c.textMuted,
            transition: 'all 0.15s',
            marginRight: n < 5 ? 6 : 0,
          }}
        >
          {n}
        </motion.div>
      ))}
    </div>
  </div>
);

// ============================================================
// RUBRIC CARD
// ============================================================
const RubricCard: React.FC<{
  rubric: EvaluationRubric;
  score: number;
  onChange: (score: number) => void;
  readonly?: boolean;
  delay?: number;
}> = ({ rubric, score, onChange, readonly = false, delay = 0 }) => {
  const color = RUBRIC_COLORS[rubric.id] || c.brand;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000, ease: [0.32, 0.72, 0, 1] }}
      style={{
        background: '#fff',
        borderRadius: 16,
        border: `1px solid ${c.borderSubtle}`,
        boxShadow: '0 4px 16px rgba(15,23,42,0.04)',
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
        opacity: readonly ? 0.75 : 1,
      }}
    >
      {/* Brand accent bar */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        background: color,
        borderRadius: '16px 0 0 16px',
      }} />

      <div style={{ paddingLeft: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                padding: '3px 10px',
                borderRadius: 999,
                background: hexToRgba(color, 0.1),
                border: `1px solid ${hexToRgba(color, 0.2)}`,
                color: color,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {rubric.weight}%
              </span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: c.text, margin: 0 }}>{rubric.label}</h3>
            <p style={{ fontSize: 12, color: c.textMuted, margin: '4px 0 0' }}>{rubric.description}</p>
          </div>

          {/* Read-only badge */}
          {readonly && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: hexToRgba(color, 0.08), border: `1px solid ${hexToRgba(color, 0.2)}` }}>
              <LockOutlined style={{ fontSize: 10, color }} />
              <span style={{ fontSize: 10, fontWeight: 700, color }}>LOCKED</span>
            </div>
          )}
        </div>

        {/* Score display */}
        <div style={{
          padding: '14px 16px',
          borderRadius: 12,
          background: hexToRgba(color, 0.04),
          border: `1px solid ${hexToRgba(color, 0.12)}`,
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Rating
          </div>
          <SliderRating value={score} onChange={onChange} color={color} readonly={readonly} />
        </div>

        {/* Score breakdown bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: c.textMuted }}>Score</span>
            <span style={{ fontSize: 13, fontWeight: 700, color }}>{score > 0 ? `${score}/5` : '—'}</span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: c.borderSubtle, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: score > 0 ? `${(score / 5) * 100}%` : '0%' }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              style={{
                height: '100%',
                background: color,
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================
// EVALUATION SUMMARY
// ============================================================
const EvaluationSummary: React.FC<{
  scores: Record<string, number>;
  comments: string;
}> = ({ scores, comments }) => {
  const total = RUBRICS.reduce((sum, r) => {
    const score = scores[r.id] || 0;
    return sum + (score / 5) * r.weight;
  }, 0);

  const grade = total >= 90 ? 'A' : total >= 80 ? 'B' : total >= 70 ? 'C' : total >= 60 ? 'D' : 'F';
  const gradeColor = total >= 90 ? c.success : total >= 70 ? c.brand : total >= 60 ? c.warning : c.error;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5, ease: [0.32, 0.72, 0, 1] }}
      style={{
        background: '#fff',
        borderRadius: 16,
        border: `1px solid ${c.borderSubtle}`,
        boxShadow: '0 4px 16px rgba(15,23,42,0.04)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}
    >
      {/* Grade circle */}
      <div style={{
        width: 80,
        height: 80,
        borderRadius: 20,
        background: hexToRgba(gradeColor, 0.08),
        border: `3px solid ${gradeColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{grade}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: gradeColor, marginTop: 2 }}>{Math.round(total)}%</span>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 10 }}>Projected Grade</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {RUBRICS.map(r => (
            <div key={r.id} style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: 10,
              background: hexToRgba(RUBRIC_COLORS[r.id], 0.06),
              border: `1px solid ${hexToRgba(RUBRIC_COLORS[r.id], 0.15)}`,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: RUBRIC_COLORS[r.id] }}>
                {scores[r.id] > 0 ? `${scores[r.id]}/5` : '—'}
              </div>
              <div style={{ fontSize: 9, color: RUBRIC_COLORS[r.id], opacity: 0.7, marginTop: 2 }}>{r.weight}%</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================
// MAIN EVALUATION TAB
// ============================================================
export const EvaluationTab: React.FC = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<AssignedStudent | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingEvaluation, setExistingEvaluation] = useState<ExistingEvaluation | null>(null);

  // Fetch placed students from applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await ApplicationService.getMyEnterprise();
        const data = res.data?.result ?? res.data ?? [];
        if (Array.isArray(data) && data.length > 0) {
          const mapped: AssignedStudent[] = data
            .filter((item: any) => item.status === 'ACCEPTED' || item.status === 'INTERVIEW_SCHEDULED')
            .map((item: any) => ({
              assignmentId: item.applicationId ?? item.id,
              studentName: item.studentName ?? 'Student',
              studentCode: item.studentCode ?? '—',
              major: item.major ?? '—',
              gpa: item.gpa ?? 0,
              jobTitle: item.jobPostTitle ?? 'Intern',
              evaluationId: undefined,
            }));
          setStudents(mapped);
          if (mapped.length > 0) {
            setSelectedStudent(mapped[0]);
          }
        }
      } catch {
        // no students
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch existing evaluation when student changes
  useEffect(() => {
    if (!selectedStudent) return;
    const fetchEvaluation = async () => {
      try {
        if (selectedStudent.evaluationId) {
          const res = await EnterpriseEvaluationService.getById(selectedStudent.evaluationId);
          const evalData = res.data?.result ?? res.data;
          if (evalData) {
            setExistingEvaluation({
              evaluationId: evalData.evaluationId ?? evalData.id,
              studentId: evalData.studentId ?? '',
              studentName: selectedStudent.studentName,
              scores: {
                attitude: evalData.attitudeScore ?? evalData.scores?.attitude ?? 0,
                professionalism: evalData.professionalismScore ?? evalData.scores?.professionalism ?? 0,
                softSkills: evalData.softSkillsScore ?? evalData.scores?.softSkills ?? 0,
                progress: evalData.progressScore ?? evalData.scores?.progress ?? 0,
              },
              overallComments: evalData.overallComments ?? evalData.comments ?? '',
              status: evalData.status ?? 'DRAFT',
            });
            setScores({
              attitude: evalData.attitudeScore ?? evalData.scores?.attitude ?? 0,
              professionalism: evalData.professionalismScore ?? evalData.scores?.professionalism ?? 0,
              softSkills: evalData.softSkillsScore ?? evalData.scores?.softSkills ?? 0,
              progress: evalData.progressScore ?? evalData.scores?.progress ?? 0,
            });
            setComments(evalData.overallComments ?? evalData.comments ?? '');
            setSubmitted(evalData.status === 'SUBMITTED' || evalData.status === 'APPROVED');
          }
        } else {
          resetForm();
        }
      } catch {
        resetForm();
      }
    };
    fetchEvaluation();
  }, [selectedStudent?.assignmentId]);

  const resetForm = () => {
    setScores({});
    setComments('');
    setSubmitted(false);
    setExistingEvaluation(null);
  };

  const handleScoreChange = (rubricId: string, score: number) => {
    setScores(prev => ({ ...prev, [rubricId]: score }));
  };

  const isReadOnly = submitted;

  const handleSubmit = async () => {
    if (!selectedStudent) return;
    if (Object.values(scores).some(s => s === 0)) {
      message.error('Please rate all 4 criteria before submitting.');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        assignmentId: selectedStudent.assignmentId,
        studentId: selectedStudent.studentCode,
        attitudeScore: scores.attitude,
        professionalismScore: scores.professionalism,
        softSkillsScore: scores.softSkills,
        progressScore: scores.progress,
        overallComments: comments,
      };
      if (existingEvaluation?.evaluationId) {
        await EnterpriseEvaluationService.update(existingEvaluation.evaluationId, {
          assignmentId: selectedStudent.assignmentId,
          attitudeScore: scores.attitude,
          professionalismScore: scores.professionalism,
          softSkillsScore: scores.softSkills,
          progressScore: scores.progress,
          overallComments: comments,
        });
      } else {
        await EnterpriseEvaluationService.create({
          assignmentId: selectedStudent.assignmentId,
          attitudeScore: scores.attitude,
          professionalismScore: scores.professionalism,
          softSkillsScore: scores.softSkills,
          progressScore: scores.progress,
          overallComments: comments,
        });
      }
      message.success('Evaluation submitted successfully!');
      setSubmitted(true);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to submit evaluation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div style={{ padding: '40px 24px', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: c.bgLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: c.textMuted }}>
          <StarOutlined style={{ fontSize: 28 }} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: c.text, margin: '0 0 6px' }}>No students to evaluate</h3>
        <p style={{ fontSize: 13, color: c.textMuted, margin: 0 }}>Students will appear here once placed.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 40px', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '0 24px 20px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
          Final Evaluation
        </h2>
        <p style={{ fontSize: 13, color: c.textMuted, margin: 0 }}>
          Rate each criterion on a scale of 1–5. Grades are weighted per rubric.
        </p>
      </div>

      {/* Student selector */}
      <div style={{ padding: '0 24px 20px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {students.map((student) => (
          <motion.button
            key={student.assignmentId}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedStudent(student)}
            style={{
              padding: '10px 16px',
              borderRadius: 14,
              border: `2px solid ${selectedStudent?.assignmentId === student.assignmentId ? c.brand : c.border}`,
              background: selectedStudent?.assignmentId === student.assignmentId ? hexToRgba(c.brand, 0.06) : '#fff',
              color: selectedStudent?.assignmentId === student.assignmentId ? c.brand : c.text,
              fontWeight: selectedStudent?.assignmentId === student.assignmentId ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              boxShadow: selectedStudent?.assignmentId === student.assignmentId ? `0 4px 12px ${hexToRgba(c.brand, 0.2)}` : 'none',
              transition: 'all 0.15s',
            }}
          >
            {student.studentName}
          </motion.button>
        ))}
      </div>

      {selectedStudent && (
        <>
          {/* Selected student header */}
          <div style={{ padding: '0 24px 20px' }}>
            <div style={{
              padding: '16px 20px',
              borderRadius: 16,
              background: '#fff',
              border: `1px solid ${c.borderSubtle}`,
              boxShadow: '0 4px 16px rgba(15,23,42,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: c.text, marginBottom: 4 }}>{selectedStudent.studentName}</div>
                <div style={{ fontSize: 12, color: c.textMuted }}>
                  {selectedStudent.studentCode} · {selectedStudent.major} · GPA {selectedStudent.gpa}
                </div>
                <div style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>{selectedStudent.jobTitle}</div>
              </div>
              {isReadOnly && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, background: hexToRgba(c.success, 0.08), border: `1px solid ${hexToRgba(c.success, 0.2)}` }}>
                  <CheckCircleOutlined style={{ color: c.success }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.success }}>Submitted</span>
                </div>
              )}
            </div>
          </div>

          {/* Rubric Cards */}
          <div style={{ padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
            {RUBRICS.map((rubric, i) => (
              <RubricCard
                key={rubric.id}
                rubric={rubric}
                score={scores[rubric.id] || 0}
                onChange={(score) => handleScoreChange(rubric.id, score)}
                readonly={isReadOnly}
                delay={i * 100}
              />
            ))}
          </div>

          {/* Summary */}
          <div style={{ padding: '0 24px', marginBottom: 16 }}>
            <EvaluationSummary scores={scores} comments={comments} />
          </div>

          {/* Comments */}
          <div style={{ padding: '0 24px', marginBottom: 24 }}>
            <div style={{
              background: '#fff',
              borderRadius: 16,
              border: `1px solid ${c.borderSubtle}`,
              boxShadow: '0 4px 16px rgba(15,23,42,0.04)',
              padding: '20px 24px',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 12 }}>Overall Comments</div>
              {isReadOnly ? (
                <div style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.7, padding: '12px 16px', background: c.bgLight, borderRadius: 12 }}>
                  {comments || 'No comments provided.'}
                </div>
              ) : (
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Provide overall feedback on the intern's performance..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: `1px solid ${c.border}`,
                    fontSize: 13,
                    fontFamily: 'Inter, sans-serif',
                    resize: 'vertical',
                    outline: 'none',
                    lineHeight: 1.7,
                  }}
                />
              )}
            </div>
          </div>

          {/* Submit */}
          {!isReadOnly && (
            <div style={{ padding: '0 24px', display: 'flex', justifyContent: 'flex-end' }}>
              <motion.button
                whileHover={{ y: -2, boxShadow: '0 12px 28px rgba(230,126,34,0.22)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={submitting || Object.values(scores).some(s => s === 0)}
                style={{
                  padding: '12px 28px',
                  borderRadius: 14,
                  border: 'none',
                  background: Object.values(scores).some(s => s === 0) ? c.border : `linear-gradient(135deg, ${c.brand}, ${c.brandHover})`,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: submitting || Object.values(scores).some(s => s === 0) ? 'not-allowed' : 'pointer',
                  opacity: submitting || Object.values(scores).some(s => s === 0) ? 0.7 : 1,
                  boxShadow: Object.values(scores).some(s => s === 0) ? 'none' : `0 8px 22px rgba(230,126,34,0.22)`,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Evaluation'}
              </motion.button>
            </div>
          )}
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(2, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
