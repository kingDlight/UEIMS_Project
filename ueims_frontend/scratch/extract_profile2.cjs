const fs = require('fs');

const transcriptPath = 'C:\\Users\\huynh\\.gemini\\antigravity-ide\\brain\\edfc6ee4-b17b-4766-b4be-8145cd514d30\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n');

let profileTabContent = [];

for (let i = 0; i < lines.length; i++) {
  if (!lines[i]) continue;
  try {
    const obj = JSON.parse(lines[i]);
    if (obj.type === 'TOOL_CALL_OUTPUT' && typeof obj.content === 'string' && obj.content.includes('ProfileTab.tsx') && obj.content.includes('The following code has been modified to include a line number')) {
       const linesOutput = obj.content.split('\n');
       for (const line of linesOutput) {
         const match = line.match(/^(\d+):\s(.*)$/);
         if (match) {
           const lineNum = parseInt(match[1], 10);
           profileTabContent[lineNum] = match[2];
         }
       }
    }
  } catch (e) {}
}

const finalContentArray = [];
for (let i = 1; i <= 605; i++) {
  if (profileTabContent[i] !== undefined) {
    finalContentArray.push(profileTabContent[i]);
  } else {
    finalContentArray.push(`// MISSING LINE ${i}`);
  }
}

const finalContent = finalContentArray.join('\n');
fs.writeFileSync('C:\\FPT\\SWP391\\ueims\\UEIMS_Project\\ueims_frontend\\src\\pages\\student\\tabs\\ProfileTab.tsx', finalContent);
console.log('Extracted lines:', finalContentArray.length, 'Missing lines:', finalContentArray.filter(l => l.startsWith('// MISSING')).length);
