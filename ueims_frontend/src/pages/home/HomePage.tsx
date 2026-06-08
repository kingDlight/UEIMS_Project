import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  Calendar,
  BarChart3,
  ArrowRight,
  Menu,
  X,
  FileCheck2,
  Sun,
  Moon,
} from 'lucide-react';

const navLinks = [
  { label: 'Giới thiệu', href: '#about' },
  { label: 'Tính năng', href: '#features' },
  { label: 'Quy trình OJT', href: '#process' },
  { label: 'Doanh nghiệp', href: '#partner' },
];

const stats = [
  { value: '3,200+', label: 'Sinh viên thực tập' },
  { value: '450+', label: 'Doanh nghiệp liên kết' },
  { value: '98.5%', label: 'Tỷ lệ hoàn thành OJT' },
  { value: '96.2%', label: 'Đánh giá hài lòng' },
];

const features = [
  {
    icon: GraduationCap,
    title: 'Quản lý Kỳ OJT Linh hoạt',
    desc: 'Tự động tạo kỳ thực tập, thiết lập tiêu chí đánh giá, kết quả đầu ra và điều hành toàn bộ tiến độ sinh viên một cách có hệ thống.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: Building2,
    title: 'Hợp tác Doanh nghiệp 3.0',
    desc: 'Nhà tuyển dụng trực tiếp phê duyệt hồ sơ, đăng tin tuyển dụng, và phản hồi chất lượng đào tạo chỉ trên một cổng duy nhất.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: FileCheck2,
    title: 'Báo cáo & Đánh giá Rubric',
    desc: 'Sinh viên báo cáo hàng tuần và được Mentor doanh nghiệp, Giảng viên chấm điểm bằng thang đo Rubric chuẩn hóa, minh bạch.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: ShieldCheck,
    title: 'Phân quyền Role-based (RBAC)',
    desc: 'Bảo mật thông tin tối đa với cơ chế phân quyền chi tiết cho 6 đối tượng: Admin, Training Manager, Enterprise, Mentor, Lecturer, Student.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Calendar,
    title: 'Đặt lịch Phỏng vấn Tự động',
    desc: 'Hệ thống tự động phát hiện trùng lịch, sắp xếp phòng phỏng vấn trực tiếp giữa Doanh nghiệp và Sinh viên, gửi email nhắc lịch tức thì.',
    color: 'from-rose-500 to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Thống kê Realtime',
    desc: 'Trực quan hóa dữ liệu OJT với biểu đồ trực tuyến về tình trạng sinh viên, đánh giá kỹ năng mềm và phân bổ địa điểm thực tập.',
    color: 'from-violet-500 to-fuchsia-500',
  },
];

const steps = [
  {
    num: '01',
    title: 'Chuẩn bị OJT',
    desc: 'Nhà trường mở kỳ OJT mới, import thông tin sinh viên đủ điều kiện và thiết lập các tiêu chí chuẩn hóa.',
  },
  {
    num: '02',
    title: 'Tuyển dụng & Phỏng vấn',
    desc: 'Doanh nghiệp đăng tin tuyển dụng. Sinh viên nộp CV trực tuyến và đặt lịch phỏng vấn thông qua hệ thống.',
  },
  {
    num: '03',
    title: 'Thực tập & Báo cáo',
    desc: 'Sinh viên làm việc tại doanh nghiệp, gửi báo cáo tuần. Mentor doanh nghiệp theo dõi, hướng dẫn và ký duyệt.',
  },
  {
    num: '04',
    title: 'Đánh giá & Tổng kết',
    desc: 'Doanh nghiệp chấm điểm đánh giá. Giảng viên chấm báo cáo cuối kỳ. Hệ thống tổng hợp điểm số và xuất file Excel.',
  },
];

// Helper components extracted to reduce complexity

