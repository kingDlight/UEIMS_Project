import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MenuOutlined,
  CloseOutlined,
  ArrowRightOutlined,
  TeamOutlined,
  ApartmentOutlined,
  FileProtectOutlined,
  AuditOutlined,
  ScheduleOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

// Fresh Modern Color Palette
const PRIMARY = '#3B82F6';
const SECONDARY = '#10B981';
const ACCENT = '#06B6D4';
const DARK = '#0F172A';
const DARK_BLUE = '#1E3A5F';
const LIGHT_BG = '#F8FAFC';
const GRAY = '#64748B';
const WHITE = '#FFFFFF';

const navLinks = [
  { label: 'Giới thiệu', href: '#about' },
  { label: 'Tính năng', href: '#features' },
  { label: 'Hướng dẫn', href: '#guide' },
  { label: 'Liên hệ', href: '#contact' },
];

const stats = [
  { value: '2,500+', label: 'Sinh viên thực tập', emoji: '🎓' },
  { value: '350+', label: 'Doanh nghiệp đối tác', emoji: '🏢' },
  { value: '95%', label: 'Tỷ lệ hài lòng', emoji: '⭐' },
  { value: '12+', label: 'Năm kinh nghiệm', emoji: '🏆' },
];

const features = [
  {
    icon: <AuditOutlined style={{ fontSize: 28, color: PRIMARY }} />,
    title: 'Quản lý Kỳ OJT',
    desc: 'Tạo và quản lý toàn bộ chu trình thực tập: từ phân bổ sinh viên, theo dõi tiến độ đến chấm điểm cuối kỳ.',
    color: PRIMARY,
  },
  {
    icon: <TeamOutlined style={{ fontSize: 28, color: SECONDARY }} />,
    title: 'Kết nối Doanh nghiệp',
    desc: 'Nền tảng kết nối trực tiếp giữa nhà trường và doanh nghiệp, đăng tin tuyển dụng và lọc ứng viên hiệu quả.',
    color: SECONDARY,
  },
  {
    icon: <FileProtectOutlined style={{ fontSize: 28, color: ACCENT }} />,
    title: 'Báo cáo & Đánh giá',
    desc: 'Sinh viên nộp báo cáo tuần, mentor đánh giá rubric, giảng viên chấm điểm — tất cả được số hóa và minh bạch.',
    color: ACCENT,
  },
  {
    icon: <ApartmentOutlined style={{ fontSize: 28, color: '#8B5CF6' }} />,
    title: 'Phân quyền đa cấp',
    desc: 'Hệ thống phân quyền chặt chẽ theo 6 vai trò: Admin, Training Manager, Enterprise, Mentor, Lecturer và Student.',
    color: '#8B5CF6',
  },
  {
    icon: <ScheduleOutlined style={{ fontSize: 28, color: '#F59E0B' }} />,
    title: 'Lịch Phỏng vấn',
    desc: 'Doanh nghiệp đặt lịch phỏng vấn trực tiếp, kiểm tra chồng lịch tự động và gửi thông báo tức thì.',
    color: '#F59E0B',
  },
  {
    icon: <BarChartOutlined style={{ fontSize: 28, color: '#EC4899' }} />,
    title: 'Thống kê Tổng quan',
    desc: 'Dashboard thời gian thực với biểu đồ thống kê số lượng sinh viên, điểm trung bình và tình trạng thực tập.',
    color: '#EC4899',
  },
];

// Animated Counter
const AnimatedCounter: React.FC<{ value: string; delay?: number }> = ({ value, delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      {value}
    </div>
  );
};

