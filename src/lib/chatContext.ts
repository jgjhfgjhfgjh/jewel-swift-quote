import type { Profile, AppRole } from '@/hooks/useAuth';

export interface PartnerContext {
  profile: Profile | null;
  role: AppRole | null;
}

export function buildPartnerContext({ profile, role }: PartnerContext): string | undefined {
  if (!profile && !role) return undefined;

  const lines: string[] = [];
  if (profile?.company_name) lines.push(`Firma: ${profile.company_name}`);
  if (profile?.ico) lines.push(`IČO: ${profile.ico}`);
  if (role) lines.push(`Role: ${role}`);

  return lines.length ? lines.join('\n') : undefined;
}

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};
