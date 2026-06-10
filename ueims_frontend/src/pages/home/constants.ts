import { GraduationCap, Building2, ShieldCheck, Calendar, BarChart3, FileCheck2 } from 'lucide-react';

export const navLinks = [
  { label: 'Giới thiệu', href: '#about' },
  { label: 'Tính năng', href: '#features' },
  { label: 'Quy trình OJT', href: '#process' },
  { label: 'Doanh nghiệp', href: '#partner' },
];
export const stats = [
  { value: '3,200+', label: 'Sinh viên thực tập' },
  { value: '450+', label: 'Doanh nghiệp liên kết' },
  { value: '98.5%', label: 'Tỷ lệ hoàn thành OJT' },
  { value: '96.2%', label: 'Đánh giá hài lòng' },
];
export const features = [
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
export const steps = [
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
