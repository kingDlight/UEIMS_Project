import React, { useEffect, useState } from 'react';
import { Spin, App } from 'antd';
import { motion } from 'framer-motion';
import { StarOutlined, LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { EnterpriseEvaluationService } from '@/services/EnterpriseEvaluationService';
import { EnterpriseAssignmentService } from '@/services/EnterpriseAssignmentService';

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
// RUBRIC LABELS
// ============================================================
const RUBRICS: EvaluationRubric[] = [
  { id: 'attitude',      label: 'Attitude',           description: 'Work attitude, punctuality, responsibility', weight: 20, score: 0 },
  { id: 'professionalism', label: 'Professionalism',   description: 'Technical skills, code quality, problem solving', weight: 40, score: 0 },
  { id: 'softSkills',    label: 'Soft Skills',         description: 'Communication, teamwork, adaptability', weight: 20, score: 0 },
  { id: 'progress',      label: 'Progress',             description: 'Learning speed, improvement over time', weight: 20, score: 0 },
];

const RUBRIC_COLORS: Record<string, { bg: string, border: string, text: string, bar: string }> = {
  attitude:         { text: 'text-blue-500', border: 'border-blue-500/20', bg: 'bg-blue-50', bar: 'bg-blue-500' },
  professionalism: { text: 'text-[#E67E22]', border: 'border-[#E67E22]/20', bg: 'bg-[#E67E22]/5', bar: 'bg-[#E67E22]' },
  softSkills:      { text: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-50', bar: 'bg-emerald-500' },
  progress:         { text: 'text-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-50', bar: 'bg-amber-500' },
};

// ============================================================
// SLIDER INPUT (alternative UI)
// ============================================================
const SliderRating: React.FC<{
  value: number;
  onChange: (v: number) => void;
  colorClasses: { bg: string, border: string, text: string, bar: string };
  readonly?: boolean;
}> = ({ value, onChange, colorClasses, readonly = false }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <span className="text-[12px] text-slate-500 font-semibold">1 — Poor</span>
      <span className="text-[12px] text-slate-500 font-semibold">5 — Excellent</span>
    </div>
    <div className="relative flex items-center">
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.div
          key={n}
          whileHover={readonly ? {} : { scale: 1.1 }}
          onClick={() => !readonly && onChange(n)}
          className={`flex-1 h-9 rounded-lg flex items-center justify-center font-bold text-[13px] transition-all mr-1.5 last:mr-0
            ${readonly ? 'cursor-default' : 'cursor-pointer'}
            ${n <= value ? `${colorClasses.bg} border-2 ${colorClasses.border.replace('/20', '')} ${colorClasses.text}` : 'bg-slate-100 border-2 border-transparent text-slate-400'}
          `}
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
  const colors = RUBRIC_COLORS[rubric.id] || RUBRIC_COLORS.professionalism;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000, ease: [0.32, 0.72, 0, 1] }}
      className={`bg-white rounded-2xl border border-slate-200 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5 px-6 relative overflow-hidden ${readonly ? 'opacity-75' : 'opacity-100'}`}
    >
      {/* Brand accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.bar} rounded-l-2xl`} />

      <div className="pl-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full ${colors.bg} border ${colors.border} ${colors.text} text-[11px] font-bold uppercase tracking-wider`}>
                {rubric.weight}%
              </span>
            </div>
            <h3 className="text-[16px] font-bold text-slate-900 m-0">{rubric.label}</h3>
            <p className="text-[12px] text-slate-500 m-0 mt-1">{rubric.description}</p>
          </div>

          {/* Read-only badge */}
          {readonly && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${colors.bg} border ${colors.border}`}>
              <LockOutlined className={`text-[10px] ${colors.text}`} />
              <span className={`text-[10px] font-bold ${colors.text}`}>LOCKED</span>
            </div>
          )}
        </div>

        {/* Score display */}
        <div className={`px-4 py-3.5 rounded-xl ${colors.bg} border ${colors.border} mb-4`}>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Rating
          </div>
          <SliderRating value={score} onChange={onChange} colorClasses={colors} readonly={readonly} />
        </div>

        {/* Score breakdown bar */}
        <div>
          <div className="flex justify-between mb-1.5">
            <span className="text-[11px] text-slate-500">Score</span>
            <span className={`text-[13px] font-bold ${colors.text}`}>{score > 0 ? `${score}/5` : '—'}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: score > 0 ? `${(score / 5) * 100}%` : '0%' }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className={`h-full rounded-full ${colors.bar}`}
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
  const gradeColorClass = total >= 90 ? 'text-emerald-500 border-emerald-500 bg-emerald-50' : total >= 70 ? 'text-[#E67E22] border-[#E67E22] bg-[#E67E22]/10' : total >= 60 ? 'text-amber-500 border-amber-500 bg-amber-50' : 'text-red-500 border-red-500 bg-red-50';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5 px-6 flex items-center gap-5"
    >
      {/* Grade circle */}
      <div className={`w-20 h-20 rounded-2xl border-4 flex flex-col items-center justify-center shrink-0 ${gradeColorClass}`}>
        <span className="text-[28px] font-black leading-none">{grade}</span>
        <span className="text-[10px] font-bold mt-1">{Math.round(total)}%</span>
      </div>

      <div className="flex-1">
        <div className="text-[14px] font-bold text-slate-900 mb-2.5">Projected Grade</div>
        <div className="flex gap-2">
          {RUBRICS.map(r => {
             const c = RUBRIC_COLORS[r.id] || RUBRIC_COLORS.professionalism;
             return (
            <div key={r.id} className={`flex-1 py-2 px-2.5 rounded-xl text-center ${c.bg} border ${c.border}`}>
              <div className={`text-[14px] font-extrabold ${c.text}`}>
                {scores[r.id] > 0 ? `${scores[r.id]}/5` : '—'}
              </div>
              <div className={`text-[9px] ${c.text} opacity-70 mt-0.5`}>{r.weight}%</div>
            </div>
          )})}
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
        const [assignmentsRes, evaluationsRes] = await Promise.all([
          EnterpriseAssignmentService.getMyEnterpriseAssignments(),
          EnterpriseEvaluationService.getByEnterprise().catch(() => ({ data: [] })),
        ]);
        const data = assignmentsRes.data?.result ?? assignmentsRes.data ?? [];
        const evaluationsData = evaluationsRes.data?.result ?? evaluationsRes.data ?? [];

        // Build a map: assignmentId -> existing evaluation
        const evalByAssignment = new Map<string, any>();
        if (Array.isArray(evaluationsData)) {
          evaluationsData.forEach((ev: any) => {
            const aId = ev.assignmentId
              ?? ev.assignment?.assignmentId
              ?? ev.assignment?.id;
            if (aId) evalByAssignment.set(aId, ev);
          });
        }

        if (Array.isArray(data) && data.length > 0) {
          const mapped: AssignedStudent[] = data
            .map((item: any) => {
              const aId = item.assignmentId ?? item.id;
              const existing = evalByAssignment.get(aId);
              return {
                assignmentId: aId,
                studentName: item.studentName ?? 'Student',
                studentCode: item.studentCode ?? '—',
                major: item.major ?? '—',
                gpa: item.gpa ?? 0,
                jobTitle: item.jobPostTitle ?? 'Intern',
                evaluationId: existing?.evaluationId ?? existing?.id,
              };
            });
          setStudents(mapped);
          
          const searchParams = new URLSearchParams(window.location.search);
          const assignmentIdParam = searchParams.get('assignmentId');
          
          if (assignmentIdParam) {
            const found = mapped.find(s => s.assignmentId === assignmentIdParam);
            if (found) {
              setSelectedStudent(found);
            } else {
              setSelectedStudent(mapped[0]);
            }
          } else if (mapped.length > 0) {
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
            // Once an evaluation exists for this assignment, treat it as submitted.
            // Backend locks by default (BR-47) and forbids resubmission via isLocked check.
            setSubmitted(true);
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
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="py-10 px-6 font-sans text-center">
        <div className="w-[72px] h-[72px] rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <StarOutlined className="text-[28px]" />
        </div>
        <h3 className="text-[16px] font-semibold text-slate-900 m-0 mb-1.5">No students to evaluate</h3>
        <p className="text-[13px] text-slate-500 m-0">Students will appear here once placed.</p>
      </div>
    );
  }

  return (
    <div className="pb-10 font-sans">
      {/* Header */}
      <div className="px-6 pb-5">
        <h2 className="text-xl font-extrabold text-slate-900 m-0 mb-1 tracking-tight">
          Final Evaluation
        </h2>
        <p className="text-[13px] text-slate-500 m-0">
          Rate each criterion on a scale of 1–5. Grades are weighted per rubric.
        </p>
      </div>

      {/* Student selector */}
      <div className="px-6 pb-5 flex gap-3 flex-wrap">
        {students.map((student) => (
          <motion.button
            key={student.assignmentId}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedStudent(student)}
            className={`px-4 py-2.5 rounded-2xl border-2 cursor-pointer font-sans shadow-sm transition-all text-[13px] flex items-center gap-2 ${
              selectedStudent?.assignmentId === student.assignmentId
                ? 'border-[#E67E22] bg-[#E67E22]/10 text-[#E67E22] font-bold shadow-[0_4px_12px_rgba(230,126,34,0.2)]'
                : 'border-slate-200 bg-white text-slate-900 font-medium'
            }`}
          >
            <span>{student.studentName}</span>
            {student.evaluationId && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-wide">
                <CheckCircleOutlined /> Done
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {selectedStudent && (
        <>
          {/* Selected student header */}
          <div className="px-6 pb-5">
            <div className="px-5 py-4 rounded-2xl bg-white border border-slate-200 shadow-[0_4px_16px_rgba(15,23,42,0.04)] flex items-center justify-between">
              <div>
                <div className="text-[16px] font-bold text-slate-900 mb-1">{selectedStudent.studentName}</div>
                <div className="text-[12px] text-slate-500">
                  {selectedStudent.studentCode} · {selectedStudent.major} · GPA {selectedStudent.gpa}
                </div>
                <div className="text-[12px] text-slate-500 mt-0.5">{selectedStudent.jobTitle}</div>
              </div>
              {isReadOnly && (
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-500/20">
                  <CheckCircleOutlined className="text-emerald-500" />
                  <span className="text-[12px] font-bold text-emerald-500">Submitted</span>
                </div>
              )}
            </div>
          </div>

          {/* Rubric Cards */}
          <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          <div className="px-6 mb-4">
            <EvaluationSummary scores={scores} comments={comments} />
          </div>

          {/* Comments */}
          <div className="px-6 mb-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5 px-6">
              <div className="text-[14px] font-bold text-slate-900 mb-3">Overall Comments</div>
              {isReadOnly ? (
                <div className="text-[13px] text-slate-500 leading-relaxed px-4 py-3 bg-slate-50 rounded-xl">
                  {comments || 'No comments provided.'}
                </div>
              ) : (
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Provide overall feedback on the intern's performance..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[13px] font-sans resize-y outline-none leading-relaxed focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]"
                />
              )}
            </div>
          </div>

          {/* Submit */}
          {!isReadOnly && (
            <div className="px-6 flex justify-end">
              <motion.button
                whileHover={Object.values(scores).some(s => s === 0) || submitting ? {} : { y: -2, boxShadow: '0 12px 28px rgba(230,126,34,0.22)' }}
                whileTap={Object.values(scores).some(s => s === 0) || submitting ? {} : { scale: 0.98 }}
                onClick={handleSubmit}
                disabled={submitting || Object.values(scores).some(s => s === 0)}
                className={`px-7 py-3 rounded-2xl border-none font-bold text-[14px] font-sans transition-all cursor-pointer ${
                  submitting || Object.values(scores).some(s => s === 0)
                    ? 'bg-slate-200 text-slate-400 opacity-70 cursor-not-allowed'
                    : 'bg-gradient-to-br from-[#E67E22] to-[#D35400] text-white shadow-[0_8px_22px_rgba(230,126,34,0.22)]'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Evaluation'}
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
