import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dropdown } from 'antd';
import { MenuOutlined, CloseOutlined, SearchOutlined, DownOutlined } from '@ant-design/icons';

const FPT_HERO_IMAGE =
  'https://daihoc.fpt.edu.vn/wp-content/uploads/2024/08/anh-fpt-1.jpg';

// FPT Colors
const FPT_ORANGE = '#FF6B00';
const FPT_DARK   = '#0a2240';
const FPT_BLUE   = '#1a4fa0';

const navLinks = [
  {
    label: 'Về Chúng Tôi',
    children: [
      { label: 'Giới thiệu UEIMS', href: '#about' },
      { label: 'Mục tiêu hệ thống', href: '#goal' },
      { label: 'Đội ngũ phát triển', href: '#team' },
    ],
  },
  {
    label: 'Tính Năng',
    children: [
      { label: 'Quản lý Kỳ OJT', href: '#semester' },
      { label: 'Tuyển dụng Doanh nghiệp', href: '#enterprise' },
      { label: 'Theo dõi Sinh viên', href: '#student' },
    ],
  },
  {
    label: 'Hướng Dẫn',
    children: [
      { label: 'Hướng dẫn Sinh viên', href: '#guide-student' },
      { label: 'Hướng dẫn Doanh nghiệp', href: '#guide-enterprise' },
    ],
  },
  { label: 'Liên Hệ', href: '#contact' },
];

const stats = [
  { value: '2,500+', label: 'Sinh viên thực tập' },
  { value: '350+', label: 'Doanh nghiệp đối tác' },
  { value: '95%', label: 'Tỷ lệ hài lòng' },
  { value: '12+', label: 'Năm kinh nghiệm' },
];

