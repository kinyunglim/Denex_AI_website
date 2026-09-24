import ExcelJS from 'exceljs';
import { ValidationError } from '@/src/lib/errors';

/**
 * Spreadsheet read/write helpers (xlsx via exceljs, csv by hand).
 * Pure functions over Buffers so they are easy to test.
 */
export type ParsedSheet = { headers: string[]; rows: string[][] };

const MAX_ROWS = 5000;

function cellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object') {
    if ('text' in value && typeof value.text === 'string') return value.text;
    if ('result' in value && value.result !== undefined && value.result !== null) return String(value.result);
    if ('richText' in value && Array.isArray(value.richText)) return value.richText.map((r) => r.text).join('');
    if ('hyperlink' in value && typeof value.hyperlink === 'string') return value.hyperlink;
    return '';
  }
  return String(value).trim();
}

/** Minimal RFC-4180 CSV parser (quotes, escaped quotes, CRLF). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.map((r) => r.map((c) => c.trim()));
}

function normalise(table: string[][]): ParsedSheet {
  const nonEmpty = table.filter((r) => r.some((c) => c !== ''));
  if (!nonEmpty.length) throw new ValidationError('The file is empty');
  const [headerRow, ...body] = nonEmpty;
  const width = Math.max(headerRow.length, ...body.map((r) => r.length));
  const headers = Array.from({ length: width }, (_, i) => headerRow[i] || `Column ${i + 1}`);
  if (body.length > MAX_ROWS) throw new ValidationError(`Too many rows (max ${MAX_ROWS})`);
  const rows = body.map((r) => Array.from({ length: width }, (_, i) => r[i] ?? ''));
  return { headers, rows };
}

export async function parseSheet(buffer: Buffer, filename: string): Promise<ParsedSheet> {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.csv')) return normalise(parseCsv(buffer.toString('utf8')));
  if (!lower.endsWith('.xlsx')) throw new ValidationError('Please upload an .xlsx or .csv file');

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  } catch {
    throw new ValidationError('Could not read the Excel file');
  }
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new ValidationError('The workbook has no sheets');
  const table: string[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const values = row.values as ExcelJS.CellValue[];
    table.push(values.slice(1).map(cellText));
  });
  return normalise(table);
}

export type XlsxColumn = { header: string; key: string; width?: number };

export async function toXlsx(sheetName: string, columns: XlsxColumn[], rows: Record<string, string | number>[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 20 }));
  sheet.getRow(1).font = { bold: true };
  rows.forEach((r) => sheet.addRow(r));
  const out = await workbook.xlsx.writeBuffer();
  return Buffer.from(out as ArrayBuffer);
}
