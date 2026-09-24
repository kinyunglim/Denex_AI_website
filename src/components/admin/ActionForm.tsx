'use client';

import { ReactNode, useActionState, useEffect, useRef } from 'react';
import type { ActionResult } from '@/src/lib/action';

type Props = {
  action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>;
  children: ReactNode;
  submitLabel: string;
  className?: string;
  resetOnSuccess?: boolean;
  confirm?: string;
  submitClassName?: string;
};

/**
 * Wraps a server action with pending state and inline success/error text.
 * Every admin mutation goes through one of these.
 */
export function ActionForm({ action, children, submitLabel, className = 'space-y-3', resetOnSuccess, confirm, submitClassName = 'btn-primary' }: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={ref}
      action={formAction}
      className={className}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={submitClassName}>
          {pending ? '…' : submitLabel}
        </button>
        {state && (
          <span role={state.ok ? 'status' : 'alert'} className={`text-sm ${state.ok ? 'text-muted' : 'text-primary'}`}>
            {state.ok ? state.message : state.error}
          </span>
        )}
      </div>
    </form>
  );
}
