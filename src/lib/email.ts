import nodemailer, { Transporter } from 'nodemailer';

/**
 * Interface for email options
 */
export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

/**
 * Outgoing email.
 * Approach: a static object (like the DAOs) so tests can `jest.spyOn(Mailer, 'send')`.
 * Without SMTP_HOST (local dev, preview), mail is printed to the console instead.
 */
export const Mailer = {
  isConfigured(): boolean {
    return Boolean(process.env.SMTP_HOST);
  },

  async send(options: EmailOptions): Promise<void> {
    const to = Array.isArray(options.to) ? options.to.join(', ') : options.to;
    if (!to) return;
    if (!Mailer.isConfigured()) {
      console.log(`[Email:console] to=${to} subject="${options.subject}"\n${options.text ?? options.html ?? ''}`);
      return;
    }
    try {
      await getTransporter().sendMail({
        from: options.from || process.env.SMTP_FROM || 'noreply@example.com',
        to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo,
      });
    } catch (error) {
      console.error('[Email] Error sending email:', error);
      throw new Error('Failed to send email via SMTP');
    }
  },
};

/** Backwards-compatible helper used by the VTCS user-auth services. */
export async function sendEmail(options: EmailOptions): Promise<void> {
  await Mailer.send(options);
}

export async function verifySmtpConnection(): Promise<boolean> {
  try {
    await getTransporter().verify();
    return true;
  } catch (error) {
    console.error('[Email] SMTP verification failed:', error);
    return false;
  }
}
