import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { setupTestDb } from '@/src/test/mongo';
import { ContactFormService } from '@/src/modules/contact-form/contact-form.service';
import { CrmService } from '@/src/modules/crm/crm.service';
import { Mailer } from '@/src/lib/email';
import { resetConfigCache } from '@/src/lib/site';
import clientConfig from '@/client.config';

const cfg = clientConfig as { notify: { email?: string[] } };
const originalNotify = cfg.notify;

setupTestDb();

describe('ContactFormService.submit', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(Mailer, 'send').mockResolvedValue(undefined);
    delete process.env.PREVIEW_MODE;
    cfg.notify = { email: ['owner@test.example'] };
    resetConfigCache();
  });

  afterEach(() => {
    delete process.env.PREVIEW_MODE;
    cfg.notify = originalNotify;
    resetConfigCache();
  });

  it('stores the submission, creates a contact and notifies the owner', async () => {
    await ContactFormService.submit({ name: 'Mandy', phone: '6123 4567', message: 'Is Saturday free?', locale: 'zh-Hant' });
    const subs = await ContactFormService.listRecent();
    expect(subs).toHaveLength(1);
    expect(subs[0].phone).toBe('+85261234567');
    const contacts = await CrmService.listContacts({});
    expect(contacts.items[0].source).toBe('form');
    expect(Mailer.send).toHaveBeenCalledWith(expect.objectContaining({ to: ['owner@test.example'] }));
  });

  it('links repeat enquiries to the same contact', async () => {
    await ContactFormService.submit({ name: 'Mandy', phone: '61234567', message: 'one' });
    await ContactFormService.submit({ name: 'Mandy Ho', phone: '+852 6123 4567', message: 'two' });
    const subs = await ContactFormService.listRecent();
    expect(subs[0].contactId).toBe(subs[1].contactId);
    expect((await CrmService.listContacts({})).total).toBe(1);
  });

  it('silently drops honeypot submissions', async () => {
    await ContactFormService.submit({ name: 'Bot', email: 'b@x.com', message: 'spam', website: 'http://spam' });
    expect(await ContactFormService.listRecent()).toHaveLength(0);
    expect(Mailer.send).not.toHaveBeenCalled();
  });

  it('stores nothing in preview mode', async () => {
    process.env.PREVIEW_MODE = '1';
    resetConfigCache();
    await ContactFormService.submit({ name: 'Visitor', email: 'v@x.com', message: 'hi' });
    expect(await ContactFormService.listRecent()).toHaveLength(0);
  });

  it('still succeeds when the notification email fails', async () => {
    jest.spyOn(Mailer, 'send').mockRejectedValue(new Error('smtp down'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(ContactFormService.submit({ name: 'A', email: 'a@x.com', message: 'hi' })).resolves.toEqual({ accepted: true });
    expect(await ContactFormService.listRecent()).toHaveLength(1);
  });

  it('requires phone or email and a message', async () => {
    await expect(ContactFormService.submit({ name: 'A', message: 'hi' })).rejects.toThrow('Invalid input');
    await expect(ContactFormService.submit({ name: 'A', email: 'a@x.com', message: '' })).rejects.toThrow('Invalid input');
  });

  it('marks submissions handled', async () => {
    await ContactFormService.submit({ name: 'A', email: 'a@x.com', message: 'hi' });
    const [sub] = await ContactFormService.listRecent();
    await ContactFormService.setHandled(sub.id, true);
    expect(await ContactFormService.countUnhandled()).toBe(0);
  });
});
