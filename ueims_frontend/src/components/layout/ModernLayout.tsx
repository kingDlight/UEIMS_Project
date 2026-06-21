import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Modal, Dropdown, Drawer, Form, Input, Button, App, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { BellOutlined, DownOutlined, MenuOutlined } from '@ant-design/icons';
import { X, Mail, Phone, ShieldCheck, Activity, CheckCheck, ImageDown, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SmallPill } from '@/pages/training-manager/components/shared/SmallPill';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthService } from '@/services/AuthService';
import { api } from '@/services/api';

const toAbsoluteAssetUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/api\/?$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};
import { useNotificationStore, type NotificationItem } from '@/stores/useNotificationStore';
import { useAnnouncementStore } from '@/stores/useAnnouncementStore';
import { useNotificationStream } from '@/hooks/useNotificationStream';
import { useAnnouncementStream } from '@/hooks/useAnnouncementStream';
import './ModernLayout.css';
import { BackgroundEffects } from '@/pages/home/components/BackgroundEffects';

export interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string | null> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise(resolve => { image.onload = resolve; });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg');
};

const CropAvatarModal = ({
  open,
  tempImageUrl,
  onCancel,
  onSave
}: {
  open: boolean,
  tempImageUrl: string | null,
  onCancel: () => void,
  onSave: (url: string) => void
}) => {
  const { t } = useTranslation();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    if (tempImageUrl && croppedAreaPixels) {
      const croppedImage = await getCroppedImg(tempImageUrl, croppedAreaPixels);
      if (croppedImage) {
        onSave(croppedImage);
      }
    }
  };

  useEffect(() => {
    if (open) {
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    }
  }, [open]);

  return (
    <Modal
      title={<div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#0f172a' }}>{t('layout.avatarCropTitle', 'Crop Photo')}</div>}
      open={open}
      onCancel={onCancel}
      onOk={handleSaveCrop}
      width={400}
      okText={t('layout.savePhoto', 'Save Photo')}
      cancelText={t('layout.cancel', 'Cancel')}
      okButtonProps={{ style: { background: '#ea580c', borderColor: '#ea580c', fontWeight: 600, fontFamily: 'Inter, sans-serif' } }}
      cancelButtonProps={{ style: { fontWeight: 600, fontFamily: 'Inter, sans-serif' } }}
      styles={{ body: { padding: '16px 0' } }}
    >
      <div style={{ position: 'relative', width: '100%', height: 300, background: '#f8fafc', borderRadius: 8, overflow: 'hidden' }}>
        {tempImageUrl && (
          <Cropper
            image={tempImageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        )}
      </div>
      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16, padding: '0 16px' }}>
        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{t('layout.zoom', 'Zoom')}</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          style={{ flex: 1, accentColor: '#ea580c' }}
        />
      </div>
    </Modal>
  );
};

interface ModernLayoutProps {
  navItems: NavItem[];
  children: React.ReactNode;
  defaultRoute?: string;
  basePath?: string;
  onPrefetch?: (key: string) => void;
}

const renderProfileModal = (modal: React.ReactNode) => (
  <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(15, 23, 42, 0.05)' }}>
    {modal}
  </div>
);

