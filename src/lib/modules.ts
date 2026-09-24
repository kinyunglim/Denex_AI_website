import { notFound } from 'next/navigation';
import { ModuleName } from '@/src/lib/config';
import { getConfig } from '@/src/lib/site';
import { NotFoundError } from '@/src/lib/errors';

/**
 * Module on/off switches.
 * Approach: all module code ships in every client repo; disabled modules are
 * unreachable (pages 404, APIs 404, hidden from the admin sidebar).
 */
export function isEnabled(name: ModuleName): boolean {
  return getConfig().modules[name];
}

/** For pages/layouts: render the 404 page when the module is off. */
export function requireModulePage(name: ModuleName): void {
  if (!isEnabled(name)) notFound();
}

/** For API routes and services: throw a 404 error when the module is off. */
export function requireModule(name: ModuleName): void {
  if (!isEnabled(name)) throw new NotFoundError(`Module "${name}" is not enabled`);
}
