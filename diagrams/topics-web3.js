/* Solidity, transaction services, Web3 backend diagrams. */
(()=>{
 const register=window.StackAtlasExtra.register;
 const add=(id,name,tag,featured,sub,states)=>register({id,name,tag,featured,sub,color:'#9fcce9',description:sub,states:states.map(([id,label,title,steps,note,layout])=>({id,label,title,layout,note,nodes:steps.map(([title,detail,kind])=>({title,detail,kind}))}))});
 add('callcontexts','CALL / DELEGATECALL / STATICCALL','EVM / CALL FRAME','S03','代码来源、Storage、sender 与写入权限',[
 ['call','CALL','目标合约上下文',[['合约 A 发起 CALL','向合约 B 调用函数'],['B 执行代码与 Storage','msg.sender = A；msg.value 来自 CALL'],['允许按函数规则修改状态','返回成功/失败标记']],'普通 CALL 的代码与 Storage 属于被调用目标合约。'],
 ['delegate','DELEGATECALL','调用方 Storage 不变',[['Proxy 发起 delegatecall','目标 Implementation 的代码'],['上下文保留 Proxy','Storage/地址/消息发送者沿用调用上下文'],['变量槽位必须兼容','升级可能破坏 Proxy 状态','warning']],'delegatecall 执行实现代码，但修改 Proxy 的 Storage；msg.sender/msg.value 沿用调用方上下文。'],
 ['static','STATICCALL','静态只读上下文',[['合约 A 发起 STATICCALL','目标 B 执行函数'],['禁止状态修改','SSTORE/LOG 等写入类操作会失败'],['只返回数据或失败','不代表 RPC 数据必然可信']],'STATICCALL 的只读限制在调用帧及其下游执行中生效。']
 ]);
 add('reentrancy','重入攻击与 CEI 顺序','SOLIDITY / REENTRANCY','S04','外部调用前后，合约不变式是否已成立',[
 ['unsafe','先转再记账','危险的 Withdraw',[['读 balances[attacker]=100','状态尚未更新'],['CALL 向恶意合约转账','fallback 再次进入 withdraw','warning'],['再次读到 100','重复提取，资产可能失窃','warning']],'漏洞核心是控制权交给外部之前，敏感状态尚未更新。'],
 ['safe','CEI + Guard','先 Effects 后 Interactions',[['Checks','检查余额与权限'],['Effects','先清零/扣余额，使不变式成立'],['Interactions','再外部 CALL，检查返回值']],'CEI 与 ReentrancyGuard 可减少风险，但跨函数共享状态也必须全局维护不变式。']
 ]);
 add('proxyupgrade','Transparent vs UUPS 升级路径','SOLIDITY / UPGRADE','S07','代码与状态分离后的升级授权位置',[
 ['transparent','Transparent','Proxy Admin 掌控升级',[['用户 CALL Proxy','正常 fallback 到 Implementation'],['Proxy Admin','管理员路径负责升级'],['Storage 保留在 Proxy','布局更改可能破坏旧状态']],'透明代理区分管理员调用与用户 fallback。'],
 ['uups','UUPS','升级逻辑位于实现合约',[['Proxy DELEGATECALL','使用 Implementation 代码'],['_authorizeUpgrade','实现在 Implementation 中校验权限'],['升级前后布局 Diff','错误实现可能使升级能力丢失','warning']],'UUPS 强依赖正确升级权限、布局兼容和新实现的升级入口。']
 ]);
 add('oracle','闪电贷价格操纵与预言机','DEFI / ORACLE','S12','低流动性即时价格为什么容易被单交易操纵',[
 ['attack','瞬时报价','攻击窗口',[['Flash Loan','瞬间借入大量资金'],['操纵浅池现货价','DEX spot 被短时推高','warning'],['受害协议按 spot 抵押/清算','扭曲价格完成套利','warning']],'攻击利用错误的价格信任与经济模型；闪电贷只是获取资金手段。'],
 ['defend','防御策略','多重风险约束',[['抗操纵价格来源','可信预言机 / TWAP'],['新鲜度、偏离、Sequencer','验证更新时间、报价状态'],['抵押限额与熔断','限制低流动性资产与极端价格']],'TWAP 不是绝对安全，仍需考虑窗口、流动性、预言机宕机和价格延迟。']
 ]);
 add('accountabstraction','ERC-4337 UserOperation 流程','WEB3 / ACCOUNT ABSTRACTION','B16','智能合约账户、Bundler、EntryPoint、Paymaster',[
 ['send','UserOperation','从签名意图到打包',[['Smart Account','签 UserOperation'],['Bundler','检查并模拟、打包 UserOp'],['EntryPoint','链上验证并执行账户调用']],'UserOperation 本身不是普通 EOA L1 交易，由 Bundler 组织入口交易。'],
 ['sponsor','Paymaster','Gas 赞助与风险',[['Paymaster 校验赞助许可','目标/额度/有效期'],['EntryPoint 验证和扣费','可能产生失败 Gas 成本'],['风控与对账','限制恶意 UserOperation','warning']],'Paymaster 是资金预算与授权风险面，不能仅因模拟通过就保证零损耗。']
 ]);
 add('txsign','交易签名与 EIP-712 区分','ETHEREUM / SIGNATURE','E21','EIP-155、Typed Tx 和结构化消息不是同一格式',[
 ['transaction','链上交易','Signed Transaction',[['chainId / nonce / fee / calldata','交易类型指定的签名域'],['secp256k1 ECDSA','r,s 与 yParity（或 legacy v）'],['广播序列化交易','网络和链下验证交易签名']],'EIP-155 / typed transaction 把 chainId 绑定交易签名，防止简单跨链重放。'],
 ['message','业务消息','EIP-712 Typed Data',[['Domain Separator','chainId、verifyingContract 等'],['Struct Hash','订单、spender、nonce、deadline'],['合约/后端验证','还要业务授权和 nonce 消费']],'EIP-712 规定结构化消息编码，不是 EVM 交易序列化格式。']
 ]);
 add('noncemanager','热钱包 Nonce 分配与替换','WEB3 / TX MANAGER','B04','RPC 超时不是交易失败',[
 ['allocate','分配','持久化 Nonce',[['业务 ID 幂等','唯一业务请求'],['数据库原子分配 Nonce','同一 EOA 不可重复占用'],['保存 raw tx 与 hash','广播前必须持久化']],'高并发多实例不应分别调用 pending nonce 再自行加一。'],
 ['recover','恢复','超时后检查和重播',[['eth_sendRawTransaction 超时','节点可能已经接受'],['查询同 nonce / hash','先重播同一 raw tx'],['同 nonce 替换加价','必须维持同一业务意图']],'重新分配新 Nonce 可能造成重复付款；替换交易需满足节点替换规则。']
 ]);
 add('withdrawal','资金提现状态机','WEB3 / WITHDRAW','B09','余额冻结、风控、签名、确认与失败补偿',[
 ['lifecycle','状态迁移','从请求到最终完成',[['用户请求 + 幂等 ID','事务冻结可用余额'],['风控审核 / 签名','KMS/HSM 批准链上执行'],['广播 / 确认 / 对账','Inclusion 并非 Finality']],'内部账务与链上状态分别持久化，不因网络超时简单解冻。'],
 ['exception','异常恢复','不能重复转账',[['RPC 返回超时','标记 broadcast unknown'],['检查 raw tx / nonce / receipt','链上或 Mempool 结果可能不同'],['补偿 / 人工介入','冻结余额与账务对齐']],'同一笔提现的替换交易使用同一 nonce 和已授权的转账意图。']
 ]);
 add('withdrawalscale','高吞吐多钱包提现架构','SYSTEM DESIGN / THROUGHPUT','C03','请求吞吐与链上交易 TPS 不相等',[
 ['queue','削峰与顺序','把 10 万请求与链容量解耦',[['API 请求 + 风控','高峰先持久化冻结'],['按 chain/wallet 分区队列','每地址 Nonce 顺序管理'],['多热钱包与 Batch','受链上 Gas 与吞吐限制']],'每分钟 10 万提现请求不等于同一分钟能完成 10 万链上确认。'],
 ['safety','资产安全','Hot Wallet 限额和对账',[['签名隔离','KMS/MPC + 授权白名单'],['独立余额调拨','热冷钱包储备'],['异常冻结 / 对账','任何回滚都有业务审计']],'增加热钱包提升并发也增加资金调度和风险面。']
 ]);
 add('indexer','链上索引器补扫与回滚','WEB3 / INDEXER','B06','WebSocket 是加速提示，持久 Checkpoint 才能补漏',[
 ['normal','正常路径','从块到业务事件',[['WS NewHeads 通知','仅用作触发器'],['eth_getLogs / 区块批扫','保存原始 blockHash 与 checkpoint'],['ABI Decode / 幂等写入','持久化 index 及 downstream outbox']],'不应依赖实时订阅作为唯一可靠数据源。'],
 ['reorg','分叉恢复','撤销旧链后重放',[['parentHash 不连续','寻找共同祖先'],['旧分支标记 removed','冲正 Pending 业务影响'],['新规范链重放','按 blockHash + log 识别来源']],'只有可回滚状态和可重放原始数据，才能避免 Reorg 导致脏账。']
 ]);
 add('blockfinality','latest / safe / finalized 语义','ETHEREUM / FINALITY','E27','不同区块标签代表不同程度的安全承诺',[
 ['head','latest','规范头不等于最终确定',[['latest','当前节点认为的最新链头'],['safe','共识协议认为更安全的链头'],['finalized','在 PoS 最终性约束下定稿']],'三者是状态视图，不是固定“等 N 个区块”就总能互相替代。'],
 ['risk','充值策略','不同金额不同确认阈值',[['观测新日志','仅待确认'],['等待 safe/finalized','按具体链和资产风险配置'],['账务最终放行','按业务不变式入账']],'不同 Rollup 对 finality 标签定义可能不同；必须按目标链语义实施。']
 ]);
 add('deposit','中心化平台充值入账','WEB3 / DEPOSIT','B08','观测日志不是最终可提现余额',[
 ['observe','入账流程','资金确认分阶段',[['合约地址白名单','chainId + token + 用户充值地址'],['检测 Transfer / 内部入金','保存 blockHash 和事件唯一键'],['确认后双分录记账','待确认与可提现余额隔离']],'先校验规范链和资金归属，再进入最终可提现余额。'],
 ['reorg','异常回滚','分叉中的待确认充值',[['被移除区块的日志','从规范链消失'],['撤销 Pending 记录','重扫新分支'],['风险阈值 / 对账','已放行资金需要独立处置流程']],'重要资金场景应避免未达最终性就允许立即提现。']
 ]);
 add('multichainindex','多链充值 Indexer 分区','WEB3 / MULTICHAIN','C02','采集、确认、账务独立扩容与故障隔离',[
 ['chains','按链隔离','链级配置与独立任务',[['Chain Registry','RPC/ABI/Token allowlist'],['Scanner + Checkpoint','按链分区、限流、批扫'],['Kafka + Ledger','幂等确认和资产对账']],'各链最终性、数据可用性与事件格式不应硬编码为一套策略。'],
 ['repair','批量历史恢复','Backfill 不中断实时链路',[['实时 Scanner','保持低延迟'],['历史 Backfill','独立 RPC/队列/预算'],['版本化汇总','校验后发布、支持回退']],'重扫亿级日志需要可恢复切片与下游幂等，不能挤占实时任务。']
 ]);
 add('gasaccess','SLOAD / SSTORE Gas 的访问状态','EVM / GAS ACCOUNTING','E16','热/冷访问、原值/新值与退款规则',[
 ['cold','冷访问','首次触碰 Storage',[['交易访问一个 Slot','首次冷 SLOAD 有额外 Gas 成本'],['同 Slot 再读','Warm Access 成本较低'],['EIP-2929','维护本事务暖访问集合']],'Gas 不是每个 SLOAD 都固定相同费用。'],
 ['write','SSTORE','写入成本依赖值变化',[['original / current / new','判断零→非零、非零→零等'],['Warm/cold + dirty slot','计费分支不同'],['Refund 受上限限制','不能当作固定返现']],'SSTORE 计价依赖 Slot 的原值、当前值、新值、访问状态和退款上限。']
 ]);
 add('revert','REVERT / OOG 与状态回滚','EVM / ERROR','E18','失败作用于哪个调用帧、Gas 与日志怎样处理',[
 ['revert','REVERT','返回失败数据并撤销当前调用',[['子调用 SSTORE / LOG','产生临时状态/日志'],['执行 REVERT','该调用帧变化撤销'],['调用方检查 success=false','可以选择继续处理失败']],'子调用 REVERT 通常不会强制父调用也失败，取决于调用方是否传播错误。'],
 ['oog','Out-of-Gas','子调用耗尽可用 Gas',[['子调用 OOG','该帧 Gas 消耗与状态回滚'],['父调用收到失败','剩余 Gas 视具体调用'],['顶层交易失败','收据 status=0，不保留回滚日志']],'OOG 与 REVERT 的剩余 Gas 语义不同，不能把两者一概等价。']
 ]);
})();
