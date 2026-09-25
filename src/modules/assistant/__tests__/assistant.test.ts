import { describe, expect, it } from '@jest/globals';
import { agency } from '@/agency.config';
import { buildSystemPrompt } from '../assistant.prompt';
import { AssistantService } from '../assistant.service';

describe('assistant prompt', () => {
  it('lists every plan, add-on and style with prices from agency.config', () => {
    const prompt = buildSystemPrompt();
    for (const p of agency.packages) expect(prompt).toContain(`HK$${p.oneOff.toLocaleString('en-US')}`);
    for (const a of agency.addOns) expect(prompt).toContain(a.name.en);
    for (const t of agency.themes) expect(prompt).toContain(`key: ${t.key}`);
  });

  it('is deterministic so the prefix stays cacheable', () => {
    expect(buildSystemPrompt()).toBe(buildSystemPrompt());
  });
});

describe('assistant input', () => {
  it('accepts a normal conversation', () => {
    const input = AssistantService.parse({ locale: 'en', messages: [{ role: 'user', content: 'Which plan fits a clinic?' }] });
    expect(input.messages).toHaveLength(1);
  });

  it('rejects conversations that do not end with the visitor', () => {
    expect(() =>
      AssistantService.parse({ messages: [{ role: 'user', content: 'hi' }, { role: 'assistant', content: 'hello' }] })
    ).toThrow();
  });

  it('rejects oversized messages and histories', () => {
    expect(() => AssistantService.parse({ messages: [{ role: 'user', content: 'x'.repeat(1501) }] })).toThrow();
    const long = Array.from({ length: 25 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'x' }));
    expect(() => AssistantService.parse({ messages: long })).toThrow();
  });
});
