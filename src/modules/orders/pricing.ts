import { agency, Package, Text, ModuleKey } from '@/agency.config';
import { ValidationError } from '@/src/lib/errors';

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

export function includedLanguages(pkg: Package): number { return pkg.languageCount; }

export function findPackage(key: string): Package {
  const pkg = agency.packages.find(p => p.key === key);
  if (!pkg) throw new ValidationError('無效方案，請重新選擇。 / Unknown package.');
  return pkg;
}

/** Authoritative fixed-package quote shared by the form and order API. */
export function quote(packageKey: string, addOnKeys: string[], languageCount: number): Quote {
  const pkg = findPackage(packageKey);
  if (addOnKeys.length) throw new ValidationError('加購服務已取消，請重新選擇套餐。 / Add-ons are no longer available. Please select a package.');
  if (!Number.isInteger(languageCount) || languageCount < 1 || languageCount > pkg.languageCount) {
    throw new ValidationError('所選語言數量超出方案範圍，請調整或升級。 / Language count exceeds this package.');
  }
  return {
    packageKey: pkg.key,
    lines: [{ key: pkg.key, name: pkg.name, qty: 1, oneOff: pkg.oneOff, monthly: pkg.monthly }],
    oneOff: pkg.oneOff,
    monthly: pkg.monthly,
    deposit: Math.round(pkg.oneOff * agency.depositRate),
    currency: agency.currency,
    modules: [...pkg.modules],
    deliveryDays: pkg.deliveryDays,
  };
}
