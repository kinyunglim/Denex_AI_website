import { z } from 'zod';
import { ObjectId } from 'mongodb';

/**
 * `import_jobs`: an uploaded sheet waiting for column mapping, then its result.
 */
export const IMPORT_FIELDS = ['name', 'phone', 'email', 'whatsapp', 'tags', 'status'] as const;
export type ImportField = (typeof IMPORT_FIELDS)[number];

export type ImportMapping = Partial<Record<ImportField, number>>;

export const ImportJobSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  filename: z.string(),
  target: z.literal('contacts'),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
  mapping: z.record(z.string(), z.number()),
  status: z.enum(['preview', 'committed']),
  rowsOk: z.number(),
  rowsCreated: z.number(),
  rowsFailed: z.number(),
  errors: z.array(z.object({ row: z.number(), message: z.string() })),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
});
export type ImportJob = z.infer<typeof ImportJobSchema>;

export const CommitImportSchema = z.object({
  mapping: z.partialRecord(z.enum(IMPORT_FIELDS), z.number().int().min(0)),
});

export type ImportPreview = {
  id: string;
  filename: string;
  headers: string[];
  sample: string[][];
  totalRows: number;
  mapping: ImportMapping;
};

export type ImportResult = {
  id: string;
  rowsOk: number;
  rowsCreated: number;
  rowsFailed: number;
  errors: { row: number; message: string }[];
};
