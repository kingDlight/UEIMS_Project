import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const CTASection = ({ isDark }: { isDark: boolean }) => {
  const navigate = useNavigate();
  return (
    <section className={`py-20 md:py-32 px-6 md:px-12 relative z-10 text-center overflow-hidden border-b transition-colors duration-300 ease-in-out ${isDark ? 'bg-gradient-to-b from-[#0b0f19] to-[#070a11] border-transparent' : 'bg-gradient-to-b from-white to-slate-50 border-slate-200'}`}>
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#f37021]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div
        className="max-w-4xl mx-auto relative z-10"
      >
        <h2 className={`scroll-animate transition-all duration-700 ease-out text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 transition-colors duration-300 ease-in-out ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Bắt đầu số hóa hành trình
          <br />
          <span className="text-[#f37021]">quản lý OJT</span> ngay hôm nay
        </h2>
        <p className={`scroll-animate transition-all duration-700 ease-out text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
          Hợp tác bền vững, theo dõi liền mạch, quản lý hiệu quả. Trải nghiệm hệ thống quản lý thực tập tốt nhất.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="group relative overflow-hidden text-sm font-bold text-white px-8 py-4 rounded-full bg-gradient-to-r from-[#f37021] to-[#e26215] shadow-lg shadow-[#f37021]/30 hover:shadow-xl hover:shadow-[#f37021]/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 inline-flex items-center gap-2"
        >
          <div className="absolute top-0 -left-[100%] w-1/2 h-full block transform skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:left-[200%] transition-all duration-700 ease-in-out"></div>
          <span className="relative z-10 flex items-center gap-2">Đăng nhập hệ thống
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </button>
      </div>
    </section>
  );
};
