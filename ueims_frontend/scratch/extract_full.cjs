const fs = require('fs');

const transcriptPath = 'C:\\Users\\huynh\\.gemini\\antigravity-ide\\brain\\edfc6ee4-b17b-4766-b4be-8145cd514d30\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (!lines[i]) continue;
  try {
    const obj = JSON.parse(lines[i]);
    if (obj.tool_calls) {
       for (const tc of obj.tool_calls) {
          if (tc.name === 'default_api:replace_file_content' || tc.name === 'default_api:write_to_file') {
             if (tc.arguments && tc.arguments.TargetFile && tc.arguments.TargetFile.includes('ProfileTab.tsx')) {
                if (tc.arguments.ReplacementContent && tc.arguments.ReplacementContent.includes('const handleUpdate = async')) {
                   fs.writeFileSync('C:\\FPT\\SWP391\\ueims\\UEIMS_Project\\ueims_frontend\\scratch\\found_replace.txt', tc.arguments.ReplacementContent);
                   console.log('Extracted to found_replace.txt');
                }
             }
          }
       }
    }
  } catch (e) {}
}
