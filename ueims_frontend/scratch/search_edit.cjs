const fs = require('fs');

const transcriptPath = 'C:\\Users\\huynh\\.gemini\\antigravity-ide\\brain\\edfc6ee4-b17b-4766-b4be-8145cd514d30\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (!lines[i]) continue;
  try {
    const obj = JSON.parse(lines[i]);
    if (obj.content && obj.content.includes('setIsEditing(true)')) {
       console.log('Found in step', obj.step_index);
       const matches = obj.content.match(/.{0,50}setIsEditing\(true\).{0,50}/g);
       if (matches) console.log(matches.join('\n'));
    }
  } catch (e) {}
}
