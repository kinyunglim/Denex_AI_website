import { auth, calendar, calendar_v3 } from '@googleapis/calendar';
import { getDb } from '@/src/lib/mongodb';
import { z } from 'zod';

/**
 * Google Calendar sync for bookings (ported from OnMove lib/google-calendar.ts).
 * Credentials come only from env (GOOGLE_SERVICE_ACCOUNT_JSON + GOOGLE_CALENDAR_ID);
 * when they are missing every call is a no-op, so the module is safe to enable early.
 * `gcal_links` maps appointmentId → Google eventId.
 */
export type SyncInput = {
  appointmentId: string;
  title: string;
  start: Date;
  end: Date;
  cancelled: boolean;
};

type GcalLink = { appointmentId: string; eventId: string; createdAt: Date; updatedAt: Date; createdBy: string };

const CredentialsSchema = z.object({ client_email: z.string(), private_key: z.string() });

/** Minimal surface of the Calendar client that we use (lets tests inject a fake). */
export type EventsApi = Pick<calendar_v3.Resource$Events, 'insert' | 'patch' | 'delete'>;

let injected: EventsApi | null = null;

export class GcalService {
  static isConfigured(): boolean {
    return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON && process.env.GOOGLE_CALENDAR_ID);
  }

  /** Tests only. */
  static setEventsApi(api: EventsApi | null): void {
    injected = api;
  }

  private static events(): EventsApi {
    if (injected) return injected;
    const creds = CredentialsSchema.parse(JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? '{}'));
    const googleAuth = new auth.GoogleAuth({
      credentials: { client_email: creds.client_email, private_key: creds.private_key },
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    return calendar({ version: 'v3', auth: googleAuth }).events;
  }

  private static async links() {
    return (await getDb()).collection<GcalLink>('gcal_links');
  }

  static async syncAppointment(input: SyncInput): Promise<void> {
    if (!injected && !this.isConfigured()) return;
    const calendarId = process.env.GOOGLE_CALENDAR_ID ?? 'primary';
    const links = await this.links();
    const link = await links.findOne({ appointmentId: input.appointmentId });
    const events = this.events();

    if (input.cancelled) {
      if (link) {
        await events.delete({ calendarId, eventId: link.eventId });
        await links.deleteOne({ appointmentId: input.appointmentId });
      }
      return;
    }

    const body: calendar_v3.Schema$Event = {
      summary: input.title,
      start: { dateTime: input.start.toISOString() },
      end: { dateTime: input.end.toISOString() },
    };
    if (link) {
      await events.patch({ calendarId, eventId: link.eventId, requestBody: body });
      await links.updateOne({ appointmentId: input.appointmentId }, { $set: { updatedAt: new Date() } });
      return;
    }
    const res = await events.insert({ calendarId, requestBody: body });
    const eventId = res.data.id;
    if (eventId) {
      const now = new Date();
      await links.insertOne({ appointmentId: input.appointmentId, eventId, createdAt: now, updatedAt: now, createdBy: 'system' });
    }
  }
}
