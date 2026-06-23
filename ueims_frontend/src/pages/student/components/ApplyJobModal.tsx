import React, { useState } from 'react';
import { Modal, Radio, Upload, Button, message, Space, Typography } from 'antd';
import { UploadOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { StudentProfileService } from '../../../services/StudentProfileService';
import { ApplicationService } from '../../../services/ApplicationService';

const { Text } = Typography;

interface ApplyJobModalProps {
  open: boolean;
  onClose: () => void;
  jobPostId: number;
  jobTitle: string;
  hasProfileCv: boolean;
  profileCvUrl?: string;
  onSuccess: () => void;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  open,
  onClose,
  jobPostId,
  jobTitle,
  hasProfileCv,
  profileCvUrl,
  onSuccess,
}) => {
  const { t } = useTranslation(['jobs']);
  const [cvOption, setCvOption] = useState<'profile' | 'new'>(hasProfileCv ? 'profile' : 'new');
  const [newCvFile, setNewCvFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleApply = async () => {
    if (cvOption === 'new' && !newCvFile) {
      message.warning('Please select a PDF file to upload.');
      return;
    }

    if (cvOption === 'profile' && !hasProfileCv) {
      message.warning('You do not have a CV in your profile. Please upload one.');
      return;
    }

    try {
      setSubmitting(true);

      // 1. Upload new CV if selected
      if (cvOption === 'new' && newCvFile) {
        const formData = new FormData();
        formData.append('file', newCvFile);
        await StudentProfileService.uploadCV(formData);
        // The profile now has the new CV URL. The backend will automatically pick it up.
      }

      // 2. Submit Application
      await ApplicationService.create({ jobPostId });
      
      message.success(t('applicationSuccess', 'Application submitted successfully!'));
      onSuccess();
      onClose();
      
      // Reset state
      setNewCvFile(null);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.message || '';
      if (errorMsg.includes('already') || errorMsg.includes('duplicate')) {
        message.error(t('alreadyApplied', 'You have already applied for this position.'));
      } else if (errorMsg.includes('CV') && errorMsg.includes('upload')) {
        message.error(t('pleaseUploadCv', 'Please upload your CV before applying.'));
      } else if (errorMsg.includes('deadline') || errorMsg.includes('expired')) {
        message.error(t('jobDeadlineReached', 'This job posting has reached its deadline.'));
      } else {
        message.error(errorMsg || t('applicationFailed', 'Application failed!'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file: File) => {
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      if (!isPdf) {
        message.error('You can only upload PDF files!');
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('CV must smaller than 5MB!');
        return Upload.LIST_IGNORE;
      }
      setNewCvFile(file);
      return false; // Prevent automatic upload
    },
    onRemove: () => {
      setNewCvFile(null);
    },
    maxCount: 1,
    fileList: newCvFile ? [newCvFile as any] : [],
    accept: '.pdf'
  };

  return (
    <Modal
      title={`Apply for ${jobTitle}`}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={submitting} 
          onClick={handleApply}
          disabled={(cvOption === 'new' && !newCvFile) || (cvOption === 'profile' && !hasProfileCv)}
        >
          Submit Application
        </Button>,
      ]}
      destroyOnClose
    >
      <div style={{ marginTop: 20 }}>
        <p style={{ marginBottom: 16 }}>Please select a CV to use for this application:</p>
        
        <Radio.Group 
          onChange={(e) => setCvOption(e.target.value)} 
          value={cvOption}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <Radio value="profile" disabled={!hasProfileCv}>
            <Space direction="vertical" size={0}>
              <Text strong>Use existing Profile CV</Text>
              {hasProfileCv ? (
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <FilePdfOutlined style={{ marginRight: 6 }} /> 
                  CV found in your profile
                </Text>
              ) : (
                <Text type="danger" style={{ fontSize: 13 }}>No CV found in profile</Text>
              )}
            </Space>
          </Radio>
          
          <Radio value="new">
            <Space direction="vertical" size={4}>
              <Text strong>Upload a new CV (.pdf)</Text>
              {cvOption === 'new' && (
                <div style={{ marginTop: 8 }}>
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Select PDF File</Button>
                  </Upload>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                    Note: This will also update your default Profile CV.
                  </Text>
                </div>
              )}
            </Space>
          </Radio>
        </Radio.Group>
      </div>
    </Modal>
  );
};
