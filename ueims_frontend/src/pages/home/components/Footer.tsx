import React from 'react';

export const Footer = ({ isDark, scrollToSection }: { isDark: boolean, scrollToSection: (h: string) => void }) => (
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