import { extractUserFromToken } from '@/utils/jwt';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export const ModernLayout: React.FC<ModernLayoutProps> = ({
  navItems,
  children,
  defaultRoute = 'dashboard',
  basePath = '/training-manager',
  onPrefetch
}) => {
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationMenuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { tab } = useParams<{ tab: string }>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { t } = useTranslation();
  const { message } = App.useApp();

  useScrollAnimation();

  // Change Password state
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, token, logout, updateUser } = useAuthStore();
  const mustChangePassword = (user as any)?.mustChangePassword;

  useEffect(() => {
    if (mustChangePassword) {
      setChangePasswordVisible(true);
    }
  }, [mustChangePassword]);

  const [form] = Form.useForm();

  const handleChangePassword = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    try {
      await AuthService.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      message.success(t('layout.passwordChangeSuccess', 'Password changed successfully! Please log in again.'));
      form.resetFields();
      setChangePasswordVisible(false);
      // Force user to log out and log back in to get a fresh token with mustChangePassword=false
      if (mustChangePassword) {
        logout();
        navigate('/login', { replace: true });
      }
    } catch (error: any) {
      const code = error.response?.data?.code;
      if (code === 2002) {
        form.setFields([{ name: 'oldPassword', errors: [t('layout.invalidCurrentPassword', 'Current password is incorrect!')] }]);
      } else if (code === 2003) {
        form.setFields([{ name: 'confirmPassword', errors: [t('layout.passwordMismatch', 'Password confirmation does not match!')] }]);
      } else if (code === 1015) {
        form.setFields([{ name: 'newPassword', errors: [t('layout.passwordPolicy', 'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol!')] }]);
      } else {
        message.error(error.response?.data?.message || t('layout.passwordChangeFail', 'Failed to change password!'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Determine current active tab
  const activeTab = tab || defaultRoute;

  const [phone, setPhone] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if ((user as any)?.phone) setPhone((user as any).phone);
  }, [user]);

  const handleUpdateProfile = async () => {
    const currentPhone = (user as any)?.phone || '';
    const newPhone = phone || '';

    if (currentPhone === newPhone) {
      message.info(t('layout.profileUpdateNoChanges', 'No changes to save'));
      return;
    }

    try {
      setUpdatingProfile(true);
      await api.put('/users/myInfo', { ...(user as any), phone });
      message.success(t('layout.profileUpdateSuccess', 'Profile updated successfully!'));
    } catch (err: any) {
      message.error(err.response?.data?.message || t('layout.profileUpdateFail', 'Failed to update profile!'));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const filteredNavItems = useMemo(() => {
    return navItems.filter((item) => {
      if (!item.roles) return true;

      const payload = token ? extractUserFromToken(token) : null;
      const userRoles: string[] = payload?.roles || [];
      return item.roles.some(r => userRoles.includes(r) || userRoles.includes(`ROLE_${r}`));
    });
  }, [navItems, token]);

  const [profileOpen, setProfileOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState<NotificationItem | null>(null);

  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [availableAvatars, setAvailableAvatars] = useState<Array<{ filename: string; url: string; size: string }>>([]);
  const [pickerLoading, setPickerLoading] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Global notification state — bell badge + dropdown list. The store is
  // updated by the WebSocket stream below.
  const notifItems = useNotificationStore((s) => s.items);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchNotifications = useNotificationStore((s) => s.fetch);
  const markNotificationAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllNotificationsAsRead = useNotificationStore((s) => s.markAllAsRead);
  const resetNotifications = useNotificationStore((s) => s.reset);

  useNotificationStream();
  useAnnouncementStream();

  // Local mirror so the existing JSX keeps working without rewriting it
  // entirely; the store is the source of truth.
  useEffect(() => {
    setNotifications(notifItems);
  }, [notifItems]);

  useEffect(() => {
    if (token) fetchNotifications();
    else resetNotifications();
  }, [token, fetchNotifications, resetNotifications]);

  const markAsRead = async (id: string) => {
    await markNotificationAsRead(id);
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) await markNotificationAsRead(item.notificationId);
    setDetailsItem(item);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (accountMenuRef.current && !accountMenuRef.current.contains(target)) setAccountOpen(false);
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(target)) setNotificationOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (token) {
      try {
        await AuthService.logout(token);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    setCustomAvatarUrl(toAbsoluteAssetUrl(user?.avatarUrl));
  }, [user?.userId]);

  const openPicker = async () => {
    setPickerOpen(true);
    setPickerLoading(true);
    try {
      const res = await api.get<Array<{ filename: string; url: string; size: string }>>('/users/avatars');
      setAvailableAvatars(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to load avatars', e);
      setAvailableAvatars([]);
    } finally {
      setPickerLoading(false);
    }
  };

  const selectFromPicker = async (item: { filename: string; url: string }) => {
    try {
      const res = await api.put<{ avatarUrl: string }>('/users/myInfo', { avatarUrl: item.url });
      const absolute = toAbsoluteAssetUrl(res.data?.avatarUrl || item.url);
      if (absolute) {
        setCustomAvatarUrl(absolute);
        updateUser({ avatarUrl: absolute });
      }
      setPickerOpen(false);
    } catch (e) {
      console.error('Failed to set avatar', e);
      alert('Không thể cập nhật avatar');
    }
  };

  const handleNavigate = (key: string) => {
    if (onPrefetch) {
      onPrefetch(key);
    }
    navigate(`${basePath}/${key}`);
    setDrawerOpen(false);
  };

  return (
    <div className="modern-layout-wrapper">
      <div className="modern-layout-container">

        {/* Header Navbar */}
        <div className="modern-header-navbar">
          <div className="modern-header-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                className="mobile-menu-btn"
                onClick={() => setDrawerOpen(true)}
                style={{ cursor: 'pointer', fontSize: 18, color: '#1e293b', background: 'none', border: 'none', padding: 0 }}
              >
                <MenuOutlined />
              </button>
              <a
                href="/"
                className="modern-brand-logo"
                onClick={(e) => { e.preventDefault(); navigate('/'); }}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                UEIMS
              </a>
            </div>
            <div className="modern-nav-items desktop-only">
              {/* Visible pills: first 7 items */}
              {filteredNavItems.slice(0, 7).map((item) => {
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavigate(item.key)}
                    className={`modern-nav-item ${isActive ? 'active' : 'inactive'}`}
                  >
                    <span style={{ fontSize: 16, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                    <span>{t(`nav.${item.key}`, item.label)}</span>
                  </button>
                );
              })}

              {/* More dropdown: remaining items */}
              {filteredNavItems.length > 7 && (() => {
                const moreItems: MenuProps['items'] = filteredNavItems.slice(7).map((item) => ({
                  key: item.key,
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15 }}>{item.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{t(`nav.${item.key}`, item.label)}</span>
                    </div>
                  ),
                  onClick: () => handleNavigate(item.key),
                }));

                const isMoreActive = filteredNavItems.slice(7).some((item) => activeTab === item.key);

                return (
                  <Dropdown menu={{ items: moreItems }} trigger={['click']} placement="bottomRight">
                    <div
                      className={`modern-nav-item ${isMoreActive ? 'active' : 'inactive'}`}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <span style={{ fontSize: 16, display: 'flex', alignItems: 'center' }}><DownOutlined /></span>
                      <span>{t('layout.more', 'More')}</span>
                    </div>
                  </Dropdown>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Floating Bottom Bar */}
        <div className="modern-bottom-bar-wrapper">
          <div className="modern-bottom-bar">
            <div className="modern-bottom-bar-bg" />

            <div ref={notificationMenuRef} style={{ position: 'relative', zIndex: 1, flex: '0 0 auto' }}>
              <button
                type="button"
                onClick={() => { setNotificationOpen((prev) => !prev); setAccountOpen(false); }}
                className="modern-bell-icon-wrapper"
              >
                <BellOutlined style={{ fontSize: 18 }} />
                {unreadCount > 0 && <div className="modern-bell-badge" />}
              </button>
            </div>

            <div className="modern-bar-divider" />

            <div ref={accountMenuRef} style={{ position: 'relative', zIndex: 1, flex: '1 1 auto', minWidth: 0 }}>
              <button
                type="button"
                onClick={() => { setAccountOpen((prev) => !prev); setNotificationOpen(false); }}
                className="modern-account-wrapper"
                style={{ textAlign: 'left', width: '100%' }}
              >
                <div className="modern-account-avatar" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#fff',
                  background: (customAvatarUrl || user?.avatarUrl) ? `url(${customAvatarUrl || user?.avatarUrl}) center/cover no-repeat` : undefined
                }}>
                  {!(customAvatarUrl || user?.avatarUrl) && (user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'U')}
                </div>
                <div className="modern-account-info">
                  <div className="modern-account-name">{user?.fullName || t('layout.userFallback', 'User')}</div>
                  <div className="modern-account-email">{user?.email || 'admin@ueims.com'}</div>
                </div>
              </button>
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(230, 126, 34,.18), transparent)', pointerEvents: 'none' }} />
          </div>

          {/* Notification Dropdown */}
          {notificationOpen && (
            <div onMouseDown={(e) => e.stopPropagation()} className="modern-floating-menu">
              <div className="modern-floating-menu-arrow" style={{ left: 32 }} />
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(230, 126, 34,.10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>{t('layout.alerts', 'Alerts')}</div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>{t('layout.alertsDesc', 'Latest reminders and urgent items')}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {unreadCount > 0 && <SmallPill color="#E67E22" glow>{t('layout.unreadCount', { count: unreadCount })}</SmallPill>}
                  <Tooltip title={t('layout.markAllRead', 'Mark all as read')} placement="bottom">
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      disabled={unreadCount === 0}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 30,
                        height: 30,
                        borderRadius: 10,
                        border: '1px solid rgba(230, 126, 34,.18)',
                        background: unreadCount === 0 ? 'rgba(241, 245, 249, .6)' : '#fff7ed',
                        color: unreadCount === 0 ? '#94a3b8' : '#E67E22',
                        cursor: unreadCount === 0 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <CheckCheck size={14} strokeWidth={2.6} />
                    </button>
                  </Tooltip>
                </div>
              </div>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 16, textAlign: 'center', color: '#64748b' }}>{t('layout.noNotifications', 'No notifications yet')}</div>
                ) : (
                  notifications.map((item: any) => (
                    <div
                      key={item.notificationId}
                      onClick={() => handleNotificationClick(item)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 16,
                        background: item.isRead ? 'rgba(255,255,255,.78)' : '#fff3ed',
                        border: '1px solid rgba(230, 126, 34,.08)',
                        boxShadow: '0 8px 18px rgba(15,23,42,.04)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E67E22', boxShadow: `0 0 0 4px #E67E2220`, marginTop: 4, flexShrink: 0 }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: '#1e293b' }}>{item.title}</div>
                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.message}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                          <span style={{ fontSize: 10, color: '#94a3b8' }}>{new Date(item.createdAt).toLocaleString()}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#E67E22', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('layout.viewDetails', 'View details →')}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Notification Detail Modal — opened from bell dropdown */}
          <Modal
            open={detailsItem !== null}
            onCancel={() => setDetailsItem(null)}
            footer={null}
            width={520}
            centered
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'Inter, sans-serif', fontWeight: 800, color: '#0f172a', fontSize: 15 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: '#fff7ed', border: '1px solid #ffedd5' }}>
                  <BellOutlined style={{ color: '#ea580c', fontSize: 16 }} />
                </div>
                {t('layout.notificationDetails', 'Notification Details')}
              </div>
            }
            styles={{
              content: { borderRadius: 20 },
              header: { borderBottom: '1px solid #f1f5f9', marginBottom: 0, paddingBottom: 12 },
              body: { paddingTop: 16 }
            }}
          >
            {detailsItem && (
              <div style={{ fontFamily: 'Inter, sans-serif' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{detailsItem.title}</div>
                  <SmallPill color="#E67E22">{detailsItem.type}</SmallPill>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 12 }}>
                  {new Date(detailsItem.createdAt).toLocaleString()}
                </div>
                <div style={{
                  fontSize: 13.5,
                  lineHeight: 1.7,
                  color: '#334155',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '14px 16px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {detailsItem.message}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                  <Button
                    type="primary"
                    onClick={() => setDetailsItem(null)}
                    style={{ background: '#ea580c', borderColor: '#ea580c', fontWeight: 700, borderRadius: 10 }}
                  >
                    {t('layout.close', 'Close')}
                  </Button>
                </div>
              </div>
            )}
          </Modal>

          {/* Account Dropdown */}
          {accountOpen && (
            <div onMouseDown={(e) => e.stopPropagation()} className="modern-floating-menu">
              <div className="modern-floating-menu-arrow" style={{ left: 110 }} />
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(230, 126, 34,.10)' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.fullName || t('layout.userFallback', 'User')}
                </div>
                <div style={{ fontSize: 11.5, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email || 'admin@ueims.com'}
                </div>
              </div>
              <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { key: 'viewProfile', label: t('layout.viewProfile', 'View Profile') },
                  { key: 'changePassword', label: t('layout.changePassword', 'Change Password') },
                  { key: 'logout', label: t('layout.logout', 'Logout') }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setAccountOpen(false);
                      if (item.key === 'logout') handleLogout();
                      if (item.key === 'changePassword') setChangePasswordVisible(true);
                      if (item.key === 'viewProfile') setProfileOpen(true);
                    }}
                    className="modern-menu-item"
                    style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: item.key === 'logout' ? '#ef4444' : '#1e293b' }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Drawer */}
        <Drawer
          title={
            <a
              href="/"
              className="modern-brand-logo"
              onClick={(e) => { e.preventDefault(); setDrawerOpen(false); navigate('/'); }}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              UEIMS
            </a>
          }
          placement="left"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          width={280}
          styles={{ body: { padding: 0 }, header: { borderBottom: '1px solid rgba(230, 126, 34,.10)' } }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 0' }}>
            {filteredNavItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleNavigate(item.key)}
                  style={{
                    padding: '12px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    background: isActive ? 'rgba(230, 126, 34,.08)' : 'transparent',
                    color: isActive ? '#E67E22' : '#475569',
                    border: 'none',
                    borderRight: isActive ? '3px solid #E67E22' : '3px solid transparent',
                    fontWeight: isActive ? 700 : 500,
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ fontSize: 15 }}>{t(`nav.${item.key}`, item.label)}</span>
                </button>
              );
            })}
          </div>
        </Drawer>

        {/* Page Content */}
        <BackgroundEffects isDark={false} />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Profile Modal - Redesigned (Premium Clean) */}
      <Modal
        open={profileOpen}
        onCancel={() => setProfileOpen(false)}
        footer={null}
        closable={false}
        styles={{ body: { padding: 0, borderRadius: 24, overflow: 'hidden' } }}
        width={380}
        modalRender={renderProfileModal}
      >
        {/* Cover & Avatar Section */}
        <div style={{ position: 'relative' }}>
          {/* Cover Photo */}
          <div style={{ height: 100, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}></div>

          <button
            onClick={() => setProfileOpen(false)}
            style={{
              position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderRadius: 14,
              background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#475569', cursor: 'pointer', transition: 'all 0.2s', border: 'none'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#0f172a'; }}
            onFocus={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.color = '#475569'; }}
            onBlur={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.color = '#475569'; }}
          >
            <X size={14} strokeWidth={3} />
          </button>

          <div style={{ padding: '0 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -40 }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: (customAvatarUrl || user?.avatarUrl) ? `url(${customAvatarUrl || user?.avatarUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #f97316, #fb923c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 28, fontWeight: 800, fontFamily: 'Inter, sans-serif',
                border: '4px solid #fff', boxShadow: '0 8px 16px -4px rgba(249, 115, 22, 0.3)'
              }}>
                {!(customAvatarUrl || user?.avatarUrl) && (user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'U')}
              </div>

              <button
                onClick={openPicker}
                title="Chọn từ thư viện"
                style={{
                  position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%',
                  background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  color: '#475569', transition: 'all 0.2s', padding: 0
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = '#0ea5e9'; e.currentTarget.style.borderColor = '#0ea5e9'; }}
                onFocus={(e) => { e.currentTarget.style.color = '#0ea5e9'; e.currentTarget.style.borderColor = '#0ea5e9'; }}
                onMouseOut={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                onBlur={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <ImageDown size={12} strokeWidth={2.5} />
              </button>
            </div>

            {/* Name & Role */}
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <div style={{ color: '#0f172a', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'Inter, sans-serif' }}>
                {user?.fullName || t('layout.loading', 'Loading...')}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4, background: '#f1f5f9', padding: '4px 10px', borderRadius: 100 }}>
                <ShieldCheck size={14} color="#64748b" />
                <span style={{ color: '#475569', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                  {user?.roles?.map((r: any) => typeof r === 'string' ? r.replace('ROLE_', '') : r.roleName?.replace('ROLE_', '')).join(', ') || t('layout.userFallback', 'User')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info List Section */}
        <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 1, background: '#f1f5f9', width: '100%', marginBottom: 8 }}></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={16} color="#64748b" />
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('layout.emailAddress', 'Email Address')}</span>
            </div>
            <span style={{ fontSize: 14, color: '#0f172a', fontWeight: 600, fontFamily: 'Inter, sans-serif', paddingLeft: 24 }}>{user?.email}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={16} color="#64748b" />
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('layout.phoneNumber', 'Phone Number')}</span>
            </div>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('layout.notUpdated', 'Not updated')}
              variant="borderless"
              style={{ fontSize: 14, color: '#0f172a', fontWeight: 600, fontFamily: 'Inter, sans-serif', padding: '0 0 0 12px', boxShadow: 'none' }}
            />
          </div>

          {/* Status row special casing */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={16} color="#64748b" />
              <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{t('layout.accountStatus', 'Account Status')}</span>
            </div>
            <span style={{
              padding: '4px 12px', borderRadius: 100,
              background: '#ecfdf5',
              color: '#10b981',
              fontWeight: 700, fontSize: 11, fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em', border: '1px solid #a7f3d0'
            }}>
              {t('layout.activeStatus', 'ACTIVE')}
            </span>
          </div>

          <div style={{ marginTop: 24 }}>
            <Button
              type="primary"
              block
              onClick={handleUpdateProfile}
              loading={updatingProfile}
              style={{
                background: '#ea580c',
                borderColor: '#ea580c',
                fontWeight: 700,
                height: 44,
                borderRadius: 12,
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
              }}
            >
              {t('layout.updateInfo', 'Update Information')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'Inter, sans-serif', fontWeight: 800, color: '#0f172a', fontSize: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 12, background: '#fff7ed', border: '1px solid #ffedd5' }}>
              <ShieldCheck size={22} color="#ea580c" />
            </div>
            {t('layout.accountSecurity', 'Account Security')}
          </div>
        }
        open={changePasswordVisible}
        onCancel={() => !mustChangePassword && setChangePasswordVisible(false)}
        footer={null}
        destroyOnHidden
        closable={!mustChangePassword}
        maskClosable={!mustChangePassword}
        keyboard={!mustChangePassword}
        width={420}
        closeIcon={!mustChangePassword ? <X size={20} color="#94a3b8" style={{ marginTop: 8, marginRight: 8 }} /> : null}
        styles={{
          content: { borderRadius: 24, padding: '24px 32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' },
          header: { marginBottom: 24 },
          body: { padding: 0 }
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleChangePassword} requiredMark={false}>
          <Form.Item
            name="oldPassword"
            label={<span style={{ fontWeight: 700, color: '#334155', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>{t('layout.currentPassword', 'Current Password')}</span>}
            rules={[{ required: true, message: t('layout.passwordRequired', 'Please enter your password!') }]}
          >
            <Input.Password
              size="large"
              placeholder={t('layout.currentPasswordPlaceholder', 'Enter your current password')}
              className="modern-password-input"
            />
          </Form.Item>

          <div style={{ height: 1, background: '#f1f5f9', margin: '20px 0' }} />

          <Form.Item
            name="newPassword"
            label={<span style={{ fontWeight: 700, color: '#334155', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>{t('layout.newPassword', 'New Password')}</span>}
            rules={[
              { required: true, message: t('layout.passwordRequired', 'Please enter your password!') },
              { min: 8, message: t('layout.passwordMinLength', 'Password must be at least 8 characters!') },
            ]}
          >
            <Input.Password
              size="large"
              placeholder={t('layout.newPasswordPlaceholder', 'Create a new password')}
              className="modern-password-input"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={<span style={{ fontWeight: 700, color: '#334155', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>{t('layout.confirmPassword', 'Confirm Password')}</span>}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: t('layout.confirmPasswordRequired', 'Please confirm your password!') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('layout.passwordMismatch', 'Password confirmation does not match!')));
                },
              }),
            ]}
            style={{ marginBottom: 32 }}
          >
            <Input.Password
              size="large"
              placeholder={t('layout.confirmPasswordPlaceholder', 'Confirm your new password')}
              className="modern-password-input"
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 12 }}>
            {!mustChangePassword && (
              <Button
                size="large"
                onClick={() => setChangePasswordVisible(false)}
                style={{ flex: 1, borderRadius: 12, fontWeight: 700, color: '#475569', border: '1px solid #cbd5e1', background: '#fff', height: 44, fontFamily: 'Inter, sans-serif' }}
              >
                {t('layout.cancel', 'Cancel')}
              </Button>
            )}
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ flex: 1, borderRadius: 12, fontWeight: 700, background: '#ea580c', borderColor: '#ea580c', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)', height: 44, fontFamily: 'Inter, sans-serif' }}
            >
              {t('layout.saveChanges', 'Save Changes')}
            </Button>
          </div>
        </Form>
      </Modal>

      {pickerOpen && (
        <div
          onClick={() => setPickerOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 16, width: '100%', maxWidth: 720, maxHeight: '80vh',
              display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Chọn ảnh từ thư viện</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                  Thả file ảnh vào thư mục <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>ueims_backend/uploads/avatars/</code> rồi chọn bên dưới
                </p>
              </div>
              <button
                onClick={() => setPickerOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: '#f8fafc' }}>
              {pickerLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Đang tải...</div>
              ) : availableAvatars.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                  <Search size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                  <p style={{ margin: 0, fontSize: 14 }}>Chưa có ảnh nào trong thư viện</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                  {availableAvatars.map((item) => (
                    <button
                      key={item.filename}
                      onClick={() => selectFromPicker(item)}
                      style={{
                        padding: 0, border: '2px solid #e2e8f0', borderRadius: 12, overflow: 'hidden',
                        background: '#fff', cursor: 'pointer', aspectRatio: '1', transition: 'all 0.2s',
                        position: 'relative'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <img
                        src={toAbsoluteAssetUrl(item.url) || ''}
                        alt={item.filename}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, padding: '4px 6px',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: '#fff',
                        fontSize: 10, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {item.filename}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '12px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setPickerOpen(false)}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: '#fff', color: '#475569', cursor: 'pointer', fontSize: 14
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
