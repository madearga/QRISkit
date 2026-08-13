#!/usr/bin/env node
// Thin bin wrapper — the CLI logic lives in dist/cli.js (built from src/cli.ts).
import { runCli } from "../dist/cli.js";

const r = runCli(process.argv.slice(2));
if (r.stdout) process.stdout.write(r.stdout);
if (r.stderr) process.stderr.write(r.stderr);
process.exit(r.code);
