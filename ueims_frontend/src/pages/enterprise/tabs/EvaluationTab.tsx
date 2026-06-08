import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Typography, Slider, Button, Empty, Skeleton, Spin, Tag } from 'antd';
import { StarFilled, SaveOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { api } from '@/services/api';

const { Title, Text } = Typography;

const cc = {
  brand: '#E96500',
  brandMuted: '#FFF3E8',
  brandLight: '#FFF2E8',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  surface: '#FFFFFF',
  borderSubtle: '#F3F4F6',
  border: '#E5E7EB',
  success: '#10B981',
  successMuted: '#D1FAE5',
  warning: '#F59E0B',
  warningMuted: '#FEF3C7',
  danger: '#EF4444',
  dangerMuted: '#FEE2E2',
  info: '#3B82F6',
  infoMuted: '#DBEAFE',
  radiusLg: 12,
  radiusMd: 8,
  radiusFull: 9999,
  shadowSm: '0 1px 3px rgba(0,0,0,0.08)',
  shadowMd: '0 4px 6px rgba(0,0,0,0.07)',
  shadowBrand: '0 4px 12px rgba(233,101,0,0.25)',
};

const RUBRICS = [
  { key: 'attitude', label: 'Thái độ', description: 'Tinh thần làm việc, ý thức kỷ luật' },
  { key: 'professionalism', label: 'Chuyên môn', description: 'Kiến thức kỹ thuật, năng lực thực hành', weight: 0.4 },
  { key: 'softSkills', label: 'Kỹ năng mềm', description: 'Giao tiếp, làm việc nhóm, giải quyết vấn đề' },
  { key: 'progress', label: 'Tiến bộ', description: 'Mức độ cải thiện trong kỳ thực tập' },
];

interface InternWithEvaluation {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  major: string;
  jobPost: { title: string };
  evaluation: {
    attitude: number;
    professionalism: number;
    softSkills: number;
    progress: number;
    finalScore: number;
    locked: boolean;
  } | null;
}

export const EvaluationTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedIntern, setSelectedIntern] = useState<InternWithEvaluation | null>(null);
  const [scores, setScores] = useState({
    attitude: 3,
    professionalism: 3,
    softSkills: 3,
    progress: 3,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { data: interns, isLoading } = useQuery({
    queryKey: ['myInterns'],
    queryFn: async () => {
      const res = await api.get('/applications/enterprise/interns');
      return (res.data?.content || res.data || []) as InternWithEvaluation[];
    },
  });

  const evaluateMutation = useMutation({
    mutationFn: async ({ internId, data }: { internId: string; data: any }) => {
      return api.post(`/enterprise-evaluations/${internId}`, data);
    },
    onSuccess: (_, { internId }) => {
      messageApi.success('Đã chấm điểm thành công! Form đã được khóa.');
      queryClient.invalidateQueries({ queryKey: ['myInterns'] });
      setSubmitted(true);
      setSubmitLoading(false);
    },
    onError: () => {
      messageApi.error('Lưu đánh giá thất bại!');
      setSubmitLoading(false);
    },
  });

  const selected = selectedIntern;

  const finalScore = useMemo(() => {
    return (
      scores.attitude * 0.2 +
      scores.professionalism * 0.4 +
      scores.softSkills * 0.2 +
      scores.progress * 0.2
    );
  }, [scores]);

  const handleScoreChange = (key: string) => (value: number) => {
    setScores(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitLoading(true);
    evaluateMutation.mutate({
      internId: selected.id,
      data: {
        ...scores,
        finalScore: parseFloat(finalScore.toFixed(2)),
      },
    });
  };

  const handleSelectIntern = (intern: InternWithEvaluation) => {
    setSelectedIntern(intern);
    if (intern.evaluation?.locked) {
      setSubmitted(true);
    } else {
      setSubmitted(false);
      setScores({
        attitude: intern.evaluation?.attitude || 3,
        professionalism: intern.evaluation?.professionalism || 3,
        softSkills: intern.evaluation?.softSkills || 3,
        progress: intern.evaluation?.progress || 3,
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return cc.success;
    if (score >= 3.5) return cc.info;
    if (score >= 2.5) return cc.warning;
    return cc.danger;
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 40px' }}>
      {messageApi && contextHolder}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: 24 }}
      >
        <Title level={4} style={{ color: cc.textPrimary, margin: 0, marginBottom: 4 }}>
          <StarFilled style={{ color: cc.warning, marginRight: 8 }} />
          Chấm điểm thực tập sinh
        </Title>
        <Text style={{ color: cc.textMuted, fontSize: 13 }}>
          Đánh giá theo tiêu chí Rubrics (Thang điểm 1-5)
        </Text>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: selected ? '1fr 380px' : '1fr',
        gap: 20,
      }}>
        {/* Left: List */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ minWidth: 0 }}
        >
          <div style={{
            ...{
              background: cc.surface,
              borderRadius: cc.radiusLg,
              border: `1px solid ${cc.borderSubtle}`,
              boxShadow: cc.shadowSm,
              overflow: 'hidden',
            } as any,
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${cc.borderSubtle}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Text strong style={{ color: cc.textPrimary, fontSize: 14 }}>
                Danh sách thực tập sinh
              </Text>
              <Tag style={{
                background: `${cc.brand}15`, color: cc.brand,
                border: 'none', borderRadius: cc.radiusFull, fontWeight: 700,
              }}>
                {interns?.length || 0} sinh viên
              </Tag>
            </div>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <Spin size="large" />
              </div>
            ) : !interns || interns.length === 0 ? (
              <Empty description="Chưa có thực tập sinh nào" style={{ padding: 60 }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {(interns as InternWithEvaluation[]).map((intern, i) => {
                  const isSelected = selected?.id === intern.id;
                  const score = intern.evaluation?.finalScore;
                  const isLocked = intern.evaluation?.locked;
                  return (
                    <motion.div
                      key={intern.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      onClick={() => handleSelectIntern(intern)}
                      style={{
                        padding: '14px 20px',
                        cursor: 'pointer',
                        background: isSelected ? cc.brandMuted : 'transparent',
                        borderBottom: `1px solid ${cc.borderSubtle}`,
                        borderLeft: isSelected ? `3px solid ${cc.brand}` : '3px solid transparent',
                        display: 'flex', alignItems: 'center', gap: 14,
                        transition: 'background 0.15s',
                      }}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: isSelected ? `${cc.brand}25` : `${cc.textMuted}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isSelected ? cc.brand : cc.textMuted,
                        fontWeight: 900, fontSize: 14, flexShrink: 0,
                      }}>
                        {intern.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text strong style={{ color: cc.textPrimary, fontSize: 14, display: 'block' }}>
                          {intern.fullName}
                        </Text>
                        <Text style={{ fontSize: 12, color: cc.textMuted, display: 'block' }}>
                          {intern.jobPost?.title} · {intern.major}
                        </Text>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {score ? (
                          <>
                            <Text strong style={{
                              fontSize: 18,
                              color: getScoreColor(score),
                            }}>
                              {score.toFixed(1)}
                            </Text>
                            {isLocked && (
                              <LockOutlined style={{ color: cc.textMuted, marginLeft: 4 }} />
                            )}
                          </>
                        ) : (
                          <Tag style={{
                            background: `${cc.textMuted}15`, color: cc.textMuted,
                            border: 'none', borderRadius: cc.radiusFull, fontSize: 11,
                          }}>
                            Chưa chấm
                          </Tag>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: Evaluation Form */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              ...{
                background: cc.surface,
                borderRadius: cc.radiusLg,
                border: `1px solid ${cc.borderSubtle}`,
                boxShadow: cc.shadowSm,
                position: 'sticky',
                top: 20,
                overflow: 'hidden',
              } as any,
            }}
          >
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${cc.borderSubtle}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Text strong style={{ color: cc.textPrimary, fontSize: 14 }}>
                Form chấm điểm
              </Text>
              {selected.evaluation?.locked && (
                <Tag style={{
                  background: cc.warningMuted, color: cc.warning,
                  border: 'none', borderRadius: cc.radiusFull, fontWeight: 700,
                }}>
                  <LockOutlined /> Đã khóa
                </Tag>
              )}
            </div>

            <div style={{ padding: '20px' }}>
              {/* Student Info */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: cc.radiusMd,
                background: `${cc.info}10`, border: `1px solid ${cc.info}20`,
                marginBottom: 20,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `${cc.info}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: cc.info, fontWeight: 900, fontSize: 13,
                }}>
                  {selected.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <Text strong style={{ color: cc.textPrimary, fontSize: 14, display: 'block' }}>
                    {selected.fullName}
                  </Text>
                  <Text style={{ color: cc.textMuted, fontSize: 12 }}>
                    {selected.email} · {selected.major}
                  </Text>
                </div>
              </div>

              {/* Rubrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {RUBRICS.map((rubric, idx) => {
                  const score = scores[rubric.key as keyof typeof scores];
                  const isWeighted = rubric.weight === 0.4;
                  return (
                    <div key={rubric.key}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: 8,
                      }}>
                        <div>
                          <Text strong style={{ color: cc.textPrimary, fontSize: 13 }}>
                            {rubric.label}
                          </Text>
                          {isWeighted && (
                            <Tag style={{
                              marginLeft: 6,
                              background: `${cc.brand}15`, color: cc.brand,
                              border: 'none', borderRadius: cc.radiusFull, fontSize: 10,
                              fontWeight: 700,
                            }}>
                              Trọng số 40%
                            </Tag>
                          )}
                        </div>
                        <Text strong style={{
                          fontSize: 18,
                          color: getScoreColor(score),
                        }}>
                          {score}
                        </Text>
                      </div>
                      <Text style={{ color: cc.textMuted, fontSize: 12, display: 'block', marginBottom: 10 }}>
                        {rubric.description}
                      </Text>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={score}
                        onChange={handleScoreChange(rubric.key)}
                        disabled={submitted}
                        tooltip={{ formatter: (v) => `${v}/5` }}
                        marks={{
                          1: { label: '1', style: { color: cc.textMuted, fontSize: 11 } },
                          3: { label: '3', style: { color: cc.textMuted, fontSize: 11 } },
                          5: { label: '5', style: { color: cc.textMuted, fontSize: 11 } },
                        }}
                        styles={{
                          track: { background: getScoreColor(score) },
                          handle: { borderColor: getScoreColor(score) },
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Final Score */}
              <div style={{
                marginTop: 24,
                padding: '16px',
                borderRadius: cc.radiusMd,
                background: `${cc.brand}10`,
                border: `1px solid ${cc.brand}25`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <Text style={{ fontSize: 12, color: cc.textMuted, display: 'block', marginBottom: 2 }}>
                    Điểm tổng kết
                  </Text>
                  <Text style={{ fontSize: 12, color: cc.textSecondary }}>
                    = 20% T.độ + 40% Ch.môn + 20% K.năng + 20% Tiến bộ
                  </Text>
                </div>
                <Text style={{
                  fontSize: 32, fontWeight: 800, color: getScoreColor(finalScore),
                }}>
                  {finalScore.toFixed(1)}
                </Text>
              </div>

              {/* Formula Preview */}
              <div style={{
                marginTop: 10,
                padding: '10px 12px',
                borderRadius: cc.radiusMd,
                background: cc.borderSubtle,
                fontSize: 11,
                color: cc.textMuted,
              }}>
                {scores.attitude}×0.2 + {scores.professionalism}×0.4 + {scores.softSkills}×0.2 + {scores.progress}×0.2 = {finalScore.toFixed(1)}
              </div>

              {/* Submit */}
              <Button
                type="primary"
                block
                size="large"
                icon={submitted ? <LockOutlined /> : <SaveOutlined />}
                onClick={handleSubmit}
                loading={submitLoading}
                disabled={submitted}
                style={{
                  marginTop: 20,
                  borderRadius: cc.radiusMd,
                  background: submitted ? cc.textMuted : cc.brand,
                  borderColor: submitted ? cc.textMuted : cc.brand,
                  fontWeight: 700,
                  fontSize: 14,
                  boxShadow: !submitted ? cc.shadowBrand : 'none',
                }}
              >
                {submitted ? 'Đã khóa – Không thể chỉnh sửa' : 'Gửi đánh giá (Khóa sau khi gửi)'}
              </Button>

              {submitted && (
                <div style={{
                  marginTop: 10,
                  textAlign: 'center',
                  fontSize: 12,
                  color: cc.textMuted,
                }}>
                  Sau khi gửi, bạn không thể chỉnh sửa. Liên hệ Training Manager nếu cần mở khóa.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        /* === FULL RESPONSIVE === */
        /* EvaluationTab: 2-col grid → 1-col on mobile */
        @media (max-width: 768px) {
          div[style*="1fr 380px"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          div[style*="repeat(4, minmax"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          div[style*="repeat(4, minmax"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
