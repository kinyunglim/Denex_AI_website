import { z } from 'zod';
import { ObjectId } from 'mongodb';

/**
 * Booking module collections:
 *   booking_services      what can be booked (duration, price)
 *   booking_staff         who can be booked and their weekly hours
 *   booking_away          staff time off
 *   booking_appointments  the bookings themselves (linked to a CRM contact)
 */
const Localized = z.object({
  'zh-Hant': z.string().optional(),
  'zh-Hans': z.string().optional(),
  en: z.string().optional(),
});

const Audit = {
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
};

export const WorkingHoursSchema = z
  .object({
    weekday: z.number().int().min(0).max(6),
    startMin: z.number().int().min(0).max(1440),
    endMin: z.number().int().min(0).max(1440),
  })
  .refine((h) => h.endMin > h.startMin, { message: 'End must be after start' });
export type WorkingHours = z.infer<typeof WorkingHoursSchema>;

export const BookingServiceSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: Localized,
  durationMin: z.number().int().min(5).max(24 * 60),
  price: z.number().min(0),
  active: z.boolean(),
  order: z.number().int(),
  ...Audit,
});
export type BookingService = z.infer<typeof BookingServiceSchema>;

export const StaffSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string().min(1),
  serviceIds: z.array(z.instanceof(ObjectId)),
  hours: z.array(WorkingHoursSchema),
  active: z.boolean(),
  ...Audit,
});
export type Staff = z.infer<typeof StaffSchema>;

export const AwaySchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  staffId: z.instanceof(ObjectId),
  start: z.date(),
  end: z.date(),
  reason: z.string(),
  ...Audit,
});
export type Away = z.infer<typeof AwaySchema>;

export const APPOINTMENT_STATUSES = ['booked', 'cancelled', 'done', 'no-show'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];
/** Statuses that occupy the staff member's time. */
export const BLOCKING_STATUSES: AppointmentStatus[] = ['booked', 'done', 'no-show'];

export const AppointmentSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  contactId: z.instanceof(ObjectId),
  serviceId: z.instanceof(ObjectId),
  staffId: z.instanceof(ObjectId),
  start: z.date(),
  end: z.date(),
  status: z.enum(APPOINTMENT_STATUSES),
  price: z.number(),
  notes: z.string(),
  source: z.enum(['online', 'admin']),
  ...Audit,
});
export type Appointment = z.infer<typeof AppointmentSchema>;

// ---------- Inputs ----------

export const ServiceInputSchema = z.object({
  name: Localized.refine((n) => Object.values(n).some((v) => v && v.trim()), { message: 'Name is required' }),
  durationMin: z.coerce.number().int().min(5).max(24 * 60),
  price: z.coerce.number().min(0),
  active: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
});
export type ServiceInput = z.input<typeof ServiceInputSchema>;

export const StaffInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  serviceIds: z.array(z.string().refine(ObjectId.isValid, { message: 'Invalid service id' })),
  hours: z.array(WorkingHoursSchema),
  active: z.boolean().default(true),
});
export type StaffInput = z.input<typeof StaffInputSchema>;

export const AwayInputSchema = z
  .object({
    staffId: z.string().refine(ObjectId.isValid, { message: 'Invalid staff id' }),
    start: z.coerce.date(),
    end: z.coerce.date(),
    reason: z.string().trim().max(200).default(''),
  })
  .refine((a) => a.end > a.start, { message: 'End must be after start', path: ['end'] });
export type AwayInput = z.input<typeof AwayInputSchema>;

const blank = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

export const PublicBookingSchema = z
  .object({
    serviceId: z.string().refine(ObjectId.isValid, { message: 'Invalid service' }),
    staffId: z.preprocess(blank, z.string().refine(ObjectId.isValid, { message: 'Invalid staff' }).optional()),
    start: z.coerce.date(),
    name: z.string().trim().min(1).max(120),
    phone: z.preprocess(blank, z.string().trim().max(40).optional()),
    email: z.preprocess(blank, z.string().trim().email().optional()),
    notes: z.string().trim().max(1000).default(''),
    locale: z.string().max(10).default('zh-Hant'),
    website: z.string().optional(),
  })
  .refine((v) => v.phone || v.email, { message: 'phoneOrEmail', path: ['phone'] });
export type PublicBookingInput = z.input<typeof PublicBookingSchema>;

export const AdminBookingSchema = z.object({
  serviceId: z.string().refine(ObjectId.isValid),
  staffId: z.string().refine(ObjectId.isValid),
  start: z.coerce.date(),
  contactId: z.string().refine(ObjectId.isValid),
  notes: z.string().trim().max(1000).default(''),
  price: z.coerce.number().min(0).optional(),
});
export type AdminBookingInput = z.input<typeof AdminBookingSchema>;

// ---------- API shapes ----------

export type ServiceSummary = {
  id: string;
  name: { 'zh-Hant'?: string; 'zh-Hans'?: string; en?: string };
  durationMin: number;
  price: number;
  active: boolean;
  order: number;
};

export type StaffSummary = { id: string; name: string; serviceIds: string[]; hours: WorkingHours[]; active: boolean };

export type AwaySummary = { id: string; staffId: string; start: string; end: string; reason: string };

export type AppointmentSummary = {
  id: string;
  contactId: string;
  serviceId: string;
  staffId: string;
  start: string;
  end: string;
  status: AppointmentStatus;
  price: number;
  notes: string;
  source: 'online' | 'admin';
};

export type SlotSummary = { staffId: string; staffName: string; start: string };
