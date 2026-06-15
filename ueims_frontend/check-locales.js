import fs from 'fs';
import path from 'path';

const viDir = path.join(process.cwd(), 'public/locales/vi');
const enDir = path.join(process.cwd(), 'public/locales/en');

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      keys = keys.concat(getKeys(obj[k], `${prefix}${k}.`));
    } else {
      keys.push(`${prefix}${k}`);
    }
  }
  return keys;
}

const viFiles = fs.readdirSync(viDir);

for (const file of viFiles) {
  if (!file.endsWith('.json')) continue;
  
  const viPath = path.join(viDir, file);
  const enPath = path.join(enDir, file);
  
  const viContent = JSON.parse(fs.readFileSync(viPath, 'utf8'));
  let enContent = {};
  if (fs.existsSync(enPath)) {
    enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  }
  
  const viKeys = getKeys(viContent);
  const enKeys = getKeys(enContent);
  
  const missingInEn = viKeys.filter(k => !enKeys.includes(k));
  if (missingInEn.length > 0) {
    console.log(`[${file}] Missing keys in English:`, missingInEn);
  } else {
    console.log(`[${file}] All keys synced!`);
  }
}
