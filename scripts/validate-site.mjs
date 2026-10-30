// Stack Atlas content and rendering regression guard. No third-party packages needed.
import { readFileSync } from 'node:fs';
import { Script, createContext } from 'node:vm';

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

/* Desktop list must be independently scrollable all the way to the last question.
 * This guards the prior clipping bug caused by a max-height-only flex container. */
const mysqlQuestions=questions.filter(q=>q.category==='mysql');
if(!mysqlQuestions.some(q=>q.id==='M15'))
  fail('M15 missing from MySQL seed data');
const desktopListRules=[
 ['explicit desktop scroll height','Desktop library scrollbar fix'],
 ['scrolling flex sizing','flex:1 1 0%'],
 ['allow internal list to shrink','min-height:0'],
 ['native vertical scrolling','overflow-y:auto'],
 ['list end marker','已到题目列表底部']
];
for(const [name,needle] of desktopListRules)
  if(!html.includes(needle))fail('Desktop question list regression: '+name);

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

/* Diagram registry regression check: all public question-to-diagram bindings
 * must be reviewed and all diagram modes must render without errors. */
const audit = JSON.parse(readFileSync('diagrams/audit-map.json','utf8'));
const bindings = Object.fromEntries(questions.filter(q=>q.diagram).map(q=>[q.id,q.diagram]));
if(JSON.stringify(bindings)!==JSON.stringify(audit.bindings))
  fail('Diagram binding changed without updating diagrams/audit-map.json');
if(Object.keys(bindings).length !== audit.withDiagrams)
  fail('Diagram audit count does not match current question data');
const mainScripts = [...html.matchAll(scriptRegex)].map(m=>m[1]);
const diagramContext=createContext({window:{},console});
new Script(mainScripts[1],{filename:'base-diagrams.js'}).runInContext(diagramContext,{timeout:2000});
const modulePaths=[...html.matchAll(/<script src="([^"]+)"\s*><\/script>/g)].map(m=>m[1]);
const expectedPaths=[
 './diagrams/engine.js','./diagrams/topics-backend.js',
 './diagrams/topics-web3.js','./diagrams/topics-ethereum.js',
 './diagrams/topics-analytics.js','./diagrams/topics-special.js',
 './diagrams/topics-interview-feedback.js'
];
if(JSON.stringify(modulePaths)!==JSON.stringify(expectedPaths))
 fail('External diagram script load order changed or module missing');
for(const path of modulePaths){
 const code=readFileSync(path.replace(/^\.\//,''),'utf8');
 new Script(code,{filename:path}).runInContext(diagramContext,{timeout:2000});
}
const diagrams=diagramContext.window.STACK_DIAGRAMS;
const registry=diagramContext.window.StackAtlasExtra?.registry;
if(!diagrams?.meta || !registry)fail('Diagram extension failed to register');
const grouped={};
for(const q of questions){
 if(!q.diagram)continue;
 if(!diagrams.meta[q.diagram])fail(q.id+' references an unavailable diagram: '+q.diagram);
 (grouped[q.diagram]??=[]).push(q.id);
 try{
  const current=diagrams.render(q.diagram,diagrams.defaults);
  if(!current.includes('diagram-card')||current.includes('undefined')||current.includes('NaN'))
   fail(q.id+' diagram output invalid');
  if(registry[q.diagram]){
   for(const option of registry[q.diagram].states){
    const states={...diagrams.defaults,[q.diagram]:option.id};
    if(!diagrams.render(q.diagram,states).includes(option.title))
     fail(q.id+' diagram option failed '+option.id);
   }
  }
 }catch(e){fail(q.id+' diagram rendering failed: '+e.message)}
}
const repeated=Object.fromEntries(Object.entries(grouped).filter(([k,v])=>v.length>1));
if(JSON.stringify(repeated)!==JSON.stringify(audit.intentionalReuse))
 fail('Duplicate diagram reuse must be documented in audit-map.json');
if(!html.includes('diagrams/extra.css'))fail('Extended diagram stylesheet missing');

console.log('Stack Atlas OK: ' + questions.length + ' unique questions; ' + count + ' main scripts; '+careerScripts.length+' career scripts; '+Object.keys(grouped).length+' audited diagrams; responsive navigation and Markdown checks passed.');

