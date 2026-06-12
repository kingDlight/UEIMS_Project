import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Modal, Dropdown, Drawer, Form, Input, Button, message } from 'antd';
import type { MenuProps } from 'antd';
import { BellOutlined, DownOutlined, MenuOutlined } from '@ant-design/icons';
import { X, Mail, Phone, ShieldCheck, Activity, Camera } from 'lucide-react';
import { SmallPill } from '@/pages/training-manager/components/shared/SmallPill';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthService } from '@/services/AuthService';
import { api } from '@/services/api';
import './ModernLayout.css';

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
      title={<div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#0f172a' }}>Điều chỉnh ảnh</div>}
      open={open}
      onCancel={onCancel}
      onOk={handleSaveCrop}
      width={400}
      okText="Lưu ảnh"
      cancelText="Hủy"
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
        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Thu phóng</span>
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
  basePath?: string; // e.g. "/app/tm-dashboard"
}

const renderProfileModal = (modal: React.ReactNode) => (
  <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(15, 23, 42, 0.05)' }}>
    {modal}
  </div>
);

import { extractUserFromToken } from '@/utils/jwt';

export const ModernLayout: React.FC<ModernLayoutProps> = ({ 
  navItems, 
  children,
  defaultRoute = 'dashboard',
  basePath = '/app/tm-dashboard'
}) => {
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationMenuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { tab } = useParams<{ tab: string }>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Change Password state
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

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
      message.success('Đổi mật khẩu thành công!');
      setChangePasswordVisible(false);
    } catch (error: any) {
      const code = error.response?.data?.code;
      if (code === 2002) {
        form.setFields([{ name: 'oldPassword', errors: ['Mật khẩu hiện tại không chính xác!'] }]);
      } else if (code === 2003) {
        form.setFields([{ name: 'confirmPassword', errors: ['Mật khẩu xác nhận không khớp!'] }]);
      } else if (code === 1015) {
        form.setFields([{ name: 'newPassword', errors: ['Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt!'] }]);
      } else {
        message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại!');
      }
    } finally {
      setLoading(false);
    }
  };

  // Determine current active tab
  const activeTab = tab || defaultRoute;

  const { user, token, logout } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      setUpdatingProfile(true);
      await api.put('/users/myInfo', { ...user, phone });
      message.success('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Cập nhật thất bại!');
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
  
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(() => {
    return localStorage.getItem('ueims_custom_avatar');
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await api.get('/notifications/my');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Optionally set up an interval to poll notifications here
  }, [token]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageUrl(reader.result as string);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    navigate('/login');
  };

  const handleNavigate = (key: string) => {
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
                    <span>{item.label}</span>
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
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
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
                      <span>More</span>
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
                  <div className="modern-account-name">{user?.fullName || 'User'}</div>
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
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(230, 126, 34,.10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>Alerts</div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>Latest reminders and urgent items</div>
                </div>
                {unreadCount > 0 && <SmallPill color="#E67E22" glow>{unreadCount} new</SmallPill>}
              </div>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 16, textAlign: 'center', color: '#64748b' }}>No notifications yet</div>
                ) : (
                  notifications.map((item: any) => (
                    <div 
                      key={item.notificationId} 
                      onClick={() => { if (!item.isRead) markAsRead(item.notificationId); }}
                      style={{ 
                        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 16, 
                        background: item.isRead ? 'rgba(255,255,255,.78)' : '#fff3ed', 
                        border: '1px solid rgba(230, 126, 34,.08)', 
                        boxShadow: '0 8px 18px rgba(15,23,42,.04)',
                        cursor: item.isRead ? 'default' : 'pointer',
                        transition: 'all 0.2s'
                      }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E67E22', boxShadow: `0 0 0 4px #E67E2220`, marginTop: 4 }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: '#1e293b' }}>{item.title}</div>
                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{item.message}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>{new Date(item.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Account Dropdown */}
          {accountOpen && (
            <div onMouseDown={(e) => e.stopPropagation()} className="modern-floating-menu">
              <div className="modern-floating-menu-arrow" style={{ left: 110 }} />
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(230, 126, 34,.10)' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.fullName || 'User'}
                </div>
                <div style={{ fontSize: 11.5, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email || 'admin@ueims.com'}
                </div>
              </div>
              <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['View Profile', 'Change Password', 'Logout'].map((item) => (
                  <button 
                    key={item} 
                    type="button"
                    onClick={() => {
                      setAccountOpen(false);
                      if (item === 'Logout') handleLogout();
                      if (item === 'Change Password') setChangePasswordVisible(true);
                      if (item === 'View Profile') setProfileOpen(true);
                    }} 
                    className="modern-menu-item"
                    style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: item === 'Logout' ? '#ef4444' : '#1e293b' }}
                  >
                    {item}
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
                  <span style={{ fontSize: 15 }}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </Drawer>

        {/* Page Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
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
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%',
                  background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  color: '#475569', transition: 'all 0.2s', padding: 0
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = '#ea580c'; e.currentTarget.style.borderColor = '#ea580c'; }}
                onFocus={(e) => { e.currentTarget.style.color = '#ea580c'; e.currentTarget.style.borderColor = '#ea580c'; }}
                onMouseOut={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                onBlur={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <Camera size={12} strokeWidth={2.5} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </div>
            
            {/* Name & Role */}
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <div style={{ color: '#0f172a', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'Inter, sans-serif' }}>
                {user?.fullName || 'Đang tải...'}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4, background: '#f1f5f9', padding: '4px 10px', borderRadius: 100 }}>
                <ShieldCheck size={14} color="#64748b" />
                <span style={{ color: '#475569', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                  {user?.roles?.map((r: any) => typeof r === 'string' ? r.replace('ROLE_', '') : r.roleName?.replace('ROLE_', '')).join(', ') || 'User'}
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
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email Address</span>
            </div>
            <span style={{ fontSize: 14, color: '#0f172a', fontWeight: 600, fontFamily: 'Inter, sans-serif', paddingLeft: 24 }}>{user?.email}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={16} color="#64748b" />
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phone Number</span>
            </div>
            <Input 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="Chưa cập nhật"
              bordered={false}
              style={{ fontSize: 14, color: '#0f172a', fontWeight: 600, fontFamily: 'Inter, sans-serif', padding: '0 0 0 12px', boxShadow: 'none' }}
            />
          </div>

          {/* Status row special casing */}
          <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={16} color="#64748b" />
                <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Account Status</span>
              </div>
              <span style={{ 
                padding: '4px 12px', borderRadius: 100, 
                background: '#ecfdf5', 
                color: '#10b981', 
                fontWeight: 700, fontSize: 11, fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em', border: '1px solid #a7f3d0'
              }}>
                ACTIVE
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
                Cập nhật thông tin
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
            Bảo mật tài khoản
          </div>
        }
        open={changePasswordVisible}
        onCancel={() => setChangePasswordVisible(false)}
        footer={null}
        destroyOnClose
        width={420}
        closeIcon={<X size={20} color="#94a3b8" style={{ marginTop: 8, marginRight: 8 }} />}
        styles={{ 
          content: { borderRadius: 24, padding: '24px 32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' },
          header: { marginBottom: 24 },
          body: { padding: 0 }
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleChangePassword} requiredMark={false}>
          <Form.Item
            name="oldPassword"
            label={<span style={{ fontWeight: 700, color: '#334155', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Mật khẩu hiện tại</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
          >
            <Input.Password 
              size="large" 
              placeholder="Nhập mật khẩu đang sử dụng" 
              className="modern-password-input"
            />
          </Form.Item>
          
          <div style={{ height: 1, background: '#f1f5f9', margin: '20px 0' }} />

          <Form.Item
            name="newPassword"
            label={<span style={{ fontWeight: 700, color: '#334155', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Mật khẩu mới</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
            ]}
          >
            <Input.Password 
              size="large" 
              placeholder="Tạo mật khẩu mới" 
              className="modern-password-input"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={<span style={{ fontWeight: 700, color: '#334155', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Xác nhận mật khẩu</span>}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
            style={{ marginBottom: 32 }}
          >
            <Input.Password 
              size="large" 
              placeholder="Nhập lại mật khẩu mới" 
              className="modern-password-input"
            />
          </Form.Item>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <Button 
              size="large"
              onClick={() => setChangePasswordVisible(false)} 
              style={{ flex: 1, borderRadius: 12, fontWeight: 700, color: '#475569', border: '1px solid #cbd5e1', background: '#fff', height: 44, fontFamily: 'Inter, sans-serif' }}
            >
              Hủy bỏ
            </Button>
            <Button 
              size="large"
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ flex: 1, borderRadius: 12, fontWeight: 700, background: '#ea580c', borderColor: '#ea580c', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)', height: 44, fontFamily: 'Inter, sans-serif' }}
            >
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>

      <CropAvatarModal 
        open={cropModalOpen} 
        tempImageUrl={tempImageUrl} 
        onCancel={() => setCropModalOpen(false)} 
        onSave={(url) => {
          setCustomAvatarUrl(url);
          localStorage.setItem('ueims_custom_avatar', url);
          setCropModalOpen(false);
        }}
      />
    </div>
  );
};
