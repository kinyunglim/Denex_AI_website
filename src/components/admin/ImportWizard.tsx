'use client';

import { useActionState } from 'react';
import type { ActionResult } from '@/src/lib/action';
import type { ImportPreview, ImportResult } from '@/src/modules/import-export/import.model';
import { commitImportAction, previewImportAction } from '@/app/admin/(app)/actions';

type S = Record<'upload' | 'uploadHint' | 'mapColumns' | 'notMapped' | 'commit' | 'rowsOk' | 'rowsCreated' | 'rowsFailed' | 'row' | 'name' | 'phone' | 'email' | 'whatsapp' | 'tags' | 'status', string>;
const FIELDS = ['name', 'phone', 'email', 'whatsapp', 'tags', 'status'] as const;

/** Upload → preview & map columns → import → per-row report. */
export function ImportWizard({ s }: { s: S }) {
  const [previewState, previewAction, previewing] = useActionState(previewImportAction, null);
  const preview = previewState?.ok ? (previewState.data as ImportPreview) : null;

  return (
    <div className="space-y-6">
      <form action={previewAction} className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">{s.upload}</span>
          <input type="file" name="file" accept=".xlsx,.csv" required className="field" />
          <span className="mt-1 block text-xs text-muted">{s.uploadHint}</span>
        </label>
        <button type="submit" className="btn-primary" disabled={previewing}>{previewing ? '…' : '→'}</button>
        {previewState && !previewState.ok && <p className="text-sm text-primary" role="alert">{previewState.error}</p>}
      </form>
      {preview && <Mapping key={preview.id} preview={preview} s={s} />}
    </div>
  );
}

function Mapping({ preview, s }: { preview: ImportPreview; s: S }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(commitImportAction.bind(null, preview.id), null);
  const result = state?.ok ? (state.data as ImportResult) : null;

  if (result) {
    return (
      <div className="space-y-3" role="status">
        <p className="text-sm text-ink">
          {s.rowsOk}: <b>{result.rowsOk}</b> · {s.rowsCreated}: <b>{result.rowsCreated}</b> · {s.rowsFailed}: <b>{result.rowsFailed}</b>
        </p>
        {result.errors.length > 0 && (
          <ul className="max-h-64 overflow-y-auto rounded-input border border-line p-3 text-xs text-muted">
            {result.errors.map((e) => <li key={e.row}>{s.row} {e.row}: {e.message}</li>)}
          </ul>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <h3 className="text-base text-ink">{s.mapColumns} — {preview.filename} ({preview.totalRows})</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {FIELDS.map((f) => (
          <label key={f} className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">{s[f]}</span>
            <select name={`map_${f}`} defaultValue={preview.mapping[f] ?? ''} className="field">
              <option value="">{s.notMapped}</option>
              {preview.headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
            </select>
          </label>
        ))}
      </div>
      <div className="overflow-x-auto rounded-input border border-line">
        <table className="w-full text-xs">
          <thead className="bg-surface-alt text-muted"><tr>{preview.headers.map((h, i) => <th key={i} className="px-2 py-1.5 text-left">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {preview.sample.slice(0, 8).map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="px-2 py-1.5 text-ink">{c}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
      {state && !state.ok && <p className="text-sm text-primary" role="alert">{state.error}</p>}
      <button type="submit" className="btn-primary" disabled={pending}>{pending ? '…' : s.commit}</button>
    </form>
  );
}