// Fade In Section
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      {children}
    </div>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setMenuOpen(false);
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      overflowX: 'hidden',
      background: LIGHT_BG,
    }}>
      
      {/* ============ BACKGROUND DECORATIONS ============ */}
      <div style={{
        position: 'fixed',
        width: 700,
        height: 700,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${PRIMARY}15 0%, transparent 70%)`,
        top: -300,
        right: -200,
        zIndex: 0,
        animation: 'float 12s ease-in-out infinite',
      }} />
      <div style={{
        position: 'fixed',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${SECONDARY}15 0%, transparent 70%)`,
        bottom: -200,
        left: -150,
        zIndex: 0,
        animation: 'float 15s ease-in-out infinite reverse',
      }} />

      {/* ============ NAVBAR ============ */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '0 60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 72,
        background: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: WHITE,
            fontSize: 20,
            boxShadow: `0 4px 14px ${PRIMARY}30`,
          }}>
            U
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, color: DARK }}>UEIMS</span>
        </div>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desktop-nav">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
              style={{
                color: scrolled ? DARK : WHITE,
                fontSize: 14,
                fontWeight: 500,
                padding: '8px 16px',
                borderRadius: 8,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = scrolled ? `${PRIMARY}10` : 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = PRIMARY;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = scrolled ? DARK : WHITE;
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/login')} style={{
            background: 'transparent',
            border: `2px solid ${scrolled ? '#E2E8F0' : 'rgba(255,255,255,0.3)'}`,
            color: scrolled ? DARK : WHITE,
            borderRadius: 25,
            padding: '10px 24px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = PRIMARY;
              e.currentTarget.style.color = PRIMARY;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = scrolled ? '#E2E8F0' : 'rgba(255,255,255,0.3)';
              e.currentTarget.style.color = scrolled ? DARK : WHITE;
            }}
          >
            Đăng nhập
          </button>
          <button onClick={() => navigate('/login')} style={{
            background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
            border: 'none',
            color: WHITE,
            borderRadius: 25,
            padding: '10px 24px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: `0 4px 14px ${PRIMARY}40`,
            transition: 'all 0.3s',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 6px 20px ${PRIMARY}50`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 14px ${PRIMARY}40`;
            }}
          >
            Vào hệ thống <ArrowRightOutlined />
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn" style={{
            background: 'none',
            border: 'none',
            color: scrolled ? DARK : WHITE,
            cursor: 'pointer',
            fontSize: 24,
            padding: 8,
          }}>
            {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>
      </nav>

      {/* ============ HERO SECTION ============ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '120px 60px 80px',
        background: `linear-gradient(135deg, ${DARK} 0%, ${DARK_BLUE} 50%, #2D4A6F 100%)`,
        overflow: 'hidden',
      }}>
        {/* Decorative shapes */}
        <div style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${PRIMARY}30 0%, transparent 70%)`,
          top: '10%',
          right: '10%',
          animation: 'float 10s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${SECONDARY}20 0%, transparent 70%)`,
          bottom: '10%',
          left: '5%',
          animation: 'float 12s ease-in-out infinite reverse',
        }} />
        
        {/* Floating shapes */}
        <div style={{
          position: 'absolute',
          width: 100,
          height: 100,
          borderRadius: 24,
          border: `2px solid ${PRIMARY}40`,
          top: '20%',
          left: '15%',
          transform: 'rotate(15deg)',
          animation: 'float 9s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          width: 60,
          height: 60,
          borderRadius: 16,
          background: `${SECONDARY}30`,
          bottom: '25%',
          right: '20%',
          animation: 'float 11s ease-in-out infinite reverse',
        }} />

        <div style={{ maxWidth: 1200, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <FadeIn delay={200}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 50,
              padding: '8px 20px',
              marginBottom: 24,
            }}>
              <span style={{ fontSize: 16 }}>🎓</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: 13 }}>
                University-Enterprise Internship Management
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={400}>
            <h1 style={{
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 800,
              color: WHITE,
              margin: '0 0 24px',
              lineHeight: 1.1,
              letterSpacing: '-2px',
            }}>
              Kết nối <span style={{ color: PRIMARY }}>Nhà trường</span>
              <br />
              với <span style={{ color: SECONDARY }}>Doanh nghiệp</span>
            </h1>
          </FadeIn>

          <FadeIn delay={600}>
            <p style={{
              fontSize: 20,
              color: 'rgba(255, 255, 255, 0.6)',
              maxWidth: 650,
              margin: '0 auto 40px',
              lineHeight: 1.7,
            }}>
              UEIMS — Nền tảng số hóa toàn bộ quy trình thực tập doanh nghiệp, từ
              quản lý kỳ OJT, kết nối tuyển dụng đến đánh giá rubric minh bạch.
            </p>
          </FadeIn>

          <FadeIn delay={800}>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/login')} style={{
                background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
                border: 'none',
                color: WHITE,
                borderRadius: 30,
                padding: '16px 36px',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: `0 8px 25px ${PRIMARY}40`,
                transition: 'all 0.3s',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 12px 35px ${PRIMARY}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = `0 8px 25px ${PRIMARY}40`;
                }}
              >
                Bắt đầu ngay <ArrowRightOutlined />
              </button>
              <button onClick={() => scrollToSection('#features')} style={{
                background: 'transparent',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                color: WHITE,
                borderRadius: 30,
                padding: '16px 36px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = WHITE;
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Khám phá tính năng
              </button>
            </div>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={1000}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 32,
              marginTop: 80,
              paddingTop: 40,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }} className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: PRIMARY, marginBottom: 8 }}>
                    <AnimatedCounter value={stat.value} delay={1000 + index * 150} />
                  </div>
                  <div style={{ fontSize: 16 }}>
                    <span style={{ fontSize: 24, marginRight: 8 }}>{stat.emoji}</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section id="features" style={{ padding: '100px 60px', background: WHITE }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <span style={{
                color: PRIMARY,
                fontWeight: 700,
                fontSize: 14,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                Tính năng
              </span>
              <h2 style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 800,
                color: DARK,
                margin: '12px 0 16px',
              }}>
                Giải pháp toàn diện cho OJT
              </h2>
              <p style={{ color: GRAY, fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
                Tất cả những gì bạn cần để quản lý kỳ thực tập doanh nghiệp một cách hiệu quả
              </p>
            </div>
          </FadeIn>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 28,
          }} className="features-grid">
            {features.map((feature, index) => (
              <FadeIn key={index} delay={index * 100}>
                <div style={{
                  background: LIGHT_BG,
                  borderRadius: 20,
                  padding: 32,
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.4s',
                  cursor: 'default',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.borderColor = feature.color;
                    e.currentTarget.style.boxShadow = `0 20px 40px ${feature.color}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: `${feature.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: DARK, margin: '0 0 12px' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: GRAY, fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                    {feature.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section style={{
        padding: '100px 60px',
        background: `linear-gradient(135deg, ${DARK} 0%, ${DARK_BLUE} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${PRIMARY}25 0%, transparent 70%)`,
          top: -200,
          left: '50%',
          transform: 'translateX(-50%)',
        }} />

        <FadeIn>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 800,
              color: WHITE,
              margin: '0 0 20px',
            }}>
              Sẵn sàng nâng cấp
              <br />
              <span style={{ color: PRIMARY }}>Quy trình thực tập</span> của bạn?
            </h2>
            <p style={{
              fontSize: 18,
              color: 'rgba(255, 255, 255, 0.6)',
              margin: '0 0 40px',
              lineHeight: 1.7,
            }}>
              Tham gia cùng hàng trăm doanh nghiệp và hàng nghìn sinh viên đang sử dụng UEIMS
              để quản lý kỳ thực tập doanh nghiệp hiệu quả hơn.
            </p>
            <button onClick={() => navigate('/login')} style={{
              background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
              border: 'none',
              color: WHITE,
              borderRadius: 30,
              padding: '18px 48px',
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: `0 8px 30px ${PRIMARY}50`,
              transition: 'all 0.3s',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
                e.currentTarget.style.boxShadow = `0 12px 40px ${PRIMARY}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = `0 8px 30px ${PRIMARY}50`;
              }}
            >
              Đăng nhập ngay <ArrowRightOutlined />
            </button>
          </div>
        </FadeIn>
      </section>

      {/* ============ FOOTER ============ */}
      <footer id="contact" style={{ background: DARK, padding: '60px 60px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: 48,
            marginBottom: 48,
          }} className="footer-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  color: WHITE,
                  fontSize: 20,
                }}>
                  U
                </div>
                <span style={{ color: WHITE, fontWeight: 800, fontSize: 20 }}>UEIMS</span>
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                University-Enterprise Internship Management System. Nền tảng quản lý thực tập doanh nghiệp hàng đầu tại Việt Nam.
              </p>
            </div>

            {['Về UEIMS', 'Hỗ trợ', 'Kết nối'].map((title, i) => (
              <div key={i}>
                <h4 style={{ color: WHITE, fontWeight: 700, marginBottom: 20 }}>{title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Giới thiệu', 'Tính năng', 'Đội ngũ', 'Liên hệ'].map((item) => (
                    <a key={item} href="#" style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      textDecoration: 'none',
                      fontSize: 14,
                      transition: 'color 0.2s',
                    }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 13 }}>
              © 2026 UEIMS - FPT University. All rights reserved.
            </span>
            <span style={{ color: PRIMARY, fontSize: 13, fontWeight: 600 }}>
              Nhóm 7 - SE20A05
            </span>
          </div>
        </div>
      </footer>

      {/* ============ STYLES ============ */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        
        .desktop-nav { display: flex !important; }
        .mobile-menu-btn { display: none !important; }
        
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .footer-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        
        @media (max-width: 640px) {
          .stats-grid, .features-grid, .footer-grid { grid-template-columns: 1fr !important; }
        }
        
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: ${PRIMARY}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${SECONDARY}; }
        
        ::selection { background: ${PRIMARY}30; }
      `}</style>
    </div>
  );
};
