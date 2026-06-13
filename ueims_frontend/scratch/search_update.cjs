const fs = require('fs');

const transcriptPath = 'C:\\Users\\huynh\\.gemini\\antigravity-ide\\brain\\edfc6ee4-b17b-4766-b4be-8145cd514d30\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (!lines[i]) continue;
  try {
    const obj = JSON.parse(lines[i]);
    if (obj.content && obj.content.includes('const handleUpdate')) {
       console.log('Found in step', obj.step_index);
       const matches = obj.content.match(/const handleUpdate[\s\S]{0,300}/g);
       if (matches) console.log(matches[0]);
    }
  } catch (e) {}
}
