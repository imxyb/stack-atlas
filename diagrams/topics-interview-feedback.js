/* Focused interview feedback diagrams: not generic reused charts. */
(()=>{
const reg=window.StackAtlasExtra.register;
const add=(id,name,tag,featured,sub,states,kind)=>reg({id,name,tag,featured,sub,color:'#a1d7df',description:sub,kind,states:states.map(([id,label,title,nodes,note,layout])=>({id,label,title,nodes:nodes.map(([title,detail,k])=>({title,detail,kind:k})),note,layout}))});
add('mutexfair','Go Mutex 正常 / 饥饿模式','GO / RUNTIME','G60','唤醒竞争和直接交接，1ms 只是一条等待阈值',[
 ['normal','正常模式','唤醒后需要重新竞争',[['G1 持有锁','G2 在等待队列里休眠'],['G1 Unlock → 唤醒 G2','G2 不自动持有锁'],['新来的 G3 可能先拿到锁','低延迟但可能让等待者输掉竞争','warning']],'正常模式并非严格 FIFO；唤醒的等待者需要与新 Goroutine 竞争锁。'],
 ['starve','饥饿模式','Unlock 直接交接给队首',[['某等待者累计等待 > 1ms','满足饥饿模式触发判断'],['旧持有者 Unlock','直接移交锁所有权给队首 G2'],['新 G3 不能抢锁/自旋','进入等待队列尾部']],'等待队列中最后一个获锁者或等待不足 1ms 的获锁者可恢复正常模式。'],
 ['state','源码状态位','state 与 sema',[['mutexLocked / Woken / Starving','state 的低位记录状态'],['waiterCount','高位存等待者数量'],['sema','负责阻塞与唤醒，不是业务可见锁']],'1ms 不是锁自动按秒表切换，而是 waiter 在慢路径里用已等待时间决定饥饿状态。']
]);
add('deferreturns','Go defer 返回值推演','GO / EXECUTION ORDER','G61','先求值和赋返回值，再执行 LIFO defer',[
 ['named','具名返回','return 3，最后输出 5',[['n 初始 0','注册 defer，捕获变量 n'],['return 3','先赋值到具名结果 n=3'],['defer: n+=2','最终返回 5']],'具名结果变量能被闭包修改，因为 defer 在返回给调用者前执行。'],
 ['unnamed','非具名返回','返回结果仍为 3',[['n:=3','本地变量不是结果参数'],['return n','结果值复制为 3'],['defer: n+=2','改的是局部变量，不改变已确定的返回值']],'没有具名结果参数时，闭包只改局部变量而不能修改已求值的返回临时值。'],
 ['capture','参数捕获','注册时传值，最后输出 4',[['n=1; defer func(v int){n+=v}(n)','v 当场保存为 1'],['n=2; return 3','具名结果 n 先被赋值为 3'],['执行 defer: n+=1','最终输出 4']],'defer 参数在注册时求值；闭包里读取具名结果变量发生在执行时。'],
 ['lifo','多个 defer','先 +3 再 ×2 → 10',[['return 2','先写入返回值 n=2'],['第二个 defer：n+=3','n 变为 5'],['第一个 defer：n*=2','最终返回 10']],'多个 defer 按注册顺序的逆序执行。']
]);
add('mirrortree','二叉树镜像的迭代实现','GO / DATA STRUCTURE','G62','BFS 队列与 DFS 栈都能做到不递归',[
 ['queue','BFS 队列','逐层交换',[['queue = [root]','根节点入队'],['pop front / swap(left,right)','交换当前节点的左右子树'],['push non-nil children','队列耗尽即全部完成']],'时间 O(n)、额外空间 O(w)（最大层宽）。交换后入队左右顺序不会影响镜像结果。'],
 ['stack','DFS 栈','LIFO 深度遍历',[['stack=[root]','从栈尾弹出节点'],['swap(node.Left,node.Right)','将非空子节点压栈'],['stack 为空时结束','每个节点恰好处理一次']],'DFS 迭代时间 O(n)，额外空间最坏 O(n)、常见上界按树高/待处理分支估算。']
]);
add('hashring','一致性哈希查找方案','DISTRIBUTED / HASH RING','H19','稳定 Hash、虚拟节点、二分查找与顺时针回绕',[
 ['lookup','查找','Lower Bound + 环回',[['计算 hash(requestKey)','例如 0..99 范围中的 32'],['二分查找首个 token >= 32','命中 B@40'],['返回其真实节点','如果下标越界则回绕到第一个 token']],'二分查找复杂度 O(log(V))；顺时针第一个虚拟节点决定负责人。'],
 ['virtual','虚拟节点','平衡大量 Key',[['nodeA#0、nodeA#1 ...','各自哈希形成多个 Token'],['排序成环','让不同物理节点分散在环上'],['key 选择最近后继 Token','多个 Token 可映射到一个真实节点']],'虚拟节点数量和权重会影响负载分布，节点哈希需固定编码。'],
 ['down','节点故障','顺时针多副本/重新路由',[['原负责人 B@40 失效','从 ring 中排除失效节点'],['继续找后继 C@70','跳过相同物理节点'],['复制与回迁','需有迁移/一致性及恢复策略']],'Key 重映射幅度较小不代表 0 数据迁移，也不能替代一致性、副本同步和故障探测。']
]);
add('pmmcurve','PMM 主动做市：库存与曲线','DEFI / PMM','S30','调整 k 与 Base 库存观察边际价变化',[
 ['k002','低 k = 0.02','参考价附近价格更平缓',[['参考价 i=100','平衡 Base 库存 B0=100'],['当前库存 B=80','PMM 曲线在当前库存处报价'],['P = 101.125','相对 i 的偏离较小']],'单边卖盘 B<B0：P=i(1-k+k(B0/B)^2)。k 越小，库存变化时价格反应越弱。'],
 ['k010','中 k = 0.1','边际价格 = 105.625',[['i=100; B0=100','Base 目标库存'],['B=80','Base 库存被买走了 20'],['P=105.625','边际价格高于参考价']],'同样减少 20 单位 Base，k=.1 时边际价格从 100 上升到 105.625。'],
 ['k050','高 k = 0.5','边际价格 = 128.125',[['i=100; B0=100','参考价与库存目标'],['B=80','同样数量减少 20'],['P=128.125','库存不足引发更陡峭报价']],'k 越大，同样库存偏离触发更大价格变化；这不是恒定乘积的通用报价公式。']
],'pmm');
add('pmmrfq','PMM / 恒定乘积 AMM / RFQ','DEFI / MECHANISM','S31','定价算法 vs 报价成交协议',[
 ['amm','恒定乘积 AMM','池子按 x*y=k 自动定价',[['用户查询 Reserve','读取 x 与 y'],['合约按曲线计算','交易规模影响输出'],['交易原子改变 Pool','LP 承担库存/无常损失风险']],'本模式是经典 CPMM（恒定乘积 AMM）；AMM 家族远不止这一种。'],
 ['pmm','PMM','外部参考价 + 库存目标 + k',[['价格源提供 i','来源质量和时效是信任边界'],['PMM 根据 B、B0、k 调整价格','回归目标库存'],['交易改变储备与报价','LP 仍承担库存及预言机风险']],'PMM 是一种主动库存定价框架，也可部署在链上自动执行，属于 AMM 的更广义范畴。'],
 ['rfq','RFQ','做市商签名 Firm Quote',[['Taker 提交询价条件','Token、数量、期限'],['Maker 链下计算 Firm Quote','可使用 PMM/订单簿/外部交易所对冲'],['上链验签和结算','Nonce、期限、额度、余额与滑点检查']],'RFQ 是询价成交/执行路径：报价逻辑可以是 PMM，但 RFQ 本身不要求使用某种固定曲线。']
]);
add('rfqmaker','PMM 模型如何接入 RFQ 报价链路','DEFI / HYBRID QUOTING','C12','算法输出候选价格，链下签名到链上校验',[
 ['quote','生成报价','控制库存和风控',[['行情参考价 + 库存状态','PMM 计算边际价/累计输出'],['Maker 加入费率/风控/对冲成本','形成 size-dependent firm quote'],['签 EIP-712 Quote','绑定 Token/数额/期限/Nonce/接收方']],'PMM 只产出价格模型；真正的可执行 RFQ Quote 要再绑定交易签名域、有效时间和 maker 资金能力。'],
 ['settle','链上结算','避免签名有效但业务不符',[['Taker 选择 Quote','Router 处理 Token/Permit2'],['Settlement 校验多层签名','检查 Nonce、Deadline、Fee、允许的 Partial Fill'],['Vault 执行与余额差校验','不得信任只返回的 amountOut 数字']],'下面是通用架构示意。具体项目是否用 PMM 来算 Maker 报价，需要以实际代码和项目事实确认。']
]);
})();