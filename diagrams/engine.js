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
function renderExtra(id,states,compact=false){
 const spec=registry[id],current=states?.[id]??api.defaults[id];
 const mode=spec.states.find(x=>x.id===current)||spec.states[0];
 if(compact)return '<div class="ex-preview">'+esc(spec.name)+'</div>';
 const visual=spec.kind==='nextkey'?nextKeyView(mode):spec.kind==='logs'?logsView(mode):flowView(spec,mode);
 return '<section class="diagram-card ex-diagram" aria-label="'+esc(spec.name)+' 交互图解"><div class="diagram-head"><span class="diagram-badge">✳ INTERACTIVE DIAGRAM / '+esc(spec.tag)+'</span><span class="tiny" style="color:#90aca7">专题图解</span></div><div class="ex-header"><strong>'+esc(mode.title||spec.name)+'</strong><p>'+esc(spec.sub)+'</p></div><div class="diagram-visual ex-visual">'+visual+'</div>'+pill(spec,mode.id)+'<div class="diagram-desc"><span class="ex-desc-icon">ⓘ</span><span data-diagram-desc>'+esc(mode.note||spec.description)+'</span></div></section>';
}
api.render=(type,states,compact=false)=>registry[type]?renderExtra(type,states,compact):renderOriginal(type,states,compact);
window.StackAtlasExtra={register,registry,version:'1'};
})();