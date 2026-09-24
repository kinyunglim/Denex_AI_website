'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/src/lib/admin-session';
import { requireModule } from '@/src/lib/modules';
import { ActionResult, runAction, str, tagsOf } from '@/src/lib/action';
import { ValidationError } from '@/src/lib/errors';
import { getConfig } from '@/src/lib/site';
import { zonedDateAtMinutes } from '@/src/lib/time';
import { CrmService } from '@/src/modules/crm/crm.service';
import { ContactStatus } from '@/src/modules/crm/crm.model';
import { ContactFormService } from '@/src/modules/contact-form/contact-form.service';
import { ImportExportService } from '@/src/modules/import-export/import-export.service';
import { IMPORT_FIELDS, ImportMapping } from '@/src/modules/import-export/import.model';
import { BookingService } from '@/src/modules/booking/booking.service';
import { AppointmentStatus, WorkingHours } from '@/src/modules/booking/booking.model';
import { PaymentsService } from '@/src/modules/payments/payments.service';
import { PaymentMethod } from '@/src/modules/payments/payments.model';
import { StripeService } from '@/src/modules/stripe/stripe.service';
import { CatalogService } from '@/src/modules/catalog/catalog.service';
import { AdminService } from '@/src/services/admin.service';
import { AdminRole } from '@/src/models/admin-user';

type Prev = ActionResult | null;

/** "YYYY-MM-DDTHH:mm" from <input type="datetime-local"> in the business time zone → Date. */
function localDateTime(value: string): Date {
  const m = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
  if (!m) throw new ValidationError('Invalid date/time');
  return zonedDateAtMinutes(m[1], Number(m[2]) * 60 + Number(m[3]), getConfig().timezone);
}

/** Parses "1 10:00-19:00" lines into weekly working hours. */
function parseHours(text: string): WorkingHours[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^([0-6])\s+(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
      if (!m) throw new ValidationError(`Cannot read hours line "${line}"`);
      return { weekday: Number(m[1]), startMin: Number(m[2]) * 60 + Number(m[3]), endMin: Number(m[4]) * 60 + Number(m[5]) };
    });
}

/** Parses "Label: value" lines into product specs. */
function parseSpecs(text: string): { label: string; value: string }[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.search(/[:：]/);
      if (i < 1) throw new ValidationError(`Cannot read spec line "${line}"`);
      return { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() };
    });
}

// ---------------- contacts ----------------

export async function createContactAction(_: Prev, form: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const s = await requireAdmin();
    const c = await CrmService.createContact(
      { name: str(form, 'name'), phone: str(form, 'phone'), email: str(form, 'email'), whatsapp: str(form, 'whatsapp'), tags: tagsOf(str(form, 'tags')), status: (str(form, 'status') || 'lead') as ContactStatus },
      s.name
    );
    revalidatePath('/admin/contacts');
    return `✓ ${c.name}`;
  });
}

export async function updateContactAction(id: string, _: Prev, form: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();
    await CrmService.updateContact(id, {
      name: str(form, 'name'),
      phone: str(form, 'phone'),
      email: str(form, 'email'),
      whatsapp: str(form, 'whatsapp'),
      tags: tagsOf(str(form, 'tags')),
      status: str(form, 'status') as ContactStatus,
    });
    revalidatePath(`/admin/contacts/${id}`);
    return '✓';
  });
}

export async function deleteContactAction(id: string): Promise<ActionResult> {
  const result = await runAction(async () => {
    await requireAdmin('owner');
    await CrmService.deleteContact(id);
    return '✓';
  });
  if (result.ok) redirect('/admin/contacts');
  return result;
}

export async function addNoteAction(id: string, _: Prev, form: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const s = await requireAdmin();
    await CrmService.addNote(id, { body: str(form, 'body') }, s.name);
    revalidatePath(`/admin/contacts/${id}`);
    return '✓';
  });
}

// ---------------- inbox ----------------

export async function setSubmissionHandledAction(id: string, handled: boolean): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();
    await ContactFormService.setHandled(id, handled);
    revalidatePath('/admin/inbox');
    revalidatePath('/admin');
    return '✓';
  });
}

export async function setInquiryHandledAction(id: string, handled: boolean): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();
    await CatalogService.setInquiryHandled(id, handled);
    revalidatePath('/admin/inbox');
    return '✓';
  });
}

// ---------------- import ----------------

export async function previewImportAction(_: Prev, form: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const s = await requireAdmin('owner');
    const file = form.get('file');
    if (!(file instanceof File) || file.size === 0) throw new ValidationError('Choose a file first');
    if (file.size > 10 * 1024 * 1024) throw new ValidationError('File is larger than 10 MB');
    const preview = await ImportExportService.previewImport(Buffer.from(await file.arrayBuffer()), file.name, s.name);
    return { message: `${preview.totalRows} rows`, data: preview };
  });
}

export async function commitImportAction(jobId: string, _: Prev, form: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin('owner');
    const mapping: ImportMapping = {};
    for (const field of IMPORT_FIELDS) {
      const v = str(form, `map_${field}`);
      if (v !== '') mapping[field] = Number(v);
    }
    const result = await ImportExportService.commitImport(jobId, { mapping });
    revalidatePath('/admin/contacts');
    return { message: `✓ ${result.rowsOk} / ✗ ${result.rowsFailed}`, data: result };
  });
}

// ---------------- bookings ----------------

export async function createBookingAction(_: Prev, form: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const s = await requireAdmin();
    requireModule('booking');
    await BookingService.bookByAdmin(
      {
        serviceId: str(form, 'serviceId'),
        staffId: str(form, 'staffId'),
        contactId: str(form, 'contactId'),
        start: localDateTime(str(form, 'start')),
        notes: str(form, 'notes'),
      },
      s.name
    );
    revalidatePath('/admin/bookings');
    return '✓';
  });
}

