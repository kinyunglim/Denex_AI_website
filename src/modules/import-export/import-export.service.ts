import { parseInput } from '@/src/lib/api';
import { ConflictError, NotFoundError, ValidationError } from '@/src/lib/errors';
import { CrmService } from '@/src/modules/crm/crm.service';
import { CONTACT_STATUSES, ContactStatus } from '@/src/modules/crm/crm.model';
import { parseSheet, toXlsx } from './sheet';
import { ImportJobDao } from './import.dao';
import { CommitImportSchema, IMPORT_FIELDS, ImportField, ImportMapping, ImportPreview, ImportResult } from './import.model';

/** Header keywords (EN + 中文) used to guess the column for each field. */
const HEADER_HINTS: Record<ImportField, RegExp> = {
  name: /^(name|full ?name|client|customer|姓名|名稱|名称|客戶|客户|會員|会员)/i,
  phone: /(phone|mobile|tel|電話|电话|手機|手机|聯絡電話)/i,
  email: /(e-?mail|電郵|电邮|郵箱|邮箱)/i,
  whatsapp: /(whats ?app)/i,
  tags: /(tag|label|category|標籤|标签|類別|类别)/i,
  status: /(status|狀態|状态)/i,
};

const STATUS_WORDS: Record<string, ContactStatus> = {
  lead: 'lead', 潛在: 'lead', 潜在: 'lead', active: 'active', 活躍: 'active', 活跃: 'active', inactive: 'inactive', 停用: 'inactive',
};

export function guessMapping(headers: string[]): ImportMapping {
  const mapping: ImportMapping = {};
  const used = new Set<number>();
  // WhatsApp first so a "WhatsApp phone" column is not taken as phone.
  const order: ImportField[] = ['whatsapp', 'email', 'phone', 'name', 'tags', 'status'];
  for (const field of order) {
    const idx = headers.findIndex((h, i) => !used.has(i) && HEADER_HINTS[field].test(h.trim()));
    if (idx >= 0) {
      mapping[field] = idx;
      used.add(idx);
    }
  }
  return mapping;
}

function parseStatus(raw: string): ContactStatus | undefined {
  const key = raw.trim().toLowerCase();
  if ((CONTACT_STATUSES as readonly string[]).includes(key)) return key as ContactStatus;
  return STATUS_WORDS[raw.trim()] ?? STATUS_WORDS[key];
}

/**
 * Excel/CSV import (preview → confirm mapping → commit) and exports.
 */
export class ImportExportService {
  static async previewImport(buffer: Buffer, filename: string, createdBy: string): Promise<ImportPreview> {
    const { headers, rows } = await parseSheet(buffer, filename);
    const mapping = guessMapping(headers);
    const now = new Date();
    const id = await ImportJobDao.insertOne({
      filename,
      target: 'contacts',
      headers,
      rows,
      mapping,
      status: 'preview',
      rowsOk: 0,
      rowsCreated: 0,
      rowsFailed: 0,
      errors: [],
      createdAt: now,
      updatedAt: now,
      createdBy,
    });
    return { id: id.toHexString(), filename, headers, sample: rows.slice(0, 20), totalRows: rows.length, mapping };
  }

  static async commitImport(jobId: string, input: { mapping: ImportMapping }): Promise<ImportResult> {
    const { mapping } = parseInput(CommitImportSchema, input);
    if (mapping.name === undefined) throw new ValidationError('Map a column to "name"');
    if (mapping.phone === undefined && mapping.email === undefined) {
      throw new ValidationError('Map a column to "phone" or "email"');
    }
    const job = await ImportJobDao.findById(jobId);
    if (!job) throw new NotFoundError('Import not found');
    if (job.status === 'committed') throw new ConflictError('This import has already been committed');
    for (const idx of Object.values(mapping)) {
      if (idx >= job.headers.length) throw new ValidationError('Mapping refers to a missing column');
    }

    const cell = (row: string[], field: ImportField) => {
      const idx = mapping[field];
      return idx === undefined ? '' : (row[idx] ?? '').trim();
    };

    let rowsOk = 0;
    let rowsCreated = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < job.rows.length; i++) {
      const row = job.rows[i];
      const excelRow = i + 2; // header is row 1
      const name = cell(row, 'name');
      const phone = cell(row, 'phone');
      const email = cell(row, 'email');
      if (!name) {
        errors.push({ row: excelRow, message: 'Missing name' });
        continue;
      }
      if (!phone && !email) {
        errors.push({ row: excelRow, message: 'Missing phone and email' });
        continue;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push({ row: excelRow, message: `Invalid email: ${email}` });
        continue;
      }
      const tags = cell(row, 'tags').split(/[,，;、]/).map((t) => t.trim()).filter(Boolean);
      try {
        const { contact, created } = await CrmService.findOrCreateContact({
          name,
          phone,
          email,
          whatsapp: cell(row, 'whatsapp'),
          tags,
          source: 'import',
          createdBy: job.createdBy,
        });
        const status = parseStatus(cell(row, 'status'));
        if (created && status && status !== contact.status) {
          await CrmService.updateContact(contact.id, { status });
        }
        rowsOk++;
        if (created) rowsCreated++;
      } catch (error) {
        errors.push({ row: excelRow, message: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    await ImportJobDao.updateById(jobId, {
      mapping,
      status: 'committed',
      rowsOk,
      rowsCreated,
      rowsFailed: errors.length,
      errors,
      rows: [],
      updatedAt: new Date(),
    });
    return { id: jobId, rowsOk, rowsCreated, rowsFailed: errors.length, errors };
  }

  static async exportContacts(): Promise<Buffer> {
    const contacts = await CrmService.allContacts();
    return toXlsx(
      'Contacts',
      [
        { header: 'Name', key: 'name', width: 24 },
        { header: 'Phone', key: 'phone' },
        { header: 'Email', key: 'email', width: 28 },
        { header: 'WhatsApp', key: 'whatsapp' },
        { header: 'Tags', key: 'tags', width: 24 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Source', key: 'source', width: 12 },
        { header: 'Created', key: 'createdAt', width: 22 },
      ],
      contacts.map((c) => ({
        name: c.name,
        phone: c.phone ?? '',
        email: c.email ?? '',
        whatsapp: c.whatsapp ?? '',
        tags: c.tags.join(', '),
        status: c.status,
        source: c.source,
        createdAt: c.createdAt,
      }))
    );
  }

  static fields(): readonly ImportField[] {
    return IMPORT_FIELDS;
  }
}
