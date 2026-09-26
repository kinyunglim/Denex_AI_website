import { ObjectId, WithId } from 'mongodb';
import { parseInput } from '@/src/lib/api';
import { NotFoundError } from '@/src/lib/errors';
import { Mailer } from '@/src/lib/email';
import { getConfig, isPreviewMode, isShowcaseMode } from '@/src/lib/site';
import { pickLocalized } from '@/src/lib/config';
import { CrmService } from '@/src/modules/crm/crm.service';
import { SubmissionDao } from './contact-form.dao';
import { ContactFormInput, ContactFormInputSchema, Submission, SubmissionSummary } from './contact-form.model';

export type SubmitResult = { accepted: true };

/**
 * Public contact form: validate → drop bots → link/create CRM contact →
 * store → notify the owner. Email failure never fails the submission.
 */
export class ContactFormService {
  static toSummary(doc: WithId<Submission>): SubmissionSummary {
    return {
      id: doc._id.toHexString(),
      name: doc.name,
      phone: doc.phone,
      email: doc.email,
      message: doc.message,
      locale: doc.locale,
      contactId: doc.contactId.toHexString(),
      handled: doc.handled,
      createdAt: doc.createdAt.toISOString(),
    };
  }

  static async submit(input: ContactFormInput): Promise<SubmitResult> {
    const data = parseInput(ContactFormInputSchema, input);

    // Bots fill the hidden field; pretend success so they don't retry.
    if (data.website) return { accepted: true };
    // Preview sites are public showcases: accept but store nothing.
    if (isPreviewMode() || isShowcaseMode()) return { accepted: true };

    const { contact } = await CrmService.findOrCreateContact({
      name: data.name,
      phone: data.phone,
      email: data.email,
      locale: data.locale,
      source: 'form',
    });

    const now = new Date();
    await SubmissionDao.insertOne({
      name: data.name,
      phone: contact.phone,
      email: contact.email,
      message: data.message,
      locale: data.locale,
      contactId: new ObjectId(contact.id),
      handled: false,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
    });

    await this.notifyOwner(data.name, contact.phone, contact.email, data.message);
    return { accepted: true };
  }

  static async notifyOwner(name: string, phone: string | null, email: string | null, message: string): Promise<void> {
    const cfg = getConfig();
    if (!cfg.notify.email.length) return;
    const business = pickLocalized(cfg.business.name, cfg.locales[0]);
    try {
      await Mailer.send({
        to: cfg.notify.email,
        replyTo: email ?? undefined,
        subject: `[${business}] 新查詢 New enquiry — ${name}`,
        text: `Name: ${name}\nPhone: ${phone ?? '-'}\nEmail: ${email ?? '-'}\n\n${message}`,
      });
    } catch (error) {
      console.error('[ContactForm] Owner notification failed:', error);
    }
  }

  static async listRecent(limit = 50, onlyUnhandled = false): Promise<SubmissionSummary[]> {
    return (await SubmissionDao.findRecent(limit, onlyUnhandled)).map((d) => this.toSummary(d));
  }

  static async listForContact(contactId: string): Promise<SubmissionSummary[]> {
    return (await SubmissionDao.findByContact(contactId)).map((d) => this.toSummary(d));
  }

  static async countUnhandled(): Promise<number> {
    return SubmissionDao.countUnhandled();
  }

  static async setHandled(id: string, handled: boolean): Promise<void> {
    if (!(await SubmissionDao.setHandled(id, handled))) throw new NotFoundError('Submission not found');
  }
}