export async function setAppointmentStatusAction(id: string, status: AppointmentStatus): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();
    await BookingService.setStatus(id, status);
    revalidatePath('/admin/bookings');
    return '✓';
  });
}

function serviceFromForm(form: FormData) {
  return {
    name: { 'zh-Hant': str(form, 'name_zhHant'), 'zh-Hans': str(form, 'name_zhHans'), en: str(form, 'name_en') },
    durationMin: str(form, 'durationMin'),
    price: str(form, 'price') || '0',
    order: str(form, 'order') || '0',
    active: form.get('active') === 'on',
  };
}

export async function createServiceAction(_: Prev, form: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const s = await requireAdmin('owner');
    await BookingService.createService(serviceFromForm(form), s.name);
    revalidatePath('/admin/bookings/setup');
    return '✓';
  });
}

export async function updateServiceAction(id: string, _: Prev, form: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin('owner');
    await BookingService.updateService(id, serviceFromForm(form));
    revalidatePath('/admin/bookings/setup');
    return '✓';
  });
}

function staffFromForm(form: FormData) {
  return {
    name: str(form, 'name'),
    serviceIds: form.getAll('serviceIds').map(String),
    hours: parseHours(str(form, 'hours')),
    active: form.get('active') === 'on',
  };
}

export async function createStaffAction(_: Prev, form: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const s = await requireAdmin('owner');
    await BookingService.createStaff(staffFromForm(form), s.name);
    revalidatePath('/admin/bookings/setup');
    return '✓';
  });
}

export async function updateStaffAction(id: string, _: Prev, form: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin('owner');
    await BookingService.updateStaff(id, staffFromForm(form));
    revalidatePath('/admin/bookings/setup');
    return '✓';
  });
}

export async function addAwayAction(_: Prev, form: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const s = await requireAdmin();
    await BookingService.addAway(
      { staffId: str(form, 'staffId'), start: localDateTime(str(form, 'start')), end: localDateTime(str(form, 'end')), reason: str(form, 'reason') },
      s.name
    );
    revalidatePath('/admin/bookings/setup');
    return '✓';
  });
}

export async function removeAwayAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();
    await BookingService.removeAway(id);
    revalidatePath('/admin/bookings/setup');
    return '✓';
  });
}

// ---------------- payments ----------------

export async function recordPaymentAction(_: Prev, form: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const s = await requireAdmin('owner');
    requireModule('payments');
    const p = await PaymentsService.record(
      {
        contactId: str(form, 'contactId'),
        amount: str(form, 'amount'),
        method: str(form, 'method') as PaymentMethod,
        ref: str(form, 'ref'),
        description: str(form, 'description'),
        appointmentId: str(form, 'appointmentId'),
        paidAt: str(form, 'paidAt') || undefined,
      },
      s.name
    );
    revalidatePath('/admin/payments');
    revalidatePath(`/admin/contacts/${str(form, 'contactId')}`);
    return `✓ ${p.receiptNo}`;
  });
}

export async function createStripeLinkAction(_: Prev, form: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const s = await requireAdmin('owner');
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const link = await StripeService.createCheckoutLink(
      { contactId: str(form, 'contactId'), amount: str(form, 'amount'), description: str(form, 'description') },
      s.name,
      `${base}/${getConfig().locales[0]}`
    );
    revalidatePath('/admin/payments');
    return { message: link.url, data: link };
  });
}

// ---------------- products ----------------

function productFromForm(form: FormData) {
  return {
    name: { 'zh-Hant': str(form, 'name_zhHant'), 'zh-Hans': str(form, 'name_zhHans'), en: str(form, 'name_en') },
    description: { 'zh-Hant': str(form, 'desc_zhHant'), 'zh-Hans': str(form, 'desc_zhHans'), en: str(form, 'desc_en') },
    category: str(form, 'category'),
    image: str(form, 'image'),
    specs: parseSpecs(str(form, 'specs')),
    order: str(form, 'order') || '0',
    active: form.get('active') === 'on',
  };
}

export async function createProductAction(_: Prev, form: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const s = await requireAdmin();
    await CatalogService.createProduct(productFromForm(form), s.name);
    revalidatePath('/admin/products');
    return '✓';
  });
}

export async function updateProductAction(id: string, _: Prev, form: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin();
    await CatalogService.updateProduct(id, productFromForm(form));
    revalidatePath('/admin/products');
    return '✓';
  });
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin('owner');
    await CatalogService.deleteProduct(id);
    revalidatePath('/admin/products');
    return '✓';
  });
}

// ---------------- team ----------------

export async function createAdminAction(_: Prev, form: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requireAdmin('owner');
    const a = await AdminService.create({ email: str(form, 'email'), name: str(form, 'name'), password: str(form, 'password'), role: str(form, 'role') as AdminRole });
    revalidatePath('/admin/team');
    return `✓ ${a.email}`;
  });
}

export async function updateAdminAction(id: string, _: Prev, form: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const s = await requireAdmin('owner');
    await AdminService.update(
      id,
      { role: str(form, 'role') as AdminRole, isActive: form.get('isActive') === 'on', ...(str(form, 'password') ? { password: str(form, 'password') } : {}) },
      s.adminId
    );
    revalidatePath('/admin/team');
    return '✓';
  });
}

export async function deleteAdminAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const s = await requireAdmin('owner');
    await AdminService.remove(id, s.adminId);
    revalidatePath('/admin/team');
    return '✓';
  });
}