const features = [
  {
    icon: '🎓',
    title: 'Quản lý Kỳ OJT',
    desc: 'Tạo và quản lý toàn bộ chu trình thực tập: từ phân bổ sinh viên, theo dõi tiến độ đến chấm điểm cuối kỳ một cách tập trung.',
  },
  {
    icon: '🏢',
    title: 'Kết nối Doanh nghiệp',
    desc: 'Nền tảng kết nối trực tiếp giữa nhà trường và hàng trăm doanh nghiệp đối tác, đăng tin tuyển dụng và lọc ứng viên hiệu quả.',
  },
  {
    icon: '📊',
    title: 'Báo cáo & Đánh giá',
    desc: 'Sinh viên nộp báo cáo tuần, mentor đánh giá rubric, giảng viên chấm điểm — tất cả được số hoá và theo dõi minh bạch.',
  },
  {
    icon: '🔐',
    title: 'Phân quyền Đa cấp',
    desc: 'Hệ thống phân quyền chặt chẽ theo 6 vai trò: Admin, Training Manager, Enterprise, Mentor, Lecturer và Student.',
  },
  {
    icon: '📅',
    title: 'Lịch Phỏng vấn',
    desc: 'Doanh nghiệp đặt lịch phỏng vấn trực tiếp với sinh viên, kiểm tra chồng lịch tự động và gửi thông báo tức thì.',
  },
  {
    icon: '📈',
    title: 'Thống kê Tổng quan',
    desc: 'Dashboard thời gian thực với biểu đồ thống kê số lượng sinh viên, điểm trung bình và tình trạng thực tập theo kỳ.',
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [imgError, setImgError]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", overflowX: 'hidden' }}>

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 72,
        background: scrolled ? 'rgba(10,34,64,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'background 0.35s ease',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: FPT_ORANGE,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, color: '#fff', fontSize: 18,
          }}>U</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, lineHeight: 1.1 }}>UEIMS</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, letterSpacing: '0.05em' }}>FPT UNIVERSITY</div>
          </div>
        </div>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {navLinks.map((link) =>
            link.children ? (
              <Dropdown
                key={link.label}
                menu={{
                  items: link.children.map((c) => ({
                    key: c.label, label: (
                      <a href={c.href} style={{ color: FPT_DARK }}>{c.label}</a>
                    ),
                  })),
                }}
                placement="bottomLeft"
              >
                <button style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#fff', fontSize: 14, fontWeight: 500,
                  padding: '8px 14px', borderRadius: 6,
                  display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  {link.label} <DownOutlined style={{ fontSize: 10 }} />
                </button>
              </Dropdown>
            ) : (
              <a key={link.label} href={link.href} style={{
                color: '#fff', fontSize: 14, fontWeight: 500,
                padding: '8px 14px', borderRadius: 6,
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >{link.label}</a>
            )
          )}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{
            background: 'none', border: '1.5px solid rgba(255,255,255,0.5)',
            color: '#fff', borderRadius: 24, padding: '7px 18px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onClick={() => navigate('/login')}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.borderColor = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
            }}
          >Đăng nhập</button>

          <button style={{
            background: FPT_ORANGE, border: 'none',
            color: '#fff', borderRadius: 24, padding: '8px 22px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            transition: 'background 0.2s',
          }}
            onClick={() => navigate('/login')}
            onMouseEnter={e => (e.currentTarget.style.background = '#e55a00')}
            onMouseLeave={e => (e.currentTarget.style.background = FPT_ORANGE)}
          >Vào hệ thống →</button>

          <button
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-menu-btn"
          >
            {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', height: '100vh', minHeight: 600,
        display: 'flex', alignItems: 'center',
        overflow: 'hidden',
      }}>
        {/* Background Image */}
        {!imgError ? (
          <img
            src={FPT_HERO_IMAGE}
            alt="FPT University Campus"
            onError={() => setImgError(true)}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
            }}
          />
        ) : (
          /* Fallback gradient nếu ảnh không load được */
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(135deg, ${FPT_DARK} 0%, ${FPT_BLUE} 60%, #0d3b7a 100%)`,
          }} />
        )}

        {/* Dark overlay gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(10,34,64,0.85) 45%, rgba(10,34,64,0.3) 100%)',
        }} />

        {/* Decorative orange bar on left */}
        <div style={{
          position: 'absolute', left: 0, top: '20%', bottom: '20%',
          width: 5, background: FPT_ORANGE, borderRadius: '0 4px 4px 0',
        }} />

        {/* Hero Content */}
        <div style={{
          position: 'relative', zIndex: 2,
          maxWidth: 680, padding: '0 40px 0 56px',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.4)',
            borderRadius: 24, padding: '5px 14px', marginBottom: 24,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: FPT_ORANGE }} />
            <span style={{ color: '#FFA849', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em' }}>
              HỆ THỐNG QUẢN LÝ THỰC TẬP — FPT UNIVERSITY
            </span>
          </div>

          <h1 style={{
            color: '#ffffff', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 900, lineHeight: 1.15, margin: '0 0 16px 0',
            letterSpacing: '-0.01em',
          }}>
            Cầu nối vững chắc giữa{' '}
            <span style={{ color: FPT_ORANGE }}>Sinh viên</span> và{' '}
            <span style={{ color: '#FFC947' }}>Doanh nghiệp.</span>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.80)', fontSize: 17, lineHeight: 1.7,
            margin: '0 0 40px 0', maxWidth: 540,
          }}>
            UEIMS – Nền tảng quản lý thực tập OJT toàn diện của FPT University,
            kết nối hàng nghìn sinh viên với hơn 350 doanh nghiệp đối tác mỗi kỳ học.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: FPT_ORANGE, color: '#fff',
                border: 'none', borderRadius: 50, padding: '14px 30px',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.25s', boxShadow: '0 4px 20px rgba(255,107,0,0.4)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#e55a00';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = FPT_ORANGE;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>→</div>
              Khám phá hệ thống
            </button>

            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'rgba(255,255,255,0.1)', color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.4)',
                borderRadius: 50, padding: '14px 30px',
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.25s', backdropFilter: 'blur(4px)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            >
              Tìm hiểu thêm ↓
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: '0.1em',
          animation: 'bounce 2s infinite',
        }}>
          <span>SCROLL</span>
          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.3)' }} />
        </div>
      </section>

      {/* ── STATS BANNER ─────────────────────────────────────────────────── */}
      <section style={{
        background: FPT_DARK, padding: '40px 40px',
        display: 'flex', justifyContent: 'center',
        borderBottom: `3px solid ${FPT_ORANGE}`,
      }}>
        <div style={{
          maxWidth: 1100, width: '100%',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
        }}>
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ color: FPT_ORANGE, fontSize: 38, fontWeight: 900, lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES SECTION ─────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '90px 40px', background: '#f8f9fb' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span style={{
              background: `${FPT_ORANGE}15`, color: FPT_ORANGE,
              fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
              padding: '5px 14px', borderRadius: 20, textTransform: 'uppercase',
            }}>Tính năng nổi bật</span>
            <h2 style={{
              fontSize: 36, fontWeight: 900, color: FPT_DARK,
              margin: '16px 0 12px', letterSpacing: '-0.01em',
            }}>
              Quản lý thực tập <span style={{ color: FPT_ORANGE }}>toàn diện</span>
            </h2>
            <p style={{ color: '#6b7280', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>
              Từ phân bổ sinh viên đến chấm điểm cuối kỳ — mọi nghiệp vụ OJT được số hóa và theo dõi minh bạch.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
          }}>
            {features.map((f) => (
              <div key={f.title}
                style={{
                  background: '#fff', borderRadius: 16, padding: '32px 28px',
                  border: '1px solid #eaeaea',
                  transition: 'all 0.3s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  el.style.transform = 'translateY(-6px)';
                  el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.09)';
                  el.style.borderColor = FPT_ORANGE;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                  el.style.borderColor = '#eaeaea';
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `${FPT_ORANGE}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, marginBottom: 18,
                }}>{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: FPT_DARK, margin: '0 0 10px' }}>{f.title}</h3>
                <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(135deg, ${FPT_DARK} 0%, ${FPT_BLUE} 100%)`,
        padding: '80px 40px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 300, height: 300, borderRadius: '50%',
          border: `60px solid rgba(255,107,0,0.1)`,
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60,
          width: 220, height: 220, borderRadius: '50%',
          border: `40px solid rgba(255,255,255,0.05)`,
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{
            color: '#fff', fontSize: 34, fontWeight: 900,
            margin: '0 0 16px', letterSpacing: '-0.01em',
          }}>Sẵn sàng bắt đầu?</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, margin: '0 0 36px', lineHeight: 1.6 }}>
            Đăng nhập ngay để truy cập hệ thống quản lý thực tập và kết nối với doanh nghiệp đối tác của FPT University.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: FPT_ORANGE, color: '#fff', border: 'none',
              borderRadius: 50, padding: '15px 40px',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.25s', boxShadow: '0 4px 24px rgba(255,107,0,0.45)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#e55a00';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = FPT_ORANGE;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Đăng nhập vào UEIMS →
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{
        background: '#07192e', color: 'rgba(255,255,255,0.55)',
        padding: '40px 40px 24px', textAlign: 'center',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 6,
            background: FPT_ORANGE,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, color: '#fff', fontSize: 14,
          }}>U</div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>UEIMS — FPT University</span>
        </div>
        <p style={{ fontSize: 13, margin: '0 0 8px' }}>
          University-Enterprise Internship Management System
        </p>
        <p style={{ fontSize: 12, margin: 0 }}>
          © 2026 FPT University. All rights reserved.
        </p>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { opacity: 0.5; transform: translateX(-50%) translateY(0); }
          50% { opacity: 1; transform: translateX(-50%) translateY(6px); }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
};
