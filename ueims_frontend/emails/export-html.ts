import fs from 'node:fs/promises';
import path from 'node:path';

import { renderEmailAsync } from './renderEmail';

type CliTemplate = 'reset-password' | 'password-reset' | 'password-changed' | 'welcome';

function getArg(name: string) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

async function main() {
  const outDir = getArg('--out') ?? path.resolve(process.cwd(), 'emails_dist');
  const template = (getArg('--template') ?? 'all') as CliTemplate | 'all';

  await fs.mkdir(outDir, { recursive: true });

  const jobs: Array<{ name: string; html: string }> = [];

  if (template === 'all' || template === 'reset-password') {
    jobs.push({
      name: 'reset-password-email.html',
      html: await renderEmailAsync({
        template: 'reset-password',
        props: {
          fullName: '{{fullName}}',
          resetUrl: '{{resetUrl}}',
        },
      }),
    });
  }

  if (template === 'all' || template === 'password-reset') {
    jobs.push({
      name: 'password-reset-email.html',
      html: await renderEmailAsync({
        template: 'password-reset',
        props: {
          fullName: '{{fullName}}',
          resetUrl: '{{resetUrl}}',
        },
      }),
    });
  }

  if (template === 'all' || template === 'password-changed') {
    jobs.push({
      name: 'password-changed-email.html',
      html: await renderEmailAsync({
        template: 'password-changed',
        props: {
          fullName: '{{fullName}}',
          changedAt: '{{changedAt}}',
          loginUrl: '{{loginUrl}}',
        },
      }),
    });
  }

  if (template === 'all' || template === 'welcome') {
    jobs.push({
      name: 'welcome-email.html',
      html: await renderEmailAsync({
        template: 'welcome',
        props: {
          fullName: '{{fullName}}',
          email: '{{email}}',
          tempPassword: '{{tempPassword}}',
          loginUrl: '{{loginUrl}}',
        },
      }),
    });
  }

  await Promise.all(jobs.map((j) => fs.writeFile(path.join(outDir, j.name), j.html, { encoding: 'utf8' })));

   
  console.log(`Wrote ${jobs.length} template(s) to: ${outDir}`);
}

try {
  await main();
} catch (err) {
   
  console.error(err);
  process.exit(1);
}
