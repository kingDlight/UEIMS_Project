const fs = require('fs');

const transcriptPath = 'C:\\Users\\huynh\\.gemini\\antigravity-ide\\brain\\443bad5c-f9fa-4c8f-b01c-31d5bf57388b\\.system_generated\\logs\\transcript.jsonl';
if (!fs.existsSync(transcriptPath)) {
  console.log('File not found', transcriptPath);
  process.exit(1);
}
const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (!lines[i]) continue;
  try {
    const obj = JSON.parse(lines[i]);
    if (obj.tool_calls) {
       for (const tc of obj.tool_calls) {
          if (tc.name === 'default_api:replace_file_content' || tc.name === 'default_api:write_to_file') {
             if (tc.arguments && tc.arguments.TargetFile && tc.arguments.TargetFile.includes('ProfileTab.tsx')) {
                fs.writeFileSync('C:\\FPT\\SWP391\\ueims\\UEIMS_Project\\ueims_frontend\\scratch\\found_prev.txt', JSON.stringify(tc.arguments.ReplacementContent || tc.arguments.CodeContent, null, 2));
                console.log('Found and wrote to found_prev.txt');
             }
          }
       }
    }
  } catch (e) {}
}
