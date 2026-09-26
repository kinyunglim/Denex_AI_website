#!/usr/bin/env node
/**
 * Local check of the showcase deployment: serves the production build made with
 *   SHOWCASE_MODE=1 NEXT_DIST_DIR=.next-showcase next build
 * on port 3500 with SHOWCASE_MODE=1 and no database, like the Vercel demo.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const next = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
const env = { ...process.env, SHOWCASE_MODE: '1', NEXT_DIST_DIR: '.next-showcase', MONGODB_URI: '' };
spawn(process.execPath, [next, 'start', '-p', '3500'], { cwd: root, env, stdio: 'inherit' }).on('exit', (code) => process.exit(code ?? 0));
