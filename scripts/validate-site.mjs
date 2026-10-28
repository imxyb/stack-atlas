// Stack Atlas content and rendering regression guard. No third-party packages needed.
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const html = readFileSync('index.html', 'utf8');
const marker = 'window.STACK_ATLAS_SEED = ';
const start = html.indexOf(marker);
const end = html.indexOf('</script>', start);
const fail = message => { throw new Error('[Stack Atlas validation] ' + message); };
if (start < 0 || end < 0) fail('Missing question seed');
let questions;
try {
  questions = JSON.parse(html.slice(start + marker.length, end).trim().replace(/;\s*$/, ''));
} catch (e) {
  fail('Invalid question JSON: ' + e.message);
}
if (!Array.isArray(questions) || questions.length < 200) fail('Unexpected loss of questions');
const ids = new Set();
for (const q of questions) {
  if (!q.id || !q.category || !q.title || typeof q.answer !== 'string') fail('Invalid question: ' + JSON.stringify(q).slice(0, 100));
  if (ids.has(q.id)) fail('Duplicate question ID: ' + q.id);
  ids.add(q.id);
  let fenced = false;
  for (const line of q.answer.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    // A Markdown heading must begin at the start of its own line.
    // Catches accidentally concatenated text such as "balance。#### 账户模型".
    if (/[^#\n]#{3,4}[ \t]/.test(line)) fail(q.id + ': heading glued to prose: ' + line.slice(0, 100));
  }
  if (fenced) fail(q.id + ': unclosed code fence');
}
const scriptRegex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/g;
let count = 0;
for (const match of html.matchAll(scriptRegex)) {
  try { new Script(match[1], { filename: 'stack-atlas-inline-' + count + '.js' }); }
  catch (e) { fail('Invalid JavaScript script ' + count + ': ' + e.message); }
  count++;
}
if (count < 3) fail('Missing application scripts');
console.log('Stack Atlas OK: ' + questions.length + ' unique questions; ' + count + ' JavaScript scripts; Markdown headings and code fences valid.');
