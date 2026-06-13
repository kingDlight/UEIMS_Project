const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'FPT', 'SWP391', 'ueims', 'UEIMS_Project', 'ueims_frontend', 'src', 'pages', 'student', 'tabs', 'ProfileTab.tsx');

let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add antd imports
content = content.replace(
  "import { message, Spin } from 'antd';",
  "import { message, Spin, Modal, Form, Input } from 'antd';"
);

// 2. Add EditOutlined to icons
content = content.replace(
  "import {\n  FileTextOutlined, EyeOutlined,",
  "import {\n  FileTextOutlined, EyeOutlined, EditOutlined,"
);

// 3. Update ProfileInfoView signature
content = content.replace(
  "const ProfileInfoView: React.FC<{ profile: MyProfile }> = ({ profile }) => (",
  `const ProfileInfoView: React.FC<{ profile: MyProfile; onRefresh: () => void }> = ({ profile, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleUpdate = async (values: any) => {
    try {
      setLoading(true);
      if (!profile.profileId) {
        message.error('Profile ID not found');
        return;
      }
      await StudentProfileService.update(profile.profileId, values);
      message.success('Profile updated successfully!');
      setIsEditing(false);
      onRefresh();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to update profile!');
    } finally {
      setLoading(false);
    }
  };

  return (
`
);

// 4. Close the block at the end of ProfileInfoView
content = content.replace(
  "      </NeuSurface>\n    )}\n  </>\n);",
  `      </NeuSurface>
    )}

    {/* Bio & Social Links Section */}
    <NeuSurface style={{ padding: 24, marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: cc.text, margin: 0 }}>About & Links</h3>
      </div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, margin: '0 0 4px' }}>Bio</p>
        <p style={{ fontSize: 13, color: cc.text, margin: 0, whiteSpace: 'pre-wrap' }}>{profile.bio || 'No bio provided.'}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {profile.linkedinUrl && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, width: 80 }}>LinkedIn:</span>
            <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: cc.primary }}>{profile.linkedinUrl}</a>
          </div>
        )}
        {profile.githubUrl && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, width: 80 }}>GitHub:</span>
            <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: cc.primary }}>{profile.githubUrl}</a>
          </div>
        )}
        {profile.portfolioUrl && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: cc.textMuted, width: 80 }}>Portfolio:</span>
            <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: cc.primary }}>{profile.portfolioUrl}</a>
          </div>
        )}
      </div>
    </NeuSurface>

    <Modal
      title="Edit Profile"
      open={isEditing}
      onCancel={() => setIsEditing(false)}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          major: profile.major,
          skills: profile.skills,
          bio: profile.bio,
          linkedinUrl: profile.linkedinUrl,
          githubUrl: profile.githubUrl,
          portfolioUrl: profile.portfolioUrl
        }}
        onFinish={handleUpdate}
      >
        <Form.Item name="major" label="Major">
          <Input placeholder="e.g. Software Engineering" />
        </Form.Item>
        <Form.Item name="skills" label="Skills (comma separated)">
          <Input placeholder="e.g. Java, React, Node.js" />
        </Form.Item>
        <Form.Item name="bio" label="Bio">
          <Input.TextArea rows={3} placeholder="Tell us about yourself..." />
        </Form.Item>
        <Form.Item name="linkedinUrl" label="LinkedIn URL">
          <Input placeholder="https://linkedin.com/in/..." />
        </Form.Item>
        <Form.Item name="githubUrl" label="GitHub URL">
          <Input placeholder="https://github.com/..." />
        </Form.Item>
        <Form.Item name="portfolioUrl" label="Portfolio URL">
          <Input placeholder="https://..." />
        </Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
          <CTAButton variant="ghost" onClick={(e) => { e?.preventDefault(); setIsEditing(false); }}>Cancel</CTAButton>
          <CTAButton variant="primary" loading={loading} onClick={() => form.submit()}>Save Changes</CTAButton>
        </div>
      </Form>
    </Modal>
  </>
);`
);

// 5. Add Edit Button to the header
content = content.replace(
  "        <div style={{ flex: 1 }}>\n          <h2 style={{ fontSize: 20, fontWeight: 700, color: cc.text, margin: '0 0 4px' }}>{profile?.fullName || 'Student'}</h2>\n          <p style={{ fontSize: 13, color: cc.textMuted, margin: '0 0 10px' }}>{profile?.email || 'email@student.fpt.edu.vn'}</p>\n          <StatusPill status={profile?.ojtStatus} />\n        </div>",
  `        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: cc.text, margin: '0 0 4px' }}>{profile?.fullName || 'Student'}</h2>
            <p style={{ fontSize: 13, color: cc.textMuted, margin: '0 0 10px' }}>{profile?.email || 'email@student.fpt.edu.vn'}</p>
            <StatusPill status={profile?.ojtStatus} />
          </div>
          <CTAButton variant="ghost" size="sm" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>Edit Profile</CTAButton>
        </div>`
);

// 6. Pass onRefresh to ProfileInfoView in ProfileTab
content = content.replace(
  "<ProfileInfoView profile={profile} />",
  "<ProfileInfoView profile={profile} onRefresh={fetchProfile} />"
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Successfully refactored ProfileTab.tsx");
