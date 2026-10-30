/* Stack Atlas supplemental diagram engine.
 * Each diagram declares the exact concept, scenarios, and teaching boundary.
 * UI tabs are compatible with the existing data-action=diagram router. */
(()=>{
'use strict';
const api=window.STACK_DIAGRAMS;
if(!api)throw Error('Stack Atlas diagrams must load before supplement');
const registry=Object.create(null);
const renderOriginal=api.render.bind(api);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
function register(spec){
 if(!spec||!spec.id||!spec.states?.length)throw Error('Invalid diagram spec');
 if(api.meta[spec.id]||registry[spec.id])throw Error('Duplicate diagram '+spec.id);
 registry[spec.id]=spec;
 api.meta[spec.id]={name:spec.name,sub:spec.sub,tag:spec.tag,color:spec.color||'#b9ec77',description:spec.description,featured:spec.featured};
 api.defaults[spec.id]=spec.states[0].id;
}
function pill(type,state,current){
 return '<div class="diagram-controls">'+type.states.map(x=>'<button class="dctl '+(x.id===current?'active':'')+'" data-action="diagram" data-type="'+esc(type.id)+'" data-value="'+esc(x.id)+'" aria-pressed="'+(x.id===current?'true':'false')+'">'+esc(x.label)+'</button>').join('')+'</div>';
}
function flowView(spec,mode){
 const nodes=mode.nodes||[];
 const layout=mode.layout||spec.layout||'flow';
 const heads=layout==='columns'?'<div class="ex-compare">':'<div class="ex-flow">';
 const body=nodes.map((n,i)=>'<div class="ex-node '+(n.kind||'')+'"><span class="ex-index">'+String(i+1).padStart(2,'0')+'</span><strong>'+esc(n.title)+'</strong><p>'+esc(n.detail||'')+'</p></div>'+(layout==='flow'&&i<nodes.length-1?'<span class="ex-arrow" aria-hidden="true">→</span>':'')).join('');
 return heads+body+'</div>';
}
function nextKeyView(mode){
 const keys=[10,15,20,30],focus=mode.id;
 const lock=focus==='gap'?'gap':focus==='record'?'record':'next';
 const intervals=[{lo:10,hi:15,label:'(10,15)'},{lo:15,hi:20,label:'(15,20)'},{lo:20,hi:30,label:'(20,30)'}];
 return '<div class="ex-index-surface"><div class="ex-index-title">索引顺序（示意，非完整执行计划锁集合）</div><div class="ex-key-row">'+keys.map(x=>'<span class="ex-key">'+x+'</span>').join('')+'</div><div class="ex-interval-row">'+intervals.map((x,i)=>'<span class="ex-interval '+(i===1&&lock!=='record'?'selected':'')+'">'+x.label+'</span>').join('')+'</div><div class="ex-key-result">'+(focus==='record'?'Record Lock：锁中已有的索引记录 20，单纯记录锁本身不保护前方间隙。':focus==='gap'?'Gap Lock：保护索引值 15 与 20 之间的插入位置（不等于锁住所有记录）。':'Next-Key Lock：(15,20] = 前方间隙 (15,20) + 记录 20。示例插入 18 会被阻塞。')+'</div><div class="ex-query">SELECT ... WHERE k &gt; 15 AND k &lt;= 20 FOR UPDATE</div><div class="ex-warning">注意：InnoDB 的实际加锁记录与边界取决于索引、扫描方向、优化器执行计划和隔离级别。图只放大解释其中一个 Next-Key 区间。</div></div>';
}
function logsView(mode){
 if(mode.id==='purpose')return '<div class="ex-compare"><div class="ex-node"><span class="ex-index">01</span><strong>Undo Log</strong><p>撤销未提交修改；保留 MVCC 所需的旧版本链。</p></div><div class="ex-node"><span class="ex-index">02</span><strong>Redo Log</strong><p>InnoDB WAL 物理恢复依据；崩溃后重做需要持久化的页变更。</p></div><div class="ex-node"><span class="ex-index">03</span><strong>Binlog</strong><p>MySQL Server 层的变更日志；复制、CDC、按时间点恢复。</p></div></div>';
 return '<div class="ex-commit"><div class="ex-node"><strong>事务修改</strong><p>产生 Undo 和 Redo；脏页可稍后刷盘。</p></div><span class="ex-down">↓</span><div class="ex-node selected"><strong>Redo Prepare</strong><p>InnoDB 两阶段提交准备。</p></div><span class="ex-down">↓</span><div class="ex-node"><strong>写入 Binlog</strong><p>Server 层提交该事务的逻辑变更；落盘保证依赖配置。</p></div><span class="ex-down">↓</span><div class="ex-node selected"><strong>Redo Commit</strong><p>两阶段提交完成；崩溃恢复利用 Redo 与 Binlog 状态决策。</p></div></div>';
}

function pmmChartView(mode){
 const kValues=[0.02,0.10,0.50];
 const selected=mode.id==='k002'?0.02:mode.id==='k050'?0.50:0.10;
 const px=(b)=>78+(b-60)*15.6;
 const py=(p)=>276-(p-100)*1.8;
 const price=(b,k)=>100*(1-k+k*Math.pow(100/b,2));
 const xy=(b,p)=>px(b).toFixed(1)+','+py(p).toFixed(1);
 const lineFor=k=>Array.from({length:81},(_,n)=>{
  const b=60+n*.5;return (n?'L':'M')+xy(b,price(b,k));
 }).join(' ');
 const marked=price(80,selected);
 const paths=kValues.map((k,i)=>'<path d="'+lineFor(k)+'" fill="none" stroke="'+(k===selected?'#c3ee87':['#557d8b','#7da599','#b99fcf'][i])+'" stroke-width="'+(k===selected?'4':'2')+'" opacity="'+(k===selected?'1':'.47')+'" stroke-linejoin="round"/>').join('');
 const horizontal=[100,125,150,175].map(p=>'<path d="M78 '+py(p)+' H704" stroke="#56736d" stroke-dasharray="3 7" opacity=".35"/><text x="69" y="'+(py(p)+5)+'" text-anchor="end" class="ex-axis-text">'+p+'</text>').join('');
 const vertical=[60,80,100].map(b=>'<text x="'+px(b)+'" y="305" text-anchor="middle" class="ex-axis-text">'+b+'</text>').join('');
 return '<div class="ex-pmm-wrap"><svg class="ex-pmm-svg" viewBox="0 0 760 335" role="img" aria-label="PMM Price curve: k='+selected+'"><rect x="6" y="7" width="748" height="321" rx="14" fill="#111e27" stroke="#3d5a54"/><text x="22" y="28" class="ex-chart-title">PMM 参考价 i=100 · B0=100 · B=80</text>'+horizontal+vertical+'<path d="M78 49V276H704" stroke="#8daf99" fill="none" />'+paths+'<path d="M'+px(80)+' 276 V'+py(marked)+'" stroke="#c3ee87" stroke-width="1.5" stroke-dasharray="6 6"/><circle cx="'+px(80)+'" cy="'+py(marked)+'" r="6" fill="#c3ee87" stroke="#1a3526" stroke-width="2"/><text x="688" y="47" text-anchor="end" class="ex-chart-price">P(80) = '+marked.toFixed(3)+'</text><text x="375" y="324" text-anchor="middle" class="ex-axis-text">当前 Base 库存 B（右侧为平衡库存）</text></svg><div class="ex-pmm-metrics"><div><span>参考价 i</span><strong>100</strong></div><div><span>曲线参数 k</span><strong>'+selected.toFixed(2)+'</strong></div><div><span>当前库存 B/B0</span><strong>80 / 100</strong></div><div><span>边际价 P(80)</span><strong>'+marked.toFixed(3)+'</strong></div></div></div>';
}


function mirrorTreeView(mode){
 const before=[['4',204,47],['2',107,127],['7',301,127],['1',59,224],['3',155,224],['6',254,224],['9',350,224]];
 const after=[['4',642,47],['7',545,127],['2',739,127],['9',497,224],['6',593,224],['3',690,224],['1',788,224]];
 function tree(nodes,color){
  let lines='';
  for(const [p,c] of [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]]){
   lines+='<path d="M'+nodes[p][1]+' '+(nodes[p][2]+22)+' L'+nodes[c][1]+' '+(nodes[c][2]-20)+'" stroke="'+color+'" stroke-width="2" opacity=".65"/>';
  }
  return lines+nodes.map(([v,x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="23" stroke="'+color+'" stroke-width="2" fill="#203630"/><text x="'+x+'" y="'+(y+6)+'" text-anchor="middle" fill="#e5f3de" font-size="17" font-weight="700">'+v+'</text>').join('');
 }
 const order=mode.id==='queue'?'BFS：4 → 2 → 7 → 1 → 3 → 6 → 9':'DFS：4 → 2 → 1 → 3 → 7 → 6 → 9';
 return '<div class="ex-tree-wrap"><svg viewBox="0 0 845 280" role="img" aria-label="二叉树镜像前后比较"><text x="202" y="22" text-anchor="middle" class="ex-chart-title">镜像前</text><text x="642" y="22" text-anchor="middle" class="ex-chart-title">镜像后</text>'+tree(before,'#82bac8')+tree(after,'#b9e57b')+'<text x="425" y="141" text-anchor="middle" fill="#bfed89" font-size="31">⇄</text></svg><div class="ex-tree-order">'+order+'（逐节点交换左右指针）</div></div>';
}
function hashRingView(mode){
 const r=124,cx=404,cy=172;
 const tokens=mode.id==='virtual'?[['A₀',10,'#c0e786'],['B₀',28,'#9bcce5'],['C₀',46,'#d8b28a'],['A₁',64,'#c0e786'],['B₁',82,'#9bcce5'],['C₁',98,'#d8b28a']]:[['A@10',10,'#c0e786'],['B@40',40,'#9bcce5'],['C@70',70,'#d8b28a']];
 const keyPos=mode.id==='lookup'?32:mode.id==='virtual'?52:32;
 const activeLabel=mode.id==='lookup'?'B@40':mode.id==='virtual'?'A₁@64':'C@70';
 const nodeAt=x=>{let deg=x/100*360-90,rad=deg*Math.PI/180;return[cx+r*Math.cos(rad),cy+r*Math.sin(rad)]};
 const nodes=tokens.map(([name,x,col])=>{const [nx,ny]=nodeAt(x);const disabled=mode.id==='down'&&name.startsWith('B');
 return '<circle cx="'+nx+'" cy="'+ny+'" r="24" fill="'+(disabled?'#402e2e':'#20392e')+'" stroke="'+(disabled?'#ed978a':col)+'" stroke-width="2"/><text x="'+nx+'" y="'+(ny+4)+'" text-anchor="middle" fill="'+(disabled?'#ed978a':'#f0f5e9')+'" font-size="12" font-weight="700">'+name+'</text>'+(disabled?'<path d="M'+(nx-9)+' '+(ny-9)+' l18 18 M'+(nx+9)+' '+(ny-9)+' l-18 18" stroke="#ed978a" stroke-width="2"/>':'')}).join('');
 const [kx,ky]=nodeAt(keyPos);
 return '<div class="ex-ring-wrap"><svg viewBox="0 0 800 345" role="img" aria-label="一致性哈希环顺时针查找"><circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#5d8f7c" stroke-width="4" stroke-dasharray="8 6"/><path d="M'+(cx+124)+' '+(cy-8)+' l0 16 l13 -8 z" fill="#b5df8b"/>'+nodes+'<circle cx="'+kx+'" cy="'+ky+'" r="9" fill="#edb674" stroke="#1a2530" stroke-width="2"/><path d="M'+kx+' '+ky+' L'+(kx-50)+' '+(ky-35)+'" stroke="#edb674" stroke-width="1.6"/><text x="'+(kx-54)+'" y="'+(ky-40)+'" text-anchor="end" fill="#edb674" font-size="12">Key@'+keyPos+'</text><text x="404" y="165" text-anchor="middle" fill="#e7f5dd" font-size="17" font-weight="750">顺时针查找</text><text x="404" y="190" text-anchor="middle" fill="#b4cfc2" font-size="12">First Token ≥ KeyHash</text><text x="404" y="331" text-anchor="middle" fill="#c6ed94" font-size="15" font-weight="700">目标节点：'+activeLabel+'</text></svg></div>';
}

function renderExtra(id,states,compact=false){
 const spec=registry[id],current=states?.[id]??api.defaults[id];
 const mode=spec.states.find(x=>x.id===current)||spec.states[0];
 if(compact)return '<div class="ex-preview">'+esc(spec.name)+'</div>';
 const visual=spec.kind==='nextkey'?nextKeyView(mode):spec.kind==='logs'?logsView(mode):spec.kind==='pmm'?pmmChartView(mode):spec.kind==='tree'?mirrorTreeView(mode):spec.kind==='ring'?hashRingView(mode):flowView(spec,mode);
 return '<section class="diagram-card ex-diagram" aria-label="'+esc(spec.name)+' 交互图解"><div class="diagram-head"><span class="diagram-badge">✳ INTERACTIVE DIAGRAM / '+esc(spec.tag)+'</span><span class="tiny" style="color:#90aca7">专题图解</span></div><div class="ex-header"><strong>'+esc(mode.title||spec.name)+'</strong><p>'+esc(spec.sub)+'</p></div><div class="diagram-visual ex-visual">'+visual+'</div>'+pill(spec,mode.id)+'<div class="diagram-desc"><span class="ex-desc-icon">ⓘ</span><span data-diagram-desc>'+esc(mode.note||spec.description)+'</span></div></section>';
}
api.render=(type,states,compact=false)=>registry[type]?renderExtra(type,states,compact):renderOriginal(type,states,compact);
window.StackAtlasExtra={register,registry,version:'1'};
})();