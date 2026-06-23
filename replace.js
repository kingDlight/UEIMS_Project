const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'ueims_frontend', 'playwright');
const files = fs.readdirSync(dir).filter(f => f.startsWith('tc-auth-') && f.endsWith('.spec.ts'));

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Thay thế các email hợp lệ thành process.env.TEST_EMAIL
    content = content.replace(/'demo\.student@fpt\.edu\.vn'/g, "process.env.TEST_EMAIL || 'demo.student@fpt.edu.vn'");
    content = content.replace(/'myplancantfail@gmail\.com'/g, "process.env.TEST_EMAIL || 'myplancantfail@gmail.com'");
    
    // Thay thế mật khẩu '1234567890' thành process.env.TEST_PASSWORD
    content = content.replace(/'1234567890'/g, "process.env.TEST_PASSWORD || '1234567890'");

    fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Replaced hardcoded emails and passwords in tests.');
