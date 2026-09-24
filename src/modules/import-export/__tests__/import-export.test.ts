import { describe, expect, it } from '@jest/globals';
import ExcelJS from 'exceljs';
import { setupTestDb } from '@/src/test/mongo';
import { parseCsv, parseSheet, toXlsx } from '@/src/modules/import-export/sheet';
import { guessMapping, ImportExportService } from '@/src/modules/import-export/import-export.service';
import { CrmService } from '@/src/modules/crm/crm.service';

setupTestDb();

async function xlsx(rows: (string | number)[][]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet1');
  rows.forEach((r) => ws.addRow(r));
  return Buffer.from((await wb.xlsx.writeBuffer()) as ArrayBuffer);
}

describe('sheet parsing', () => {
  it('parses CSV with quotes and CRLF', () => {
    expect(parseCsv('a,b\r\n"x, y","he said ""hi"""\r\n')).toEqual([['a', 'b'], ['x, y', 'he said "hi"']]);
  });

  it('reads an xlsx and pads short rows', async () => {
    const sheet = await parseSheet(await xlsx([['姓名', '電話', '電郵'], ['陳大文', 91234567], ['Amy', '', 'amy@x.com']]), 'c.xlsx');
    expect(sheet.headers).toEqual(['姓名', '電話', '電郵']);
    expect(sheet.rows).toEqual([['陳大文', '91234567', ''], ['Amy', '', 'amy@x.com']]);
  });

  it('rejects unsupported files', async () => {
    await expect(parseSheet(Buffer.from('x'), 'a.pdf')).rejects.toThrow('.xlsx or .csv');
  });

  it('round-trips an export', async () => {
    const buf = await toXlsx('S', [{ header: 'Name', key: 'name' }], [{ name: 'A' }]);
    const parsed = await parseSheet(buf, 'x.xlsx');
    expect(parsed.rows).toEqual([['A']]);
  });
});

describe('guessMapping', () => {
  it('maps Chinese and English headers', () => {
    expect(guessMapping(['客戶姓名', 'Mobile', 'E-mail', 'WhatsApp', '標籤'])).toEqual({
      name: 0, phone: 1, email: 2, whatsapp: 3, tags: 4,
    });
  });
});

describe('ImportExportService', () => {
  it('previews, then commits with per-row errors and de-duplication', async () => {
    await CrmService.createContact({ name: 'Existing', phone: '91234567' }, 'admin');
    const buf = await xlsx([
      ['Name', 'Phone', 'Email', 'Tags', 'Status'],
      ['Existing Again', '9123 4567', '', 'vip', ''],
      ['New Person', '', 'new@x.com', 'yoga, pt', 'active'],
      ['', '98765432', '', '', ''],
      ['No Contact', '', '', '', ''],
      ['Bad Email', '', 'not-an-email', '', ''],
    ]);
    const preview = await ImportExportService.previewImport(buf, 'clients.xlsx', 'admin');
    expect(preview.totalRows).toBe(5);
    expect(preview.mapping).toEqual({ name: 0, phone: 1, email: 2, tags: 3, status: 4 });

    const result = await ImportExportService.commitImport(preview.id, { mapping: preview.mapping as Record<string, number> });
    expect(result.rowsOk).toBe(2);
    expect(result.rowsCreated).toBe(1);
    expect(result.errors.map((e) => e.row)).toEqual([4, 5, 6]);

    const all = await CrmService.allContacts();
    expect(all).toHaveLength(2);
    const created = all.find((c) => c.email === 'new@x.com');
    expect(created?.tags).toEqual(['yoga', 'pt']);
    expect(created?.status).toBe('active');
    expect(all.find((c) => c.phone === '+85291234567')?.tags).toEqual(['vip']);

    await expect(ImportExportService.commitImport(preview.id, { mapping: { name: 0, phone: 1 } })).rejects.toThrow('already');
  });

  it('requires name and phone/email mappings', async () => {
    const preview = await ImportExportService.previewImport(Buffer.from('A,B\n1,2\n'), 'x.csv', 'admin');
    await expect(ImportExportService.commitImport(preview.id, { mapping: { phone: 1 } })).rejects.toThrow('name');
    await expect(ImportExportService.commitImport(preview.id, { mapping: { name: 0 } })).rejects.toThrow('phone');
  });

  it('exports contacts to xlsx', async () => {
    await CrmService.createContact({ name: 'A', phone: '91111111', tags: ['x'] }, 'admin');
    const parsed = await parseSheet(await ImportExportService.exportContacts(), 'e.xlsx');
    expect(parsed.headers[0]).toBe('Name');
    expect(parsed.rows[0][0]).toBe('A');
  });
});
