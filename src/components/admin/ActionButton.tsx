'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ActionResult } from '@/src/lib/action';

/** One-click server action (mark handled, change status, delete…). */
export function ActionButton({
  action,
  label,
  confirm,
  className = 'btn-ghost !px-3 !py-1.5 text-xs',
}: {
  action: () => Promise<ActionResult>;
  label: string;
  confirm?: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState('');

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        className={className}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          start(async () => {
            const result = await action();
            setError(result.ok ? '' : result.error);
            router.refresh();
          });
        }}
      >
        {pending ? '…' : label}
      </button>
      {error && <span className="text-xs text-primary" role="alert">{error}</span>}
    </span>
  );
}
