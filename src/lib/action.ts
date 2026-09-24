import { AppError } from '@/src/lib/errors';

/**
 * Result type for admin server actions, rendered by <ActionForm>.
 */
export type ActionResult = { ok: true; message: string; data?: unknown } | { ok: false; error: string };

/** Runs an action body, converting thrown AppErrors into readable messages. */
export async function runAction(fn: () => Promise<string | { message: string; data: unknown }>): Promise<ActionResult> {
  try {
    const out = await fn();
    return typeof out === 'string' ? { ok: true, message: out } : { ok: true, message: out.message, data: out.data };
  } catch (error) {
    if (error instanceof AppError) {
      const detail = error.fields ? Object.entries(error.fields).map(([k, v]) => `${k}: ${v.join(', ')}`).join('; ') : '';
      return { ok: false, error: detail ? `${error.message} (${detail})` : error.message };
    }
    // Next.js redirect()/notFound() throw special errors that must propagate.
    if (error instanceof Error && 'digest' in error) throw error;
    console.error('[Admin action] Unhandled error:', error);
    return { ok: false, error: 'Something went wrong' };
  }
}

export const str = (form: FormData, key: string): string => {
  const v = form.get(key);
  return typeof v === 'string' ? v.trim() : '';
};

export const tagsOf = (raw: string): string[] => raw.split(/[,，]/).map((t) => t.trim()).filter(Boolean);
