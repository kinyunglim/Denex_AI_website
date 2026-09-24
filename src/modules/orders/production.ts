import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { WithId } from 'mongodb';
import type { Order } from './orders.model';
import { OrdersService, toAnswers } from './orders.service';

/**
 * Builds an approved order: writes answers.json and runs client-starter's
 * `scripts/new-client.mjs`, which copies, configures and verifies a new repo.
 */
export type RunResult = { code: number; output: string };
export type Runner = (cmd: string, args: string[], cwd: string) => Promise<RunResult>;

export const nodeRunner: Runner = (cmd, args, cwd) =>
  new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, shell: false });
    let output = '';
    child.stdout.on('data', (d) => (output += d.toString()));
    child.stderr.on('data', (d) => (output += d.toString()));
    child.on('error', (e) => resolve({ code: 1, output: `${output}\n${e.message}` }));
    child.on('close', (code) => resolve({ code: code ?? 1, output }));
  });

export type ProductionPaths = { starterDir: string; clientsDir: string; workDir: string };

export type ProductionResult = { ok: boolean; dest: string | null; log: string; error: string | null };

export async function buildOrder(order: WithId<Order>, paths: ProductionPaths, run: Runner = nodeRunner): Promise<ProductionResult> {
  const answers = toAnswers(order);
  let slug = answers.slug;
  // Avoid clobbering an existing client with the same slug.
  const { existsSync } = await import('node:fs');
  if (existsSync(path.join(paths.clientsDir, slug))) slug = `${slug}-${order.ref.toLowerCase()}`;
  answers.slug = slug;

  await mkdir(paths.workDir, { recursive: true });
  const answersPath = path.join(paths.workDir, `${order.ref}.answers.json`);
  await writeFile(answersPath, JSON.stringify(answers, null, 2) + '\n');
  const dest = path.join(paths.clientsDir, slug);

  const result = await run(process.execPath, [path.join(paths.starterDir, 'scripts', 'new-client.mjs'), '--answers', answersPath, '--dest', dest], paths.starterDir);
  const lastLine = result.output.trim().split(/\r?\n/).pop() ?? '';
  let summary: { ok?: boolean; step?: string } = {};
  try {
    summary = JSON.parse(lastLine);
  } catch {
    /* non-JSON tail → treated as failure below */
  }
  const ok = result.code === 0 && summary.ok === true;
  return { ok, dest: ok ? dest : null, log: result.output, error: ok ? null : `new-client failed${summary.step ? ` at "${summary.step}"` : ''} (exit ${result.code})` };
}

/** Claims and builds one approved order. Returns false when there was nothing to do. */
export async function processNext(paths: ProductionPaths, worker: string, run: Runner = nodeRunner): Promise<boolean> {
  const order = await OrdersService.claimNext(worker);
  if (!order) return false;
  let result: ProductionResult;
  try {
    result = await buildOrder(order, paths, run);
  } catch (error) {
    result = { ok: false, dest: null, log: '', error: error instanceof Error ? error.message : String(error) };
  }
  await OrdersService.finish(order, result.ok, result.dest, result.log, result.error);
  return true;
}
