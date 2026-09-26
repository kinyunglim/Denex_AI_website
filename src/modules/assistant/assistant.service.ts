import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { ValidationError } from '@/src/lib/errors';
import { buildSystemPrompt } from './assistant.prompt';

/**
 * Storefront chat assistant (Claude). The route streams plain text back to
 * the chat widget. Without ANTHROPIC_API_KEY the assistant is reported as
 * unavailable and the widget shows contact links instead.
 */
export const ChatInput = z.object({
  locale: z.enum(['zh-Hant', 'zh-Hans', 'en']).default('zh-Hant'),
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().trim().min(1).max(1500) }))
    .min(1)
    .max(24)
    .refine((m) => m[0].role === 'user' && m[m.length - 1].role === 'user', 'Conversation must start and end with a user message'),
});
export type ChatInput = z.infer<typeof ChatInput>;

/**
 * Provider: MiniMax (Anthropic-compatible endpoint) when MINIMAX_API_KEY is set,
 * otherwise Claude via ANTHROPIC_API_KEY. Both use the Anthropic SDK.
 */
const MINIMAX_BASE_URL = 'https://api.minimax.io/anthropic';
const CLAUDE_MODEL = 'claude-opus-5';
const MINIMAX_MODEL = process.env.MINIMAX_MODEL || 'MiniMax-M3';
const isMiniMax = () => Boolean(process.env.MINIMAX_API_KEY);
const REFUSAL_TEXT = {
  'zh-Hant': '呢個問題我幫唔到你。有其他關於網站或者方案嘅問題，歡迎再問；或者用聯絡表單直接搵我哋。',
  'zh-Hans': '这个问题我帮不到你。有其他关于网站或方案的问题，欢迎再问；或者用联络表单直接找我们。',
  en: "I can't help with that one. Feel free to ask anything else about our websites or plans, or reach us through the contact form.",
} as const;

let client: Anthropic | null = null;
const getClient = () =>
  (client ??= isMiniMax() ? new Anthropic({ apiKey: process.env.MINIMAX_API_KEY, baseURL: MINIMAX_BASE_URL }) : new Anthropic());

export const AssistantService = {
  isEnabled(): boolean {
    return isMiniMax() || Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  },

  parse(body: unknown): ChatInput {
    const parsed = ChatInput.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid chat input');
    return parsed.data;
  },

  /** Streams the assistant's reply as UTF-8 text chunks. */
  stream(input: ChatInput): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    const lang = input.locale;
    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const system = `${buildSystemPrompt()}

The visitor is browsing the ${lang} version of the site; use /${lang === 'zh-Hans' ? 'zh-Hant' : lang} in links.`;
          const messages = input.messages.map((m) => ({ role: m.role, content: m.content }));
          const stream = isMiniMax()
            ? // MiniMax supports the core Messages API only (no betas / effort / fallbacks).
              getClient().messages.stream({ model: MINIMAX_MODEL, max_tokens: 4096, system, messages })
            : getClient().beta.messages.stream({
                model: CLAUDE_MODEL,
                max_tokens: 4096,
                // Short chat answers: low effort keeps replies fast and cheap.
                output_config: { effort: 'low' },
                // On a safety decline the API retries on Anthropic's recommended fallback model.
                betas: ['server-side-fallback-2026-07-01'],
                fallbacks: 'default',
                cache_control: { type: 'ephemeral' },
                system,
                messages,
              });
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          const final = await stream.finalMessage();
          if (final.stop_reason === 'refusal') controller.enqueue(encoder.encode(`\n\n${REFUSAL_TEXT[lang]}`));
          controller.close();
        } catch (error) {
          console.error('[assistant]', error instanceof Anthropic.APIError ? `${error.status} ${error.message}` : error);
          controller.error(error);
        }
      },
    });
  },
};
