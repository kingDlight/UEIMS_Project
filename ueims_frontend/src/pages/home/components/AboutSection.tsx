import React, { useState } from 'react';

export const AboutSection = ({ isDark }: { isDark: boolean }) => (
  <section id="about" className={`py-20 md:py-28 px-6 md:px-12 relative z-10 border-b scroll-mt-20 transition-colors duration-300 ease-in-out ${
    isDark ? 'border-zinc-900 bg-[#070a11]/40' : 'border-slate-200 bg-slate-50/50'
  }`}>
    <div
      className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-center"
    >
      <div className="scroll-animate transition-all duration-700 ease-out flex-1">
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
          <div key={item.title} className={`scroll-animate transition-all duration-700 ease-out border p-6 rounded-2xl transition-all duration-300 ease-in-out ${isDark ? 'bg-[#101524]/60 border-zinc-800/40' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-4 font-semibold text-sm ${item.colorClass}`}>{item.num}</div>
            <h4 className={`text-sm font-bold mb-2 transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-100' : 'text-slate-800'}`}>{item.title}</h4>
            <p className={`text-xs leading-relaxed transition-colors duration-300 ease-in-out ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
