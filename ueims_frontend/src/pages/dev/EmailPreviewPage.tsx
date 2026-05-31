import React from 'react';

import { PasswordChangedEmail } from '../../../emails/PasswordChangedEmail';
import { PasswordResetEmail } from '../../../emails/PasswordResetEmail';
import { ResetPasswordEmail } from '../../../emails/ResetPasswordEmail';
import { WelcomeEmail } from '../../../emails/WelcomeEmail';
import { renderEmailAsync } from '../../../emails/renderEmail';

type TemplateId = 'reset-password' | 'password-reset' | 'password-changed' | 'welcome';

interface EmailMeta {
  id: TemplateId;
  label: string;
  subject: string;
  from: string;
  to: string;
  time: string;
  preview: string;
}

const templates: EmailMeta[] = [
  {
    id: 'reset-password',
    label: 'Reset Password (EN)',
    subject: 'Reset Password — UEIMS',
    from: 'UEIMS <noreply@ueims.edu.vn>',
    to: 'a.nguyen@example.com',
    time: '10:30 AM',
    preview: 'You have requested a password reset for your UEIMS account...',
  },
  {
    id: 'password-reset',
    label: 'Password Reset (VI)',
    subject: 'Yêu cầu đặt lại mật khẩu — UEIMS',
    from: 'UEIMS <noreply@ueims.edu.vn>',
    to: 'a.nguyen@example.com',
    time: '10:28 AM',
    preview: 'Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản UEIMS của bạn...',
  },
  {
    id: 'password-changed',
    label: 'Password Changed (VI)',
    subject: 'Mật khẩu đã được thay đổi — UEIMS',
    from: 'UEIMS <noreply@ueims.edu.vn>',
    to: 'a.nguyen@example.com',
    time: '09:15 AM',
    preview: 'Mật khẩu tài khoản UEIMS của bạn đã được thay đổi thành công...',
  },
  {
    id: 'welcome',
    label: 'Welcome (VI)',
    subject: 'Chào mừng bạn đến với UEIMS',
    from: 'UEIMS <noreply@ueims.edu.vn>',
    to: 'a.nguyen@example.com',
    time: '08:00 AM',
    preview: 'Tài khoản UEIMS của bạn đã được tạo. Vui lòng đăng nhập...',
  },
];

const defaultData = {
  resetPassword: { fullName: 'Nguyen Van A', resetUrl: 'https://ueims.edu.vn/reset?token=dummy-token-12345' },
  passwordReset: { fullName: 'Nguyen Van A', resetUrl: 'https://ueims.edu.vn/reset?token=dummy-token-12345' },
  passwordChanged: { fullName: 'Nguyen Van A', changedAt: '01/06/2026 lúc 10:15', loginUrl: 'https://ueims.edu.vn/login' },
  welcome: {
    fullName: 'Nguyen Van A',
    email: 'a.nguyen@example.com',
    tempPassword: 'temporary-password',
    loginUrl: 'https://ueims.edu.vn/login',
  },
};

