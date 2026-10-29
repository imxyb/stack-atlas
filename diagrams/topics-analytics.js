/* Data platform, AML/KYT and graph-analysis visual explanations. */
(()=>{
 const reg=window.StackAtlasExtra.register;
 const add=(id,name,tag,featured,sub,states)=>reg({id,name,tag,featured,sub,color:'#93d6b4',description:sub,states:states.map(([id,label,title,nodes,note,layout])=>({id,label,title,nodes:nodes.map(([title,detail,kind])=>({title,detail,kind})),note,layout}))});
 add('warehouse','链上数仓四层模型','CHAIN DATA / WAREHOUSE','D10','ODS、DWD、DWS、ADS 的职责和 Reorg 重算',[
 ['layers','数仓层级','按数据粒度递进',[['ODS / Raw','区块、Receipt、Logs、Trace、来源'],['DWD / Detail','标准化转账与协议行为'],['DWS / Summary','地址日活、DEX Volume、风险聚合'],['ADS / Product','画像、告警与用户 API']],'每层应支持从原始数据重算和解析器版本追溯。'],
 ['rebuild','重算','Reorg / 解析变更',[['保留原始旧分支','blockHash 与 canonical 状态'],['DWD 回撤与重放','新版本解析器与规则'],['DWS / ADS 增量修正','避免脏指标残留']],'不能靠仅删一条 Raw Log 就自动修复所有已物化的报表。']
 ]);
 add('stackroles','链上实时/离线/交互引擎分工','DATA / TECHNOLOGY CHOICES','D13','Flink、Spark、Lakehouse、OLAP 与图数据库各有侧重',[
 ['realtime','实时计算','低延迟业务链路',[['Kafka','持久事件缓冲'],['Flink','流解析、规则状态、窗口'],['OLAP / Alert','可查询指标和告警']],'Flink 与 Kafka 的 Exactly-once 不自动解决链 Reorg。'],
 ['historical','历史回填','数据湖与离线处理',[['Object Storage / Lakehouse','历史 Raw Data 和版本'],['Spark','大规模回放/批量画像'],['StarRocks / ClickHouse / Graph','聚合查询与路径查询']],'组件选型以数据规模、延迟、恢复和成本为准，不是必须全部部署。']
 ]);
 add('riskpipeline','实时 KYT/AML 风控链路','CHAIN DATA / KYT PIPELINE','D14','从链上事件到可解释可撤销的风控案例',[
 ['stream','实时流','触发与特征计算',[['Block / Logs / Trace','带 blockHash 与 finality'],['Kafka + Parser','统一 Transfer/Swap/Bridge'],['Risk Engine','规则/标签/时间窗 → Alert']],'风险事件可以先标记 Pending，但不可直接视作最终事实。'],
 ['reorg','撤销','规范链回滚后的后果',[['发现原 Block 不再 Canonical','生成撤销信号'],['重算 Feature 与 Alert','结合 ruleVersion 和 eventId'],['Case / 通知修正','记录 retracted 证据']],'Reorg 不是 Flink 重启故障，必须显式撤销业务事实。']
 ]);
 add('kytaml','KYT 与 AML 范围区别','CHAIN RISK / TERMS','D17','交易风险检测与合规调查不是同一个概念',[
 ['kyt','KYT','Know Your Transaction',[['具体链上交易','金额、路径、对手方、频率'],['关联风险特征','风险标签与实时规则'],['待确认风险警报','保留原始交易证据']],'交易风控命中不等于认定该地址涉嫌违法。'],
 ['aml','AML','Anti Money Laundering',[['交易与历史行为证据','来源、实体和资金路径'],['调查/复核工作流','证据、置信度、解释'],['合规处置','按适用法规和组织政策']],'AML 更广，风险标签应可审查/更正，不是一个模型分数就自动定罪。']
 ]);
 add('utxograph','UTXO 与账户资金流追踪','CHAIN RISK / FLOW MODELS','D19','确定交易事实与概率污染模型的边界',[
 ['bitcoin','Bitcoin UTXO','输入输出消费图',[['已知来源 UTXO','txid + vout'],['交易消耗多个输入','创建多个 outputs'],['找零识别/比例归因','属于启发式模型']],'FIFO、proportional 和 poison taint 是研究/风控传播假设，不能天然证明现实币的归属。'],
 ['evm','EVM 账户','资金与协议语义图',[['ERC20 Transfers / ETH Trace','记录资产和地址'],['DEX Swap / Bridge','改变资产与链'],['实体聚类 + 路径评分','要过滤 CEX 大节点噪声']],'账户资产混合后不能说“这 1 USDT 必然就是上一笔的那 1 USDT”。']
 ]);
 add('mixer','Mixer 暴露与概率性关联','CHAIN RISK / PRIVACY','D21','记录可观察事实，不得凭空认定来源与归属',[
 ['observed','可观察数据','可证实的链上事件',[['某人向 Mixer Deposit','金额、时间、Commitment'],['另一地址 Withdraw','金额、时间、Recipient'],['Mixer Exposure 标签','只表示出现过交互']],'没有额外证据时不能证明一个 Withdrawal 精确对应哪个 Deposit。'],
 ['inferred','概率分析','风险模型并非确定归属',[['时间/金额池匹配','只是弱相关特征'],['结合后续资金流/实体关系','多证据交叉验证'],['保留置信度与反证','防止误报与过度推断']],'混币器也可能用于合法隐私；使用风险标签需要合规审查与证据边界。']
 ]);
 add('grapholap','图数据库与 OLAP 的分工','CHAIN DATA / STORAGE','D22','聚合统计和多跳资金流路径的计算方式不同',[
 ['olap','OLAP','列式聚合与多维报表',[['Transfer 明细与指标','按链、资产、时间分区'],['StarRocks / ClickHouse','按地址与维度过滤'],['BI / API','聚合量和历史趋势']],'在超大规模图搜索中递归 SQL 不一定优于专门的图索引。'],
 ['graph','Graph DB','实体关系与路径',[['地址 / 实体节点','每条边有交易证据'],['限跳 BFS / 路径评分','金额、时间、类型剪枝'],['调查视图','输出可解释的资金来源路径']],'图数据库并非替代所有 OLAP 查询；两者各承担不同的访问模式。']
 ]);
 add('graphhubs','图分析超级节点剪枝','KYT / HIGH DEGREE NODES','D23','交易所热钱包与路由器会造成伪关联和搜索爆炸',[
 ['naive','无界扩散','超级节点误报',[['风险地址 A','进入 CEX Hot Wallet'],['海量不相关客户','共享大型中转节点'],['把全部客户标记为风险','错误高危推断','warning']],'单纯图距离可能让所有与交易所发生交互的用户关联到风险源。'],
 ['semantic','语义剪枝','实体/协议感知路径',[['CEX 归集用实体节点','不把钱包内部转移当直接对手关系'],['金额/时间/Top-K 限制','明确记录过滤条件'],['返回带证据的路径','输出置信度与分析边界']],'节点剪枝不是删除原始数据，调查结果仍需要可恢复完整证据链。']
 ]);
 add('alertworkflow','风险告警状态与证据','KYT / CASE MANAGEMENT','D25','规则触发、复核、撤销与最终处置',[
 ['alert','产生告警','可追溯事件',[['规则 ID + Version','可重复分析'],['Evidence Tx / Path','金额、链、关系与标签来源'],['Pending Alert','风险概率与置信度']],'只存 risk_score 而没有原始 evidence 不足以支持审计。'],
 ['retract','重新评估','标签变化 / Reorg',[['规范链 Reorg 或标签重估','原警报可能不再成立'],['标记 Retracted / Updated','保留历史版本'],['人工复核或关闭 Case','反映原因与时间线']],'通知、工单和报表都要有撤销与幂等能力。']
 ]);
})();