const BackgroundEffects = ({ isDark }: { isDark: boolean }) => (
  <>
    <div className={`fixed -top-40 -right-40 w-[500px] h-[500px] blur-[100px] pointer-events-none z-0 animate-drift ${
      isDark ? 'bg-[#f37021]/10 rounded-full' : 'bg-[#f37021]/15 animate-morph'
    }`} style={{ willChange: 'transform' }}></div>
    <div className={`fixed top-[35%] -left-40 w-[450px] h-[450px] blur-[90px] pointer-events-none z-0 animate-drift-alt ${
      isDark ? 'rounded-full' : 'animate-morph'
    }`} style={{ background: '#00aeff21', willChange: 'transform', animationDelay: '5s' }}></div>

    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <svg width="100%" height="100%" className={`absolute inset-0 transition-opacity duration-300 ${
        isDark ? 'opacity-[0.04]' : 'opacity-[0.18]'
      }`}>
        <defs>
          <pattern id="hp-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="#f37021" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hp-dots)" />
      </svg>
      <div className={`absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full border-[1.5px] pointer-events-none animate-rotate-slow ${
        isDark ? 'border-[#f37021]/8' : 'border-[#f37021]/20'
      }`} style={{ willChange: 'transform' }}></div>
      <div className={`absolute -top-20 -left-20 w-[380px] h-[380px] rounded-full border pointer-events-none animate-rotate-slow-reverse ${
        isDark ? 'border-blue-500/6' : 'border-blue-400/18'
      }`} style={{ willChange: 'transform', animationDelay: '4s' }}></div>
      <div className={`absolute -bottom-28 -right-28 w-[500px] h-[500px] rounded-full border-[1.5px] pointer-events-none animate-rotate-slow-reverse ${
        isDark ? 'border-purple-500/6' : 'border-orange-400/15'
      }`} style={{ willChange: 'transform', animationDelay: '8s' }}></div>
    </div>
  </>
);

