// Transactional e-mail via Resend REST API (no SDK dependency).
// Configure: RESEND_API_KEY, EMAIL_FROM (e.g. "swelt.partner <orders@swelt.partner>").

export interface EmailResult {
  ok: boolean;
  error?: string;
}

export interface EmailAttachment {
  filename: string;
  /** Plain string content — Resend base64-encodes it on our side. */
  content: string;
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  attachments?: EmailAttachment[],
  html?: string
): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    return { ok: false, error: 'EMAIL_NOT_CONFIGURED (RESEND_API_KEY / EMAIL_FROM missing)' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
        ...(html ? { html } : {}),
        attachments: attachments?.map((a) => ({
          filename: a.filename,
          content: Buffer.from(a.content, 'utf8').toString('base64'),
        })),
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
