import { agency, AddOn, ModuleKey, Package, Text } from '@/agency.config';
import { ValidationError } from '@/src/lib/errors';

/**
 * Turns a package + add-on selection into priced lines and the module list
 * for the client's site. Pure — used by the order form (live total), the API
 * (authoritative total) and tests.
 */
export type QuoteLine = { key: string; name: Text; qty: number; oneOff: number; monthly: number; auto?: boolean };
export type Quote = {
  packageKey: string;
  lines: QuoteLine[];
  oneOff: number;
  monthly: number;
  deposit: number;
  currency: string;
  modules: ModuleKey[];
  deliveryDays: number;
};

const MODULE_DEPS: Partial<Record<ModuleKey, ModuleKey>> = { stripe: 'payments', gcal: 'booking' };

/** Languages included before the "extra language" add-on applies. */
export function includedLanguages(pkg: Package): number {
  return pkg.key === 'pro' ? 3 : 2;
}

export function findPackage(key: string): Package {
  const pkg = agency.packages.find((p) => p.key === key);
  if (!pkg) throw new ValidationError(`Unknown package "${key}"`);
  return pkg;
}

export function quote(packageKey: string, addOnKeys: string[], languageCount: number): Quote {
  const pkg = findPackage(packageKey);
  const addOns = agency.addOns as AddOn[];
  const byKey = new Map(addOns.map((a) => [a.key, a]));
  const modules = new Set<ModuleKey>(pkg.modules);
  const lines: QuoteLine[] = [{ key: pkg.key, name: pkg.name, qty: 1, oneOff: pkg.oneOff, monthly: pkg.monthly }];

  const selected = new Set(addOnKeys.filter((k) => k !== 'language'));
  for (const k of selected) if (!byKey.has(k)) throw new ValidationError(`Unknown add-on "${k}"`);

  // Pull in module dependencies (e.g. Stripe needs Payments).
  for (const k of [...selected]) {
    const mod = byKey.get(k)?.module;
    const dep = mod ? MODULE_DEPS[mod] : undefined;
    if (dep && !modules.has(dep)) selected.add(dep);
  }

  for (const k of selected) {
    const a = byKey.get(k)!;
    if (a.module && modules.has(a.module)) continue; // already in the package
    if (a.module) modules.add(a.module);
    const auto = !addOnKeys.includes(k);
    lines.push({ key: a.key, name: a.name, qty: 1, oneOff: a.oneOff, monthly: a.monthly, ...(auto ? { auto } : {}) });
  }

  const extraLangs = Math.max(0, languageCount - includedLanguages(pkg));
  if (extraLangs > 0) {
    const lang = byKey.get('language')!;
    lines.push({ key: 'language', name: lang.name, qty: extraLangs, oneOff: lang.oneOff * extraLangs, monthly: 0, auto: true });
  }

  const oneOff = lines.reduce((s, l) => s + l.oneOff, 0);
  const monthly = lines.reduce((s, l) => s + l.monthly, 0);
  return {
    packageKey: pkg.key,
    lines,
    oneOff,
    monthly,
    deposit: Math.round(oneOff * agency.depositRate),
    currency: agency.currency,
    modules: [...modules],
    deliveryDays: pkg.deliveryDays + (modules.has('mobile') && !pkg.modules.includes('mobile') ? 30 : 0),
  };
}
