import { render } from '@react-email/render';

import { PasswordChangedEmail } from './PasswordChangedEmail';
import { PasswordResetEmail } from './PasswordResetEmail';
import { ResetPasswordEmail } from './ResetPasswordEmail';
import { WelcomeEmail } from './WelcomeEmail';

export type EmailTemplateId = 'reset-password' | 'password-reset' | 'password-changed' | 'welcome';

export type RenderEmailInput =
  | { template: 'reset-password'; props: Parameters<typeof ResetPasswordEmail>[0] }
  | { template: 'password-reset'; props: Parameters<typeof PasswordResetEmail>[0] }
  | { template: 'password-changed'; props: Parameters<typeof PasswordChangedEmail>[0] }
  | { template: 'welcome'; props: Parameters<typeof WelcomeEmail>[0] };

export function renderEmail({ template, props }: RenderEmailInput) {
  switch (template) {
    case 'reset-password':
      return render(ResetPasswordEmail(props), { pretty: true });
    case 'password-reset':
      return render(PasswordResetEmail(props), { pretty: true });
    case 'password-changed':
      return render(PasswordChangedEmail(props), { pretty: true });
    case 'welcome':
      return render(WelcomeEmail(props), { pretty: true });
    default: {
      const _exhaustive: never = template;
      return _exhaustive;
    }
  }
}

export async function renderEmailAsync(input: RenderEmailInput) {
  const out = renderEmail(input);
  return await Promise.resolve(out);
}
