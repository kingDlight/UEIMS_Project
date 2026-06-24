import { test, expect } from '@playwright/test';

test('TC-AUTH-037: Xem log bị giới hạn quyền (BR)', async ({ request }) => {
  // Đăng nhập để lấy token (giả lập) hoặc gọi trực tiếp nếu API cần auth
  // Vì đây là test case kiểm tra quyền API, gọi trực tiếp API là chính xác nhất
  // Cập nhật URL để trỏ tới backend port 8080
  const response = await request.get('http://localhost:8080/api/audit-logs', {
    headers: {
      'Authorization': 'Bearer invalid_token' 
    }
  });
  expect(response.status()).toBe(401);
});
