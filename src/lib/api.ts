import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError, ValidationError } from '@/src/lib/errors';

/**
 * Uniform API responses: `{ ok: true, data }` or `{ ok: false, error }`.
 */
export type ApiSuccess<T> = { ok: true; data: T };
export type ApiFailure = {
  ok: false;
  error: { code: string; message: string; fields?: Record<string, string[]> };
};
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(error: unknown): NextResponse<ApiFailure> {
  if (error instanceof AppError) {
    return NextResponse.json(
      { ok: false, error: { code: error.code, message: error.message, fields: error.fields } },
      { status: error.status }
    );
  }
  console.error('[API] Unhandled error:', error);
  return NextResponse.json(
    { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
    { status: 500 }
  );
}

/** Runs a route body and converts thrown errors into the uniform failure shape. */
export async function handle<T>(fn: () => Promise<T>, status = 200): Promise<NextResponse> {
  try {
    return ok(await fn(), status);
  } catch (error) {
    return fail(error);
  }
}

/** Zod-parses a payload, throwing ValidationError with per-field messages. */
export function parseInput<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const fields: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || '_';
      (fields[key] ??= []).push(issue.message);
    }
    throw new ValidationError('Invalid input', fields);
  }
  return result.data;
}

/** Reads a JSON body, treating malformed JSON as a validation error. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ValidationError('Body must be valid JSON');
  }
}
