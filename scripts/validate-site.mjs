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

const career = readFileSync('career.html', 'utf8');
const careerScripts = [...career.matchAll(scriptRegex)];
if (careerScripts.length < 1) fail('Career archive scripts missing');
for (const [index, match] of careerScripts.entries()) {
 try { new Script(match[1], { filename: 'career-inline-' + index + '.js' }); }
 catch(e) { fail('Invalid career JavaScript '+index+': '+e.message); }
}
const mobileRequirements = [
 ['Main mobile bottom nav','mobile-bottom-nav'],
 ['Mobile question browse mode','mobile-browsing'],
 ['Mobile dedicated reading mode','mobile-reading'],
 ['Mobile back action',"case 'mobile-back'"],
 ['Mobile search focus preserving','refreshLibrary(true)'],
 ['Scrollable mobile technical diagrams','.diagram-visual>svg{min-width:540px']
];
for(const [name, needle] of mobileRequirements) if(!html.includes(needle)) fail(name+' missing');
const careerRequirements = [
 ['Document drawer','career-drawer-open'],
 ['Collapsible document TOC','mobile-toc'],
 ['Drawer dismiss', 'closeMobilePanels()'],
 ['Mobile font and overflow','@media(max-width:760px)']
];
for(const [name,needle] of careerRequirements) if(!career.includes(needle)) fail(name+' missing');
console.log('Stack Atlas OK: ' + questions.length + ' unique questions; ' + count + ' main scripts; '+careerScripts.length+' career scripts; responsive navigation and Markdown checks passed.');

