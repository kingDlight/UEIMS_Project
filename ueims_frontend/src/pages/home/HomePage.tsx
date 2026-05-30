import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MenuOutlined,
  CloseOutlined,
  DownOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  ApartmentOutlined,
  FileProtectOutlined,
  AuditOutlined,
  ScheduleOutlined,
  BarChartOutlined,
  ContactsOutlined,
  SolutionOutlined,
  DashboardOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';

// FPT Brand Colors - Primary Orange E67E22
const FPT_ORANGE = '#E67E22';
const FPT_DARK = '#1A1A2E';
const FPT_NAVY = '#16213E';
const FPT_LIGHT = '#F8F9FA';
const FPT_GRAY = '#6C757D';
const FPT_GRADIENT_START = '#E67E22';
const FPT_GRADIENT_END = '#D35400';

const navLinks = [
  {
    label: 'Giới thiệu',
    children: [
      { label: 'Về UEIMS', href: '#about' },
      { label: 'Mục tiêu hệ thống', href: '#goals' },
      { label: 'Đội ngũ phát triển', href: '#team' },
    ],
  },
  {
    label: 'Tính năng',
    children: [
      { label: 'Quản lý Kỳ OJT', href: '#features' },
      { label: 'Tuyển dụng DN', href: '#recruitment' },
      { label: 'Báo cáo & Đánh giá', href: '#reports' },
    ],
  },
  {
    label: 'Hướng dẫn',
    children: [
      { label: 'Cho Sinh viên', href: '#guide-student' },
      { label: 'Cho Doanh nghiệp', href: '#guide-enterprise' },
    ],
  },
  { label: 'Liên hệ', href: '#contact' },
];

const stats = [
  { value: '2,500+', label: 'Sinh viên thực tập', icon: <TeamOutlined /> },
  { value: '350+', label: 'Doanh nghiệp đối tác', icon: <ApartmentOutlined /> },
  { value: '95%', label: 'Tỷ lệ hài lòng', icon: <CheckCircleOutlined /> },
  { value: '12+', label: 'Năm kinh nghiệm', icon: <SafetyCertificateOutlined /> },
];

const features = [
  {
    icon: <DashboardOutlined />,
    title: 'Quản lý Kỳ OJT',
    desc: 'Tạo và quản lý toàn bộ chu trình thực tập: từ phân bổ sinh viên, theo dõi tiến độ đến chấm điểm cuối kỳ.',
    color: FPT_ORANGE,
  },
  {
    icon: <SolutionOutlined />,
    title: 'Kết nối Doanh nghiệp',
    desc: 'Nền tảng kết nối trực tiếp giữa nhà trường và doanh nghiệp, đăng tin tuyển dụng và lọc ứng viên hiệu quả.',
    color: '#3498DB',
  },
  {
    icon: <FileProtectOutlined />,
    title: 'Báo cáo & Đánh giá',
    desc: 'Sinh viên nộp báo cáo tuần, mentor đánh giá rubric, giảng viên chấm điểm — tất cả được số hóa và minh bạch.',
    color: '#27AE60',
  },
  {
    icon: <AuditOutlined />,
    title: 'Phân quyền đa cấp',
    desc: 'Hệ thống phân quyền chặt chẽ theo 6 vai trò: Admin, Training Manager, Enterprise, Mentor, Lecturer và Student.',
    color: '#9B59B6',
  },
  {
    icon: <ScheduleOutlined />,
    title: 'Lịch Phỏng vấn',
    desc: 'Doanh nghiệp đặt lịch phỏng vấn trực tiếp, kiểm tra chồng lịch tự động và gửi thông báo tức thì.',
    color: '#E74C3C',
  },
  {
    icon: <BarChartOutlined />,
    title: 'Thống kê Tổng quan',
    desc: 'Dashboard thời gian thực với biểu đồ thống kê số lượng sinh viên, điểm trung bình và tình trạng thực tập.',
    color: '#1ABC9C',
  },
];

const workflowSteps = [
  { num: '01', title: 'Setup', desc: 'TM tạo kỳ OJT, import danh sách sinh viên, duyệt doanh nghiệp' },
  { num: '02', title: 'Recruitment', desc: 'Doanh nghiệp đăng tin, sinh viên ứng tuyển, phỏng vấn và chọn lọc' },
  { num: '03', title: 'Training', desc: 'Phân công mentor, tạo kế hoạch đào tạo, theo dõi báo cáo tuần' },
  { num: '04', title: 'Evaluation', desc: 'Mentor đánh giá rubric, giảng viên chấm điểm, xuất báo cáo' },
];

