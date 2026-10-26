#!/usr/bin/env node
/**
 * Lightweight regression guards for critical analyzer failure modes.
 * These are source-level checks, not a substitute for browser/audio integration tests.
 */
import fs from "node:fs";
import assert from "node:assert/strict";

const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const checks = [
  ["recording requires explicit gender", /Selecciona Hombre o Mujer antes de grabar\./.test(source)],
  ["analysis requires explicit gender", /Selecciona Hombre o Mujer antes de analizar el audio\./.test(source)],
  ["insufficient pitch frames fail clearly", /if\s*\(pitches\.length\s*<\s*5\)\s*\{\s*throw new Error\(/.test(source)],
  ["synthetic 150 Hz pitch is absent", !/pitches\.push\(150\)/.test(source)],
  ["network failure is caught for local fallback", /catch\s*\(networkError\)[\s\S]{0,500}Backend \/analyze no disponible/.test(source)],
  ["missing, failed, invalid, or application-error response activates local fallback", /if\s*\(!resp\s*\|\|\s*!resp\.ok\s*\|\|\s*!data\s*\|\|\s*data\.status\s*===\s*"error"\)/.test(source)],
  ["backend wake-up retries are bounded", /const maxRetries\s*=\s*6/.test(source) && /controller\.abort\(\),\s*2500/.test(source)]
];

for (const [name, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
}
assert.ok(checks.every(([, passed]) => passed), "Analyzer regression guard failed");
console.log(`All ${checks.length} analyzer source guards passed. Browser/audio tests are still required.`);
