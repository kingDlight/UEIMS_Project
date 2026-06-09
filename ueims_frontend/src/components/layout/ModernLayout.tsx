import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Modal, Dropdown, Drawer } from 'antd';
import type { MenuProps } from 'antd';
import { BellOutlined, DownOutlined, MenuOutlined } from '@ant-design/icons';
import { X, Mail, Phone, ShieldCheck, Activity, Camera } from 'lucide-react';
import { SmallPill } from '@/pages/training-manager/components/shared/SmallPill';
import { floatingNotifications } from '@/pages/training-manager/data';
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

  // Determine current active tab
  const activeTab = tab || defaultRoute;

  const { user, token, logout, currentRole } = useAuthStore();
  const [realName, setRealName] = useState(user?.fullName || 'User');

  const filteredNavItems = useMemo(() => {
    return navItems.filter((item) => {
      if (!item.roles) return true;
      return currentRole && item.roles.includes(currentRole);
    });
  }, [navItems, currentRole]);

  const [myProfile, setMyProfile] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(() => {
    return localStorage.getItem('ueims_custom_avatar');
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const res = await api.get('/users/myInfo');
        setMyProfile(res.data);
        if (res.data?.fullName) {
          setRealName(res.data.fullName);
        }
      } catch (e) {
        console.error('Failed to fetch myInfo', e);
      }
    };
    if (token) {
      fetchMyInfo();
    }
  }, [token]);

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
              <div className="modern-brand-logo">UEIMS</div>
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
                    style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'inherit' }}
                  >
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
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
                      <span style={{ fontSize: 14 }}><DownOutlined /></span>
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
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                <BellOutlined style={{ fontSize: 18 }} />
                <div className="modern-bell-badge" />
              </button>
            </div>
            
            <div className="modern-bar-divider" />
            
            <div ref={accountMenuRef} style={{ position: 'relative', zIndex: 1, flex: '1 1 auto' }}>
              <button 
                type="button"
                onClick={() => { setAccountOpen((prev) => !prev); setNotificationOpen(false); }} 
                className="modern-account-wrapper"
                style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', textAlign: 'left' }}
              >
                <div className="modern-account-avatar" style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#fff',
                  background: customAvatarUrl ? `url(${customAvatarUrl}) center/cover no-repeat` : undefined
                }}>
                  {!customAvatarUrl && (realName ? realName.substring(0, 2) : 'U')}
                </div>
                <div className="modern-account-info">
                  <div className="modern-account-name">{realName}</div>
                  <div className="modern-account-email">{user?.email || 'admin@ueims.com'}</div>
                </div>
              </button>
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(233,101,0,.18), transparent)', pointerEvents: 'none' }} />
          </div>

          {/* Notification Dropdown */}
          {notificationOpen && (
            <div role="presentation" onMouseDown={(e) => e.stopPropagation()} className="modern-floating-menu">
              <div className="modern-floating-menu-arrow" style={{ left: 32 }} />
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(233,101,0,.10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>Alerts</div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>Latest reminders and urgent items</div>
                </div>
                <SmallPill color="#E96500" glow>3 new</SmallPill>
              </div>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {floatingNotifications.map((item, index) => (
                  <div key={item.title || index} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 16, background: 'rgba(255,255,255,.78)', border: '1px solid rgba(233,101,0,.08)', boxShadow: '0 8px 18px rgba(15,23,42,.04)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.tone, boxShadow: `0 0 0 4px ${item.tone}20`, marginTop: 4 }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#1e293b' }}>{item.title}</div>
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{item.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Dropdown */}
          {accountOpen && (
            <div role="presentation" onMouseDown={(e) => e.stopPropagation()} className="modern-floating-menu">
              <div className="modern-floating-menu-arrow" style={{ left: 110 }} />
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(233,101,0,.10)' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {realName}
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
                      if (item === 'Change Password') navigate('/change-password');
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
          title={<div className="modern-brand-logo">UEIMS</div>}
          placement="left"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          width={280}
          styles={{ body: { padding: 0 }, header: { borderBottom: '1px solid rgba(233,101,0,.10)' } }}
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
                    background: isActive ? 'rgba(233,101,0,.08)' : 'transparent',
                    color: isActive ? '#E96500' : '#475569',
                    border: 'none',
                    borderRight: isActive ? '3px solid #E96500' : '3px solid transparent',
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
                background: customAvatarUrl ? `url(${customAvatarUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #f97316, #fb923c)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#fff', fontSize: 28, fontWeight: 800, fontFamily: 'Inter, sans-serif',
                border: '4px solid #fff', boxShadow: '0 8px 16px -4px rgba(249, 115, 22, 0.3)'
              }}>
                {!customAvatarUrl && (myProfile?.fullName ? myProfile.fullName.substring(0, 2).toUpperCase() : 'U')}
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
                {myProfile?.fullName || 'Đang tải...'}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4, background: '#f1f5f9', padding: '4px 10px', borderRadius: 100 }}>
                <ShieldCheck size={14} color="#64748b" />
                <span style={{ color: '#475569', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                  {myProfile?.roles?.map((r: any) => r.roleName.replace('ROLE_', '')).join(', ') || 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info List Section */}
        <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 1, background: '#f1f5f9', width: '100%', marginBottom: 8 }}></div>
          
          {[
            { icon: <Mail size={16} color="#64748b" />, label: 'Email Address', value: myProfile?.email },
            { icon: <Phone size={16} color="#64748b" />, label: 'Phone Number', value: myProfile?.phone || 'Chưa cập nhật' },
          ].map((item) => (
            <div key={item.label} style={{ 
              display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 0', borderBottom: '1px solid #f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {item.icon}
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</span>
              </div>
              <span style={{ fontSize: 14, color: '#0f172a', fontWeight: 600, fontFamily: 'Inter, sans-serif', paddingLeft: 24 }}>{item.value}</span>
            </div>
          ))}

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
                background: myProfile?.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2', 
                color: myProfile?.status === 'ACTIVE' ? '#10b981' : '#ef4444', 
                fontWeight: 700, fontSize: 11, fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em', border: `1px solid ${myProfile?.status === 'ACTIVE' ? '#a7f3d0' : '#fecaca'}`
              }}>
                {myProfile?.status || 'UNKNOWN'}
              </span>
            </div>
        </div>
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