const NavBar = ({ isDark, toggleTheme, scrolled, scrollToSection }: { isDark: boolean, toggleTheme: () => void, scrolled: boolean, scrollToSection: (h: string) => void }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const navBgClass = scrolled 
    ? (isDark ? 'h-16 bg-[#0b0f19]/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg' : 'h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-md')
    : 'h-20 bg-transparent';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 md:px-12 flex items-center justify-between ${navBgClass}`}>
      <div 
        className="flex items-center gap-3 cursor-pointer" 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      >
        <img src="/src/assets/logo_ueims.png" alt="UEIMS Logo" style={{ height: '36px', objectFit: 'contain' }} />
        <span className={`font-bold text-lg tracking-wide transition-colors duration-300 ease-in-out ${isDark ? 'text-white' : 'text-slate-900'}`}>UEIMS</span>
      </div>

      <div className="hidden md:flex items-center gap-1.5">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
            className={`text-xs font-medium px-3.5 py-2 rounded-lg transition-all duration-300 ease-in-out ${
              isDark ? 'text-zinc-300 hover:text-white hover:bg-zinc-800/40' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            {link.label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 ease-in-out bg-transparent shrink-0 ${
            isDark ? 'border-zinc-500 text-amber-400 hover:text-amber-300 hover:border-amber-400/50 hover:bg-zinc-800/40' : 'border-slate-400 text-slate-700 hover:text-slate-950 hover:border-slate-500 hover:bg-slate-100'
          }`}
          title={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
        >
          {isDark ? <Sun className="h-4 w-4 relative" /> : <Moon className="h-4 w-4 relative" />}
        </button>

        <button
          onClick={() => navigate('/login')}
          className={`text-xs font-semibold bg-transparent px-4 py-2 border rounded-lg transition-all duration-300 ease-in-out ${
            isDark ? 'text-zinc-100 border-zinc-500 hover:text-white hover:border-[#f37021] hover:bg-[#f37021]/5' : 'text-slate-800 border-slate-400 hover:text-[#f37021] hover:border-[#f37021] hover:bg-[#f37021]/5'
          }`}
        >
          Đăng nhập
        </button>
        <button
          onClick={() => navigate('/login')}
          className="hidden sm:flex text-xs font-bold text-white px-4 py-2 rounded-lg bg-gradient-to-r from-[#f37021] to-[#e26215] shadow-lg shadow-[#f37021]/20 hover:shadow-[#f37021]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-in-out gap-1.5 items-center"
        >
          Vào hệ thống
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
        
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className={`md:hidden p-1 bg-transparent transition-colors duration-300 ease-in-out ${
            isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className={`absolute top-16 left-0 right-0 p-6 flex flex-col gap-4 md:hidden shadow-xl animate-fade-in border-b transition-colors duration-300 ease-in-out ${
          isDark ? 'bg-[#0f1422] border-zinc-800/80' : 'bg-white border-slate-200'
        }`}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href);
                setMenuOpen(false);
              }}
              className={`text-sm font-medium py-1 transition-colors duration-300 ease-in-out ${
                isDark ? 'text-zinc-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-bold text-white px-4 py-2.5 rounded-lg bg-[#f37021] flex justify-center items-center gap-1.5 shadow-md shadow-[#f37021]/15 mt-2"
          >
            Vào hệ thống
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </nav>
  );
};

const FloatingShapes = ({ isDark }: { isDark: boolean }) => (
  <>
    <div className="absolute top-[20%] left-[8%] w-12 h-12 rounded-full animate-float pointer-events-none z-0" 
         style={{ border: isDark ? '1px solid rgba(243, 112, 33, 0.18)' : '1px solid rgba(243, 112, 33, 0.35)', willChange: 'transform' }}></div>
    <div className="absolute bottom-[15%] right-[8%] w-16 h-16 rounded-xl rotate-45 animate-float pointer-events-none z-0" 
         style={{ border: isDark ? '1px solid rgba(59, 130, 246, 0.18)' : '1px solid rgba(96, 165, 250, 0.40)', animationDelay: '1.5s', animationDuration: '8s', willChange: 'transform' }}></div>
    <div className={`absolute top-[35%] right-[12%] w-8 h-8 rounded-full animate-float pointer-events-none z-0 ${
      isDark ? 'bg-amber-500/6' : 'bg-orange-400/20'
    }`} style={{ animationDelay: '3s', animationDuration: '7s', willChange: 'transform' }}></div>
    <div className="absolute bottom-[30%] left-[12%] w-20 h-20 rounded-full animate-float pointer-events-none z-0" 
         style={{ border: isDark ? '1px solid rgba(113, 113, 122, 0.12)' : '1px solid rgba(148, 163, 184, 0.25)', animationDelay: '4.5s', animationDuration: '9s', willChange: 'transform' }}></div>
    
    <div className={`absolute top-[55%] left-[5%] w-5 h-5 rounded-full animate-particle pointer-events-none z-0 ${
      isDark ? 'bg-[#f37021]/20' : 'bg-[#f37021]/40'
    }`} style={{ animationDelay: '0.5s', willChange: 'transform' }}></div>
    <div className={`absolute top-[18%] right-[22%] w-3 h-3 rounded-full animate-particle pointer-events-none z-0 ${
      isDark ? 'bg-blue-400/25' : 'bg-blue-500/50'
    }`} style={{ animationDelay: '2s', willChange: 'transform' }}></div>
    <div className={`absolute bottom-[20%] right-[30%] w-4 h-4 rounded-full animate-particle pointer-events-none z-0 ${
      isDark ? 'bg-amber-400/18' : 'bg-amber-500/40'
    }`} style={{ animationDelay: '3.5s', willChange: 'transform' }}></div>
    <div className={`absolute top-[42%] left-[30%] w-2.5 h-2.5 rounded-full animate-particle pointer-events-none z-0 ${
      isDark ? 'bg-purple-400/20' : 'bg-purple-500/45'
    }`} style={{ animationDelay: '5s', willChange: 'transform' }}></div>
    
    <div className="absolute top-[10%] left-[35%] w-6 h-6 rotate-45 animate-rotate-slow pointer-events-none z-0" 
         style={{ border: isDark ? '1px solid rgba(243, 112, 33, 0.3)' : '1px solid rgba(243, 112, 33, 0.6)', willChange: 'transform' }}></div>
    <div className="absolute bottom-[8%] right-[18%] w-8 h-8 rotate-12 animate-rotate-slow-reverse pointer-events-none z-0" 
         style={{ border: isDark ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(59, 130, 246, 0.4)', willChange: 'transform', animationDelay: '3s' }}></div>
    
    <div className="absolute top-[25%] right-[15%] w-16 h-16 rounded-2xl animate-float pointer-events-none z-20"
         style={{ border: isDark ? '2px solid rgba(243, 112, 33, 0.5)' : '2px solid rgba(243, 112, 33, 0.8)', animationDelay: '2.5s', animationDuration: '8.5s', willChange: 'transform' }}></div>
    <div className="absolute top-[65%] left-[20%] w-12 h-12 rounded-xl animate-float pointer-events-none z-20"
         style={{ border: isDark ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(59, 130, 246, 0.8)', animationDelay: '4s', animationDuration: '6s', willChange: 'transform' }}></div>
  </>
);

const HeroSection = ({ isDark, handleMouseMove, spotlightRef, scrollToSection }: any) => {
  const navigate = useNavigate();
  return (
    <section 
      onMouseMove={handleMouseMove}
      className={`relative pt-36 pb-20 md:pt-48 md:pb-32 px-6 md:px-12 flex items-center justify-center overflow-hidden z-10 border-b transition-colors duration-300 ease-in-out ${
        isDark ? 'border-zinc-900' : 'border-slate-200'
      }`}
    >
      <div 
        ref={spotlightRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-70 transition-opacity duration-300 ease-in-out"
        style={{
          background: `radial-gradient(700px circle at var(--mouse-x, 50%) var(--mouse-y, -20%), ${
            isDark ? 'rgba(243, 112, 33, 0.07)' : 'rgba(243, 112, 33, 0.08)'
          }, transparent 80%)`
        }}
      ></div>

      <FloatingShapes isDark={isDark} />

      <div className="max-w-6xl w-full text-center relative z-10">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-8 animate-fade-in-up transition-colors duration-300 ease-in-out ${
          isDark ? 'bg-[#f37021]/10 border-[#f37021]/30' : 'bg-[#f37021]/5 border-[#f37021]/20'
        }`}>
          <span className="flex h-2 w-2 rounded-full bg-[#f37021] animate-pulse"></span>
          <span className="text-xs font-semibold tracking-wider text-[#f37021] uppercase">OJT - FPT University</span>
        </div>

        <h1 className={`text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-none mb-6 animate-fade-in-up transition-colors duration-300 ease-in-out ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Chuyển Đổi Số Toàn Diện
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f37021] via-amber-500 to-orange-400">
            Quy Trình Thực Tập OJT
          </span>
        </h1>

        <p className={`text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-normal animate-fade-in-up transition-colors duration-300 ease-in-out ${
          isDark ? 'text-zinc-300' : 'text-slate-600'
        }`}>
          Đơn giản hóa việc kết nối Doanh nghiệp, quản lý hồ sơ sinh viên, sắp xếp phỏng vấn và đánh giá điểm năng lực bằng hệ thống số hóa thông minh, minh bạch.
        </p>

        <div className="flex gap-4 justify-center flex-wrap mb-20 animate-fade-in-up">
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-bold text-white px-7 py-3.5 rounded-full bg-gradient-to-r from-[#f37021] to-[#e26215] shadow-lg shadow-[#f37021]/20 hover:shadow-[#f37021]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-in-out flex items-center gap-2"
          >
            Bắt đầu ngay
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollToSection('#features')}
            className={`text-sm font-semibold bg-transparent px-7 py-3.5 rounded-full border transition-all duration-300 ease-in-out ${
              isDark ? 'text-zinc-100 border-zinc-500 hover:text-white hover:bg-zinc-800/40 hover:border-zinc-400' : 'text-slate-800 border-slate-400 hover:text-[#f37021] hover:bg-slate-100 hover:border-[#f37021]'
            }`}
          >
            Tìm hiểu tính năng
          </button>
        </div>

        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 pt-10 backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 ease-in-out ${
          isDark ? 'border-zinc-800/30 bg-[#0e1322]/30 text-zinc-100' : 'border-slate-200 bg-white/85 shadow-lg shadow-slate-100/40 text-slate-800'
        }`}>
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1 tracking-tight transition-colors duration-300 ease-in-out ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {stat.value}
              </div>
              <div className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AboutSection = ({ isDark }: { isDark: boolean }) => (
  <section id="about" className={`py-20 md:py-28 px-6 md:px-12 relative z-10 border-b scroll-mt-20 transition-colors duration-300 ease-in-out ${
    isDark ? 'border-zinc-900 bg-[#070a11]/40' : 'border-slate-200 bg-slate-50/50'
  }`}>
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-center">
      <div className="flex-1">
        <span className="text-xs font-bold tracking-widest text-[#f37021] uppercase">Giới thiệu</span>
        <h2 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold mt-3 mb-6 tracking-tight transition-colors duration-300 ease-in-out ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Cầu nối hiện đại giữa Giảng đường & Doanh nghiệp
        </h2>
        <p className={`text-sm sm:text-base leading-relaxed mb-6 transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
          Hệ thống Quản lý Thực tập Doanh nghiệp (UEIMS) là nền tảng số hóa tối ưu được xây dựng nhằm phục vụ kỳ thực tập doanh nghiệp (On-the-Job Training) tại Trường Đại học FPT Đà Nẵng.
        </p>
        <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
          Chúng tôi loại bỏ hoàn toàn các rào cản hành chính thủ công, kết nối trực tiếp nhà trường, sinh viên và nhà tuyển dụng để cùng kiến tạo những trải nghiệm học tập thực tế chất lượng nhất.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
        {[
          { num: '01', title: 'Số hóa 100%', desc: 'Toàn bộ biểu mẫu báo cáo, phê duyệt CV và chấm điểm Rubric được thực hiện trực tuyến hoàn toàn.', colorClass: isDark ? 'bg-blue-600/10 text-blue-400' : 'bg-blue-50 text-blue-600' },
          { num: '02', title: 'Đồng bộ Đa bên', desc: 'Cập nhật thông tin tức thời giữa Sinh viên, Giảng viên Hướng dẫn và Doanh nghiệp đối tác.', colorClass: isDark ? 'bg-[#f37021]/10 text-[#f37021]' : 'bg-orange-50 text-[#f37021]' },
          { num: '03', title: 'Tuyển dụng Trực tiếp', desc: 'Doanh nghiệp đăng tin tuyển dụng OJT và chủ động lọc hồ sơ, xếp lịch phỏng vấn nhanh gọn.', colorClass: isDark ? 'bg-emerald-600/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600' },
          { num: '04', title: 'Thống kê Minh bạch', desc: 'Theo dõi trực quan tiến độ và xuất dữ liệu báo cáo OJT đầy đủ chuẩn xác chỉ với một cú click.', colorClass: isDark ? 'bg-purple-600/10 text-purple-400' : 'bg-purple-50 text-purple-600' }
        ].map((item) => (
          <div key={item.title} className={`border p-6 rounded-2xl transition-all duration-300 ease-in-out ${isDark ? 'bg-[#101524]/60 border-zinc-800/40' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-4 font-semibold text-sm ${item.colorClass}`}>{item.num}</div>
            <h4 className={`text-sm font-bold mb-2 transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-100' : 'text-slate-800'}`}>{item.title}</h4>
            <p className={`text-xs leading-relaxed transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FeaturesSection = ({ isDark }: { isDark: boolean }) => (
  <section id="features" className={`py-20 md:py-28 px-6 md:px-12 relative z-10 border-b scroll-mt-20 transition-colors duration-300 ease-in-out ${isDark ? 'border-zinc-900 bg-[#0e1322]/20' : 'border-slate-200 bg-white'}`}>
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16 md:mb-20">
        <span className="text-xs font-bold tracking-widest text-[#f37021] uppercase">Tính Năng Cốt Lõi</span>
        <h2 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold mt-3 mb-4 tracking-tight transition-colors duration-300 ease-in-out ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Quản lý thực tập chuyên nghiệp
        </h2>
        <p className={`text-sm sm:text-base max-w-xl mx-auto transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
          Thiết kế giải pháp phù hợp cho tất cả các đối tượng tham gia vào kỳ học doanh nghiệp OJT.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.title}
              className={`border rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300 ease-in-out group ${isDark ? 'bg-[#101524] border-zinc-800/50 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/20' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50'}`}
            >
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white mb-6 group-hover:scale-105 transition-transform`}>
                <Icon className="h-5.5 w-5.5" />
              </div>
              <h3 className={`text-lg font-bold mb-3 transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-100 group-hover:text-white' : 'text-slate-800 group-hover:text-slate-900'}`}>
                {feat.title}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed font-normal transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                {feat.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

const ProcessSection = ({ isDark }: { isDark: boolean }) => (
  <section id="process" className={`py-20 md:py-28 px-6 md:px-12 relative z-10 border-b scroll-mt-20 transition-colors duration-300 ease-in-out ${isDark ? 'border-zinc-900' : 'border-slate-200'}`}>
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16 md:mb-20">
        <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">Quy Trình Hoạt Động</span>
        <h2 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold mt-3 mb-4 tracking-tight transition-colors duration-300 ease-in-out ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Bốn bước khép kín thông minh
        </h2>
        <p className={`text-sm sm:text-base max-w-xl mx-auto transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
          Vận hành đồng bộ nhịp nhàng giữa Nhà trường - Sinh viên - Doanh nghiệp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((step, i) => (
          <div key={step.num} className={`border rounded-xl p-6 relative overflow-hidden group transition-all duration-300 ease-in-out ${isDark ? 'bg-[#101524]/40 border-zinc-900' : 'bg-white border-slate-200 shadow-sm'}`}>
            {i < 3 && <div className={`hidden lg:block absolute top-[40%] right-[-16px] w-8 h-[1px] z-10 transition-colors duration-300 ease-in-out ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}></div>}
            <div className="text-3xl font-extrabold text-[#f37021]/40 group-hover:text-[#f37021]/70 mb-4 transition-colors">
              {step.num}
            </div>
            <h3 className={`text-sm font-bold mb-2 transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>{step.title}</h3>
            <p className={`text-xs leading-relaxed transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const PartnerSection = ({ isDark }: { isDark: boolean }) => {
  const navigate = useNavigate();
  return (
    <section id="partner" className={`py-20 md:py-28 px-6 md:px-12 relative z-10 border-b scroll-mt-20 transition-colors duration-300 ease-in-out ${isDark ? 'bg-[#0e1322]/20 border-zinc-900' : 'bg-slate-50 border-slate-200'}`}>
      <div className={`max-w-5xl mx-auto border rounded-3xl p-8 md:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center transition-colors duration-300 ease-in-out ${isDark ? 'bg-[#101524] border-zinc-800/80' : 'bg-white border-slate-200'}`}>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full"></div>
        <div className="flex-1 z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#f37021] bg-[#f37021]/10 px-2.5 py-1 rounded-md">
            Dành cho Doanh nghiệp
          </span>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold mt-5 mb-4 tracking-tight transition-colors duration-300 ease-in-out ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Đồng hành cùng nguồn nhân lực chất lượng cao
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed max-w-lg mb-0 transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
            Đăng ký hợp tác ngay để tiếp cận hàng nghìn sinh viên công nghệ, quản trị và thiết kế năng động của Đại học FPT, đồng thời số hóa hoạt động tiếp nhận thực tập sinh một cách nhanh chóng.
          </p>
        </div>
        <div className="flex flex-col gap-3 shrink-0 z-10 w-full md:w-auto">
          <button
            onClick={() => navigate('/register-enterprise')}
            className="text-xs font-bold text-white px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#f37021] to-[#e26215] shadow-lg shadow-[#f37021]/15 hover:shadow-[#f37021]/30 hover:-translate-y-0.5 active:translate-y-0 text-center transition-all duration-300 ease-in-out"
          >
            Đăng ký tài khoản Doanh nghiệp
          </button>
          <button
            onClick={() => navigate('/login')}
            className={`text-xs font-semibold bg-transparent px-6 py-3.5 rounded-xl border text-center transition-all duration-300 ease-in-out ${isDark ? 'text-zinc-100 border-zinc-500 hover:text-white hover:border-[#f37021] hover:bg-[#f37021]/5' : 'text-slate-800 border-slate-400 hover:text-[#f37021] hover:border-[#f37021] hover:bg-[#f37021]/5'}`}
          >
            Hỗ trợ & Liên hệ OJT
          </button>
        </div>
      </div>
    </section>
  );
};

const CTASection = ({ isDark }: { isDark: boolean }) => {
  const navigate = useNavigate();
  return (
    <section className={`py-20 md:py-32 px-6 md:px-12 relative z-10 text-center overflow-hidden border-b transition-colors duration-300 ease-in-out ${isDark ? 'bg-gradient-to-b from-[#0b0f19] to-[#070a11] border-transparent' : 'bg-gradient-to-b from-white to-slate-50 border-slate-200'}`}>
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#f37021]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="max-w-4xl mx-auto relative z-10">
        <h2 className={`text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 transition-colors duration-300 ease-in-out ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Bắt đầu số hóa hành trình
          <br />
          <span className="text-[#f37021]">quản lý OJT</span> ngay hôm nay
        </h2>
        <p className={`text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
          Hợp tác bền vững, theo dõi liền mạch, quản lý hiệu quả. Trải nghiệm hệ thống quản lý thực tập tốt nhất.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="text-sm font-bold text-white px-8 py-4 rounded-full bg-gradient-to-r from-[#f37021] to-[#e26215] shadow-lg shadow-[#f37021]/20 hover:shadow-[#f37021]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-in-out inline-flex items-center gap-2"
        >
          Đăng nhập hệ thống
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
};

const Footer = ({ isDark, scrollToSection }: { isDark: boolean, scrollToSection: (h: string) => void }) => (
  <footer className={`border-t px-6 md:px-12 py-16 relative z-10 transition-colors duration-300 ease-in-out ${isDark ? 'bg-[#070a11] border-zinc-900/60 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src="/src/assets/logo_ueims.png" alt="UEIMS Logo" style={{ height: '32px', objectFit: 'contain' }} />
            <span className={`font-bold text-base tracking-wide transition-colors duration-300 ease-in-out ${isDark ? 'text-white' : 'text-slate-900'}`}>UEIMS</span>
          </div>
          <p className={`text-xs leading-relaxed max-w-sm transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            University-Enterprise Internship Management System. Nền tảng quản trị thông minh đồng hành cùng nhà trường và doanh nghiệp trong từng kỳ OJT của sinh viên.
          </p>
        </div>
        <div>
          <h4 className={`font-bold text-xs tracking-wider uppercase mb-4 transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>Hệ Thống</h4>
          <div className="flex flex-col gap-2.5 text-xs">
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('#about'); }} className="hover:text-[#f37021] transition-colors">Giới thiệu</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('#features'); }} className="hover:text-[#f37021] transition-colors">Tính năng</a>
            <a href="#process" onClick={(e) => { e.preventDefault(); scrollToSection('#process'); }} className="hover:text-[#f37021] transition-colors">Quy trình</a>
          </div>
        </div>
        <div>
          <h4 className={`font-bold text-xs tracking-wider uppercase mb-4 transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>Vai Trò</h4>
          <div className="flex flex-col gap-2.5 text-xs">
            <a href="/login" className={`hover:text-[#f37021] transition-colors ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Doanh nghiệp</a>
            <a href="/login" className={`hover:text-[#f37021] transition-colors ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Sinh viên</a>
            <a href="/login" className={`hover:text-[#f37021] transition-colors ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Giảng viên / Quản lý</a>
          </div>
        </div>
        <div>
          <h4 className={`font-bold text-xs tracking-wider uppercase mb-4 transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>Phát Triển</h4>
          <div className="flex flex-col gap-2.5 text-xs font-semibold">
            <span className={isDark ? 'text-zinc-450' : 'text-slate-600'}>Đại học FPT</span>
            <span className={isDark ? 'text-zinc-450' : 'text-slate-600'}>Nhóm 7 - SE20A05</span>
            <span className="text-[#f37021]">OJT 2026</span>
          </div>
        </div>
      </div>
      <div className={`border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center transition-colors duration-300 ease-in-out ${isDark ? 'border-zinc-900/40 text-zinc-500' : 'border-slate-200 text-slate-500'}`}>
        <span className="text-xs sm:text-sm">© 2026 UEIMS. Bản quyền thuộc về Nhóm 7 - Trường Đại học FPT Đà Nẵng.</span>
        <span className="text-xs sm:text-sm">Chương trình thực tập Doanh nghiệp (On-the-Job Training)</span>
      </div>
    </div>
  </footer>
);

export const HomePage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('homepage-theme');
    return saved != null ? JSON.parse(saved) : true;
  });
  const spotlightRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlightRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    spotlightRef.current.style.setProperty('--mouse-x', `${x}px`);
    spotlightRef.current.style.setProperty('--mouse-y', `${y}px`);
  }, []);

  useEffect(() => {
    localStorage.setItem('homepage-theme', JSON.stringify(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      try {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (err) {
        // Fallback for older browsers
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top + (window.pageYOffset || window.scrollY);
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth'
        });
      }
    }
  };

  const themeTimeoutRef = React.useRef<any>(null);

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-transitioning');
    setIsDark(!isDark);
    if (themeTimeoutRef.current) clearTimeout(themeTimeoutRef.current);
    themeTimeoutRef.current = setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 700);
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-[#f37021]/30 selection:text-white overflow-x-hidden transition-colors duration-300 ease-in-out ${
      isDark ? 'bg-[#0b0f19] text-zinc-100' : 'bg-slate-50 text-slate-800'
    }`}>
      <style>{`
        .theme-transitioning * {
          transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow !important;
          transition-duration: 0.7s !important;
          transition-timing-function: ease-in-out !important;
        }
      `}</style>
      
      <BackgroundEffects isDark={isDark} />
      
      <NavBar 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        scrolled={scrolled} 
        scrollToSection={scrollToSection} 
      />

      <HeroSection 
        isDark={isDark} 
        handleMouseMove={handleMouseMove} 
        spotlightRef={spotlightRef} 
        scrollToSection={scrollToSection} 
      />

      <AboutSection isDark={isDark} />
      <FeaturesSection isDark={isDark} />
      <ProcessSection isDark={isDark} />
      <PartnerSection isDark={isDark} />
      <CTASection isDark={isDark} />
      
      <Footer isDark={isDark} scrollToSection={scrollToSection} />
    </div>
  );
};