export function EmailPreviewPage() {
  const [active, setActive] = React.useState<TemplateId>('reset-password');
  const [html, setHtml] = React.useState<string>('');
  const [form, setForm] = React.useState(defaultData);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setForm(defaultData);
  }, [active]);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      let output = '';
      if (active === 'reset-password') {
        output = await renderEmailAsync({ template: 'reset-password', props: form.resetPassword });
      } else if (active === 'password-reset') {
        output = await renderEmailAsync({ template: 'password-reset', props: form.passwordReset });
      } else if (active === 'password-changed') {
        output = await renderEmailAsync({ template: 'password-changed', props: form.passwordChanged });
      } else {
        output = await renderEmailAsync({ template: 'welcome', props: form.welcome });
      }

      if (!cancelled) setHtml(output);
    })();

    return () => {
      cancelled = true;
    };
  }, [active, form]);

  function copyHtml() {
    navigator.clipboard.writeText(html).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function updateField(key: string, value: string) {
    setForm((prev) => {
      const next = { ...prev };
      const map = next[active as keyof typeof defaultData] as Record<string, string>;
      (next[active as keyof typeof defaultData] as Record<string, string>) = { ...map, [key]: value };
      return next;
    });
  }

  const currentMeta = templates.find((t) => t.id === active)!;
  const currentProps = (form[active as keyof typeof form] ?? {}) as Record<string, string>;

  const fields =
    active === 'reset-password' || active === 'password-reset'
      ? ['fullName', 'resetUrl']
      : active === 'password-changed'
        ? ['fullName', 'changedAt', 'loginUrl']
        : ['fullName', 'email', 'tempPassword', 'loginUrl'];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F0F2F5', fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif" }}>

      {/* ====== LEFT SIDEBAR — INBOX LIST ====== */}
      <div style={{ width: 340, background: '#FFFFFF', borderRight: '1px solid #E0E0E0', display: 'flex', flexDirection: 'column' }}>
        {/* Sidebar header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E8E8E8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E67E22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#FFF', fontWeight: 800, fontSize: 14 }}>U</span>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1F2937' }}>UEIMS</p>
              <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>Enterprise Internship Management</p>
            </div>
          </div>
          <div style={{ background: '#E67E22', borderRadius: 10, padding: '9px 14px', color: '#FFF', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
            Compose
          </div>
        </div>

        {/* Folder tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E8E8E8' }}>
          {['Inbox', 'Sent', 'Drafts'].map((f) => (
            <div key={f} style={{
              flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 12, fontWeight: f === 'Inbox' ? 700 : 400,
              color: f === 'Inbox' ? '#E67E22' : '#6B7280', cursor: 'pointer',
              borderBottom: f === 'Inbox' ? '2px solid #E67E22' : '2px solid transparent',
            }}>
              {f}
            </div>
          ))}
        </div>

        {/* Email list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {templates.map((t) => (
            <div
              key={t.id}
              onClick={() => setActive(t.id)}
              style={{
                padding: '14px 16px',
                cursor: 'pointer',
                background: active === t.id ? '#FFF7ED' : 'transparent',
                borderLeft: active === t.id ? '3px solid #E67E22' : '3px solid transparent',
                borderBottom: '1px solid #F0F0F0',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: active === t.id ? 700 : 600, color: '#1F2937' }}>
                  UEIMS
                </span>
                <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 8, flexShrink: 0 }}>{t.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.label}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.preview}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ====== RIGHT — READING PANE ====== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Toolbar */}
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E0E0E0', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          {['back', 'archive', 'trash', 'mark', 'folder'].map((icon) => (
            <div key={icon} style={{ width: 34, height: 34, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#5F6368', fontSize: 16 }}>
              {icon === 'back' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>}
              {icon === 'archive' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>}
              {icon === 'trash' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>}
              {icon === 'mark' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
              {icon === 'folder' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>}
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: '#5F6368' }}>1 of 4</span>
          <div style={{ width: 34, height: 34, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#5F6368' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#5F6368' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>

        {/* Email header */}
        <div style={{ background: '#FFFFFF', padding: '20px 32px', borderBottom: '1px solid #E8E8E8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E67E22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#FFF', fontWeight: 800, fontSize: 18 }}>U</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1F2937' }}>{currentMeta.from}</span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>&lt;noreply@ueims.edu.vn&gt;</span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>
                To: <span style={{ color: '#374151' }}>{currentProps.email ?? currentMeta.to}</span>
              </p>
            </div>
            <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>{currentMeta.time}</span>
              <button
                onClick={copyHtml}
                style={{
                  cursor: 'pointer',
                  border: '1px solid #E0E0E0',
                  background: copied ? '#F0FDF4' : 'transparent',
                  color: copied ? '#166534' : '#374151',
                  padding: '7px 14px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 12,
                  transition: 'all 0.2s',
                }}
              >
                {copied ? 'Copied!' : 'Copy HTML'}
              </button>
            </div>
          </div>
          <h2 style={{ margin: '8px 0 0', fontSize: 20, fontWeight: 700, color: '#111827' }}>{currentMeta.subject}</h2>
        </div>

        {/* Email body — iframe */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <iframe
            title="Email preview"
            srcDoc={html}
            style={{ width: '100%', height: '100%', border: 'none', background: '#FFFFFF', display: 'block' }}
          />
        </div>

        {/* Mock data editor */}
        <div style={{ background: '#FFFFFF', borderTop: '1px solid #E0E0E0', padding: '12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E67E22" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Mock Data Editor
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {fields.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '5px 10px' }}>
                <label style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, whiteSpace: 'nowrap' }}>{f}:</label>
                <input
                  value={currentProps[f] ?? ''}
                  onChange={(e) => updateField(f, e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#1F2937',
                    fontSize: 12,
                    fontWeight: f === 'tempPassword' ? 700 : 400,
                    fontFamily: f === 'tempPassword' ? 'monospace' : 'inherit',
                    outline: 'none',
                    width: f === 'tempPassword' ? 130 : 150,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Hidden — keep templates bundled */}
      <div style={{ display: 'none' }}>
        <ResetPasswordEmail fullName="x" resetUrl="#" />
        <PasswordResetEmail fullName="x" resetUrl="#" />
        <PasswordChangedEmail fullName="x" changedAt="x" loginUrl="#" />
        <WelcomeEmail fullName="x" email="x" tempPassword="x" loginUrl="#" />
      </div>
    </div>
  );
}
