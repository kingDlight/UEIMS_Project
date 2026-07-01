import React, { useEffect, useState } from 'react';
import { Spin, App, Button, Modal, Input, Table, Tag } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import { InternshipPlanService } from '@/services/InternshipPlanService';
import dayjs from 'dayjs';

const { TextArea } = Input;

export const InternshipPlanApprovalsTab: React.FC = () => {
  const { message } = App.useApp();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [viewingPlan, setViewingPlan] = useState<any>(null);
  
  const [rejectPlanId, setRejectPlanId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await InternshipPlanService.getPendingMasterPlans();
      const data = res.data?.result ?? res.data ?? [];
      setPlans(Array.isArray(data) ? data : []);
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Failed to load pending master plans.');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleApprove = async (planId: string) => {
    try {
      await InternshipPlanService.approveMasterPlan(planId);
      message.success('Master plan approved successfully.');
      fetchPlans();
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Failed to approve plan.');
    }
  };

  const handleReject = async () => {
    if (!rejectPlanId || !rejectReason.trim()) {
      message.warning('Please provide a reason for rejection.');
      return;
    }
    try {
      await InternshipPlanService.rejectMasterPlan(rejectPlanId, rejectReason);
      message.success('Master plan rejected.');
      setRejectPlanId(null);
      setRejectReason('');
      fetchPlans();
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Failed to reject plan.');
    }
  };

  const columns = [
    {
      title: 'Job Post',
      dataIndex: 'jobPostTitle',
      key: 'jobPostTitle',
      render: (text: string) => <strong className="text-slate-700">{text}</strong>
    },
    {
      title: 'Enterprise',
      dataIndex: 'enterpriseName',
      key: 'enterpriseName',
      render: (text: string) => <span className="text-slate-600">{text}</span>
    },
    {
      title: 'Overall Goal',
      dataIndex: 'overallGoal',
      key: 'overallGoal',
      ellipsis: true,
      render: (text: string) => <span className="text-slate-500 text-sm truncate max-w-xs">{text}</span>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color="orange" className="font-bold border-orange-200 text-orange-600">
          {status.replace('_', ' ')}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Button size="small" type="primary" icon={<EyeOutlined />} className="bg-slate-700" onClick={() => setViewingPlan(record)}>
            View
          </Button>
          <Button size="small" type="primary" icon={<CheckOutlined />} className="bg-green-600" onClick={() => handleApprove(record.planId)}>
            Approve
          </Button>
          <Button size="small" danger icon={<CloseOutlined />} onClick={() => setRejectPlanId(record.planId)}>
            Reject
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Internship Plan Approvals</h1>
          <p className="text-sm text-slate-500 mt-1">Review and approve training plans submitted by enterprises.</p>
        </div>
        <Button onClick={fetchPlans} loading={loading}>Refresh</Button>
      </div>

      <Table
        dataSource={plans}
        columns={columns}
        rowKey="planId"
        loading={loading}
        pagination={{ pageSize: 10 }}
        className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
      />

      <Modal
        title="View Master Plan"
        open={!!viewingPlan}
        onCancel={() => setViewingPlan(null)}
        footer={[
          <Button key="close" onClick={() => setViewingPlan(null)}>Close</Button>,
          <Button key="approve" type="primary" className="bg-green-600" icon={<CheckOutlined />} onClick={() => {
            handleApprove(viewingPlan.planId);
            setViewingPlan(null);
          }}>
            Approve
          </Button>,
          <Button key="reject" danger icon={<CloseOutlined />} onClick={() => {
            setRejectPlanId(viewingPlan.planId);
            setViewingPlan(null);
          }}>
            Reject
          </Button>
        ]}
        width={700}
      >
        {viewingPlan && (
          <div className="mt-4">
            <div className="mb-4">
              <div className="text-xs text-slate-500 font-bold uppercase">Job Post</div>
              <div className="text-base text-slate-800">{viewingPlan.jobPostTitle}</div>
            </div>
            <div className="mb-4">
              <div className="text-xs text-slate-500 font-bold uppercase">Enterprise</div>
              <div className="text-sm text-slate-800">{viewingPlan.enterpriseName}</div>
            </div>
            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500 font-bold uppercase mb-1">Overall Goal</div>
              <div className="text-sm text-slate-700 whitespace-pre-wrap">{viewingPlan.overallGoal || 'No goal specified'}</div>
            </div>

            <div className="text-sm font-bold text-slate-800 mb-3">Weekly Plan Details</div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-700 w-20">Week</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 w-32">Date</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Task Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingPlan.tasks?.map((task: any) => (
                    <tr key={task.planItemId} className="bg-white">
                      <td className="px-4 py-3 font-medium text-slate-600">{task.weekNumber}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{task.targetDate || 'TBD'}</td>
                      <td className="px-4 py-3 text-slate-700">{task.taskDescription}</td>
                    </tr>
                  ))}
                  {!viewingPlan.tasks?.length && (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-slate-500">No weekly tasks defined.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Reject Internship Plan"
        open={!!rejectPlanId}
        onOk={handleReject}
        onCancel={() => {
          setRejectPlanId(null);
          setRejectReason('');
        }}
        okText="Confirm Reject"
        okButtonProps={{ danger: true }}
      >
        <div className="mt-4 mb-2 text-sm text-slate-600">
          Please provide a reason for rejecting this training plan. This will be sent back to the enterprise.
        </div>
        <TextArea
          rows={4}
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          placeholder="E.g., Please add more details to weeks 3 and 4..."
        />
      </Modal>
    </div>
  );
};