// Animated Counter Component
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
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {value}
    </div>
  );
};

// Fade In Section Component
const FadeInSection: React.FC<{
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, direction = 'up', className, style }) => {
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
      { threshold: 0.15 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  const getTransform = () => {
    if (!visible) {
      if (direction === 'left') return 'translateX(-60px)';
      if (direction === 'right') return 'translateX(60px)';
      return 'translateY(50px)';
    }
    return 'translate(0)';
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: getTransform(),
        transition: 'all 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
        ...style,
      }}
    >
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
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflowX: 'hidden',
        background: FPT_LIGHT,
      }}
    >
      {/* ============ NAVBAR ============ */}
      <nav
        style={{
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
          background: scrolled ? 'rgba(26, 26, 46, 0.97)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          borderBottom: scrolled ? '1px solid rgba(230, 126, 34, 0.15)' : 'none',
        }}
      >
        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${FPT_GRADIENT_START}, ${FPT_GRADIENT_END})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#fff',
              fontSize: 20,
              boxShadow: '0 4px 15px rgba(230, 126, 34, 0.35)',
            }}
          >
            U
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, lineHeight: 1.1, letterSpacing: '-0.5px' }}>
              UEIMS
            </div>
            <div
              style={{
                color: FPT_ORANGE,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              FPT University
            </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label} className="nav-dropdown">
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    padding: '10px 16px',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(230, 126, 34, 0.15)';
                    e.currentTarget.style.color = FPT_ORANGE;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = '#fff';
                  }}
                >
                  {link.label} <DownOutlined style={{ fontSize: 10 }} />
                </button>
                <div className="dropdown-content">
                  {link.children.map((child) => (
                    <a
                      key={child.label}
                      href={child.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(child.href);
                      }}
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href!);
                }}
                style={{
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 500,
                  padding: '10px 16px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(230, 126, 34, 0.15)';
                  e.currentTarget.style.color = FPT_ORANGE;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#fff';
                }}
              >
                {link.label}
              </a>
            )
          )}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'transparent',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: '#fff',
              borderRadius: 25,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = FPT_ORANGE;
              e.currentTarget.style.color = FPT_ORANGE;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.color = '#fff';
            }}
          >
            Đăng nhập
          </button>

          <button
            onClick={() => navigate('/login')}
            style={{
              background: `linear-gradient(135deg, ${FPT_GRADIENT_START}, ${FPT_GRADIENT_END})`,
              border: 'none',
              color: '#fff',
              borderRadius: 25,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 15px rgba(230, 126, 34, 0.4)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(230, 126, 34, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(230, 126, 34, 0.4)';
            }}
          >
            Vào hệ thống <ArrowRightOutlined />
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 22,
              padding: 8,
            }}
            className="mobile-menu-btn"
          >
            {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>
      </nav>

      {/* ============ HERO SECTION ============ */}
      <section
        style={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${FPT_DARK} 0%, ${FPT_NAVY} 50%, #0D1B2A 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '120px 60px 80px',
        }}
      >
        {/* Animated Background Orbs */}
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(230, 126, 34, 0.15) 0%, transparent 70%)`,
            top: -200,
            right: -100,
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(230, 126, 34, 0.1) 0%, transparent 70%)`,
            bottom: -100,
            left: -100,
            animation: 'float 10s ease-in-out infinite reverse',
          }}
        />

        <div style={{ maxWidth: 1200, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <FadeInSection delay={200}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(230, 126, 34, 0.15)',
                border: '1px solid rgba(230, 126, 34, 0.3)',
                borderRadius: 50,
                padding: '8px 20px',
                marginBottom: 24,
              }}
            >
              <ContactsOutlined style={{ color: FPT_ORANGE }} />
              <span style={{ color: FPT_ORANGE, fontWeight: 600, fontSize: 13 }}>
                Hệ thống Quản lý Thực tập Doanh nghiệp
              </span>
            </div>
          </FadeInSection>

          <FadeInSection delay={400}>
            <h1
              style={{
                fontSize: 'clamp(42px, 6vw, 72px)',
                fontWeight: 800,
                color: '#fff',
                margin: '0 0 24px',
                lineHeight: 1.1,
                letterSpacing: '-2px',
              }}
            >
              Kết nối <span style={{ color: FPT_ORANGE }}>Nhà trường</span>
              <br />
              với <span style={{ color: FPT_ORANGE }}>Doanh nghiệp</span>
            </h1>
          </FadeInSection>

          <FadeInSection delay={600}>
            <p
              style={{
                fontSize: 20,
                color: 'rgba(255, 255, 255, 0.7)',
                maxWidth: 700,
                margin: '0 auto 40px',
                lineHeight: 1.7,
              }}
            >
              UEIMS — Nền tảng số hóa toàn bộ quy trình thực tập doanh nghiệp, từ
              quản lý kỳ OJT, kết nối tuyển dụng đến đánh giá rubric minh bạch.
            </p>
          </FadeInSection>

          <FadeInSection delay={800}>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: `linear-gradient(135deg, ${FPT_GRADIENT_START}, ${FPT_GRADIENT_END})`,
                  border: 'none',
                  color: '#fff',
                  borderRadius: 30,
                  padding: '16px 36px',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 8px 25px rgba(230, 126, 34, 0.4)',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(230, 126, 34, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(230, 126, 34, 0.4)';
                }}
              >
                Bắt đầu ngay <ArrowRightOutlined />
              </button>

              <button
                onClick={() => scrollToSection('#features')}
                style={{
                  background: 'transparent',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: '#fff',
                  borderRadius: 30,
                  padding: '16px 36px',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#fff';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Khám phá tính năng
              </button>
            </div>
          </FadeInSection>

          {/* Stats */}
          <FadeInSection delay={1000}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 32,
                marginTop: 80,
                paddingTop: 40,
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              className="stats-grid"
            >
              {stats.map((stat, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: 'clamp(36px, 4vw, 48px)',
                      fontWeight: 800,
                      color: FPT_ORANGE,
                      marginBottom: 8,
                    }}
                  >
                    <AnimatedCounter value={stat.value} delay={1000 + index * 150} />
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, fontWeight: 500 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ============ WORKFLOW SECTION ============ */}
      <section id="about" style={{ padding: '100px 60px', background: '#fff' }}>
        <FadeInSection>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span
              style={{
                color: FPT_ORANGE,
                fontWeight: 700,
                fontSize: 14,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
              }}
            >
              Quy trình
            </span>
            <h2
              style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 800,
                color: FPT_DARK,
                margin: '12px 0 16px',
              }}
            >
              4 Giai đoạn của Kỳ Thực tập
            </h2>
            <p style={{ color: FPT_GRAY, fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
              Từ Setup đến Evaluation, UEIMS đồng hành cùng toàn bộ chu trình OJT
            </p>
          </div>
        </FadeInSection>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
            maxWidth: 1200,
            margin: '0 auto',
          }}
          className="workflow-grid"
        >
          {workflowSteps.map((step, index) => (
            <FadeInSection key={index} delay={index * 150}>
              <div
                style={{
                  background: `linear-gradient(135deg, ${FPT_DARK}, ${FPT_NAVY})`,
                  borderRadius: 20,
                  padding: 32,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(26, 26, 46, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    fontSize: 100,
                    fontWeight: 900,
                    color: 'rgba(230, 126, 34, 0.08)',
                    lineHeight: 1,
                  }}
                >
                  {step.num}
                </div>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${FPT_GRADIENT_START}, ${FPT_GRADIENT_END})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    fontWeight: 800,
                    color: '#fff',
                    marginBottom: 20,
                    boxShadow: '0 4px 15px rgba(230, 126, 34, 0.3)',
                  }}
                >
                  {step.num}
                </div>
                <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>
                  {step.title}
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section
        id="features"
        style={{
          padding: '100px 60px',
          background: `linear-gradient(180deg, ${FPT_LIGHT} 0%, #fff 100%)`,
        }}
      >
        <FadeInSection>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span
              style={{
                color: FPT_ORANGE,
                fontWeight: 700,
                fontSize: 14,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
              }}
            >
              Tính năng
            </span>
            <h2
              style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 800,
                color: FPT_DARK,
                margin: '12px 0 16px',
              }}
            >
              Giải pháp toàn diện cho OJT
            </h2>
            <p style={{ color: FPT_GRAY, fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
              Tất cả những gì bạn cần để quản lý kỳ thực tập doanh nghiệp một cách hiệu quả
            </p>
          </div>
        </FadeInSection>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 28,
            maxWidth: 1200,
            margin: '0 auto',
          }}
          className="features-grid"
        >
          {features.map((feature, index) => (
            <FadeInSection key={index} delay={index * 100}>
              <div
                style={{
                  background: '#fff',
                  borderRadius: 20,
                  padding: 32,
                  height: '100%',
                  border: '1px solid #eee',
                  transition: 'all 0.4s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = feature.color;
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#eee';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: `${feature.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    color: feature.color,
                    marginBottom: 20,
                  }}
                >
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: FPT_DARK, margin: '0 0 12px' }}>
                  {feature.title}
                </h3>
                <p style={{ color: FPT_GRAY, fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                  {feature.desc}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section
        style={{
          padding: '100px 60px',
          background: `linear-gradient(135deg, ${FPT_DARK} 0%, ${FPT_NAVY} 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(230, 126, 34, 0.2) 0%, transparent 70%)`,
            top: -200,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />

        <FadeInSection>
          <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <h2
              style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 800,
                color: '#fff',
                margin: '0 0 20px',
              }}
            >
              Sẵn sàng nâng cấp
              <br />
              <span style={{ color: FPT_ORANGE }}>Quy trình thực tập</span> của bạn?
            </h2>
            <p
              style={{
                fontSize: 18,
                color: 'rgba(255, 255, 255, 0.7)',
                margin: '0 0 40px',
                lineHeight: 1.7,
              }}
            >
              Tham gia cùng hàng trăm doanh nghiệp và hàng nghìn sinh viên đang sử dụng UEIMS
              để quản lý kỳ thực tập doanh nghiệp hiệu quả hơn.
            </p>

            <button
              onClick={() => navigate('/login')}
              style={{
                background: `linear-gradient(135deg, ${FPT_GRADIENT_START}, ${FPT_GRADIENT_END})`,
                border: 'none',
                color: '#fff',
                borderRadius: 30,
                padding: '18px 48px',
                fontSize: 18,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 8px 30px rgba(230, 126, 34, 0.5)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(230, 126, 34, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(230, 126, 34, 0.5)';
              }}
            >
              Đăng nhập ngay <ArrowRightOutlined />
            </button>
          </div>
        </FadeInSection>
      </section>

      {/* ============ FOOTER ============ */}
      <footer id="contact" style={{ background: '#0D1117', padding: '60px 60px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: 48,
              marginBottom: 48,
            }}
            className="footer-grid"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${FPT_GRADIENT_START}, ${FPT_GRADIENT_END})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: '#fff',
                    fontSize: 20,
                  }}
                >
                  U
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>UEIMS</div>
                  <div style={{ color: FPT_ORANGE, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em' }}>
                    FPT UNIVERSITY
                  </div>
                </div>
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                University-Enterprise Internship Management System. Nền tảng quản lý thực tập
                doanh nghiệp hàng đầu tại Việt Nam.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 20 }}>Về UEIMS</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Giới thiệu', 'Tính năng', 'Đội ngũ', 'Liên hệ'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      textDecoration: 'none',
                      fontSize: 14,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = FPT_ORANGE)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 20 }}>Hỗ trợ</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Tài liệu', 'Hướng dẫn', 'FAQ', 'Báo lỗi'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      textDecoration: 'none',
                      fontSize: 14,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = FPT_ORANGE)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 20 }}>Kết nối</h4>
              <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 14, margin: '0 0 16px' }}>
                Theo dõi chúng tôi để cập nhật tin tức mới nhất.
              </p>
              <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 14 }}>
                Email: support@ueims.edu.vn
                <br />
                Tel: (028) 1234 5678
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 13 }}>
              © 2026 UEIMS - FPT University. All rights reserved.
            </span>
            <span style={{ color: FPT_ORANGE, fontSize: 13, fontWeight: 600 }}>
              Nhóm 7 - SE20A05
            </span>
          </div>
        </div>
      </footer>

      {/* Global Styles */}
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
          .workflow-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .footer-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        
        @media (max-width: 640px) {
          .stats-grid, .workflow-grid, .features-grid, .footer-grid { 
            grid-template-columns: 1fr !important; 
          }
        }
        
        .nav-dropdown {
          position: relative;
        }
        
        .dropdown-content {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          background: #fff;
          min-width: 220px;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          padding: 8px;
          z-index: 100;
        }
        
        .nav-dropdown:hover .dropdown-content {
          display: block;
        }
        
        .dropdown-content a {
          display: block;
          padding: 12px 16px;
          color: ${FPT_DARK};
          text-decoration: none;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .dropdown-content a:hover {
          background: rgba(230, 126, 34, 0.1);
          color: ${FPT_ORANGE};
        }
        
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { 
          background: ${FPT_ORANGE}; 
          border-radius: 4px; 
        }
        ::-webkit-scrollbar-thumb:hover { background: #d35400; }
      `}</style>
    </div>
  );
};
