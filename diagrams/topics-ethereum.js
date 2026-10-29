/* Ethereum execution / trie / consensus illustrations. */
(()=>{
 const reg=window.StackAtlasExtra.register;
 const add=(id,name,tag,featured,sub,v)=>reg({id,name,tag,featured,sub,color:'#bda6ec',description:sub,states:v.map(([id,label,title,nodes,note,layout])=>({id,label,title,nodes:nodes.map(([title,detail,kind])=>({title,detail,kind})),note,layout}))});
 add('securetrie','State Trie Key 与 Secure Trie','ETH / SECURE TRIE','E04','账户地址哈希与状态根之间的关系',[
 ['address','账户路径','先将 Address 哈希成路径',[['账户 address（20 字节）','链上账户标识'],['Keccak-256(address)','状态 Trie 的 Key nibbles'],['Account RLP','nonce/balance/storageRoot/codeHash']],'路径哈希不能隐藏余额；它是抗路径攻击/优化结构的 Secure Trie Key 选择。'],
 ['proof','状态证明','可信 Root 作为锚点',[['区块头 stateRoot','对账户集合的承诺'],['沿 Keccak(address) 路径','验证 Proof 节点'],['恢复账户 RLP 值','仍需确认区块头可信']],'单独知道某个 stateRoot 不代表已经验证了该区块共识最终性。']
 ]);
 add('storagepacking','Storage Packing 与升级布局','SOLIDITY / LAYOUT','E08','字段声明顺序、槽位及代理升级的冲突',[
 ['packed','打包','小字段共享一个 32-byte Slot',[['uint128 a','占用 Slot 0 前半部分'],['uint128 b','占用 Slot 0 另一半'],['uint256 c','独立占用 Slot 1']],'EVM 中 Storage Slot 是 32 字节；相邻小变量在允许时可以共用槽位。'],
 ['upgrade','升级','Storage Layout 冲突',[['Proxy 保留旧 Storage','Impl V1 既有字段布局'],['Impl V2 插入新字段','原变量 Slot/Offset 变化','warning'],['读取旧数据时错位','必须 Diff/迁移/Namespaces']],'不兼容布局可直接破坏资金状态；不能随意在旧变量之前插入新变量。']
 ]);
 add('accountnode','Ethereum Account 与合约状态','ETH / ACCOUNT','E05','EOA 与合约账户对象的四个核心字段',[
 ['eoa','EOA','外部账户对象',[['nonce','普通交易序号'],['balance','原生 ETH Wei 数量'],['storageRoot / codeHash','空状态/空代码承诺']],'地址和状态树里并没有存完整钱包私钥；私钥只在用户本地或签名服务。'],
 ['contract','合约账户','代码承诺 + 存储承诺',[['nonce / balance','账户序号与 ETH 余额'],['codeHash','引用实际部署的 Bytecode'],['storageRoot','合约自己的 Storage Trie Root']],'合约账户对象不直接内嵌完整合约字节码和所有变量。']
 ]);
 add('transactiontrie','Transaction Trie 的 Key 和有序性','ETH / TRANSACTION TRIE','E09','区块中交易下标与编码决定交易根',[
 ['index','按索引入树','Key 不是 TxHash',[['txIndex 0,1,2 ...','区块内排序位置'],['RLP(index)','Trie Key'],['Encoded Transaction','Legacy/Typed Tx 作为 Value']],'调整交易排序会改变以索引为 Key 的交易树承诺。'],
 ['typed','Typed Transaction','Value 的封装格式',[['EIP-2718 Type Byte','区分交易类型'],['具体类型 Payload','按交易类型字段编码'],['Transactions Root','承诺区块有序交易列表']],'签名哈希、交易哈希和 Trie Value 编码不应混为一谈。']
 ]);
 add('receipttrie','Receipts Trie 的收据字段','ETH / RECEIPT TRIE','E10','status、cumulativeGasUsed 与 Logs 各是什么',[
 ['receipt','收据编码','按交易下标承诺收据',[['RLP(txIndex)','作为 Receipts Trie Key'],['Receipt Value','status / cumulativeGasUsed / bloom / logs'],['receiptsRoot','区块头承诺所有收据']],'receipt.gasUsed 可通过相邻累计 Gas 推导，但并不是收据 Trie 里同义的独立字段。'],
 ['event','日志归属','Logs 来自成功执行的调用',[['status','顶层执行是否成功'],['Logs array','日志地址、Topics 和 Data'],['LogIndex','区块内定位，可能随分叉变化']],'收据证明承诺该区块的 Logs；还必须确认区块头和执行语义。']
 ]);
 add('headerroots','执行区块头的多种承诺字段','ETH / BLOCK HEADER','E23','三棵树之外还有大量共识及协议字段',[
 ['classic','经典三根','Execution Header 的三个 Trie Root',[['stateRoot','后状态账户及 Storage 承诺'],['transactionsRoot','有序交易集合'],['receiptsRoot','执行收据与 Logs']],'三根分别承诺不同数据，Storage Trie 通过账户 storageRoot 间接纳入状态。'],
 ['extended','扩展字段','协议演进会增加 Header 字段',[['parentHash / timestamp','链连接与时间元数据'],['withdrawalsRoot','提款操作承诺（适用 fork）'],['blobGasUsed / excessBlobGas','EIP-4844 相关 Blob 费用字段']],'Block Header 远不止三个 Root；具体字段集合随网络 Fork 演进。']
 ]);
 add('rlphp','MPT 的 HP / RLP / 节点内联','ETH / NODE ENCODING','E03','Hex-Prefix 路径编码和短节点引用',[
 ['path','Hex Prefix','Compact Path Encoding',[['Key nibbles','半字节路径'],['HP 编码','是否叶节点与奇偶长度标记'],['Leaf / Extension','把压缩路径写入 RLP 节点']],'HP 不是普通“把十六进制转字符串”，它会编码叶子/扩展节点和路径奇偶性。'],
 ['inline','短节点','内联与哈希引用',[['RLP(node) < 32 bytes','父节点可能直接内嵌编码'],['较大节点','父节点保存 Keccak256(RLP(node))'],['Root Hash','自上而下验证承诺路径']],'节点内联阈值减少数据库额外寻址，证明验证时需同时处理两种子节点引用。']
 ]);
 add('receiptproof','Receipt Proof 与 Event 包含性','ETH / EVENT PROOF','E11','证明某区块收据包含 Log，不等于证明业务真实意图',[
 ['inclusion','包含证明','Receipt Trie Proof',[['可信 blockHeader.receiptsRoot','明确区块哈希与最终性'],['RLP(txIndex) + Proof','验证收据编码'],['Logs 中核对目标 Event','发出合约、Topic、Data']],'收据 Proof 证明该规范区块承诺了某个 Log，但不自动证明其经济含义正确。'],
 ['meaning','业务验证','同名事件不能直接信任',[['恶意 Token 也能 emit Transfer','检查 Token 合约白名单'],['receipt.status / blockHash','确认正确执行和分叉状态'],['状态 / 余额 / 订单校验','完成资产入账判断']],'不能只拿一条 Transfer Event 作为支付成功的唯一事实。']
 ]);
 add('hashanchored','按 blockHash 固定 RPC 查询','ETH / CONSISTENT READ','E35','相同 blockNumber 可能代表不同规范分支',[
 ['number','只按高度','读到不同分叉',[['RPC A: height 100','blockHash = 0xAAA'],['RPC B: height 100','blockHash = 0xBBB'],['拼合 Proof / 状态','可能是跨区块拼接的错误快照','warning']],'高度并不唯一固定区块；不同 Provider 可能处于不同链头。'],
 ['hash','按 Hash 固定','同一个区块快照',[['选定 blockHash','记录 chainId 与锚点'],['EIP-1898 查询','blockHash + 可选 requireCanonical'],['对照结果与 Proof','共识最终性仍须独立确认']],'requireCanonical 只意味着应答节点当前认为规范，不等于永远 Finalized。']
 ]);
 add('finalityproof','Finalized 余额独立校验服务','ETH / STATE VERIFICATION','E36','可信链头、账户/存储两级证明与语义验证',[
 ['simple','简单 Mapping','Known Slot Proof',[['独立最终性锚点','确认 finalized Header / stateRoot'],['eth_getProof','账户 Proof 与 Storage Proof'],['本地验证 Slot 值','按合约布局解码']],'只能证明特定区块的特定 Slot 值；还需确认 Token balanceOf 是否真对应这个 Slot。'],
 ['complex','动态余额','Proxy / Rebasing 情况',[['固定合约版本与 ABI','检查代理/CodeHash'],['余额可能是份额换算','不能直接用单一 Storage Slot 证明'],['执行或协议证明','定义更明确的可信计算边界']],'某些 ERC20 的 balanceOf 是计算函数，不能仅证明一个 Mapping 存储项。']
 ]);
 add('statetransition','EVM 确定性状态转换','ETH / STATE MACHINE','E13','执行客户端如何验证交易后状态根',[
 ['execute','状态变更','从前状态到后状态',[['前区块 State Root','确定前账户与 Storage'],['顺序执行交易','同一 Fork 规则/区块上下文'],['重新计算 State Root','与区块头给定值一致']],'不同验证节点必须在相同前状态及 fork 规则下得到相同状态根。'],
 ['failure','不匹配','无效执行 Payload',[['某笔交易产生不同状态','例如 EVM 规则或签名无效'],['本地 stateRoot 不同','与区块头承诺冲突','warning'],['拒绝无效区块','不是简单信任 RPC 返回']],'区块被共识最终确定与执行有效性是不同层次的验证。']
 ]);
 add('slotepoch','Beacon Slot / Epoch 时间线','ETH / CONSENSUS TIME','E25','Slot 12 秒，Epoch 32 Slots，但并非每 Slot 必有区块',[
 ['slot','Slot','按时隙分配提议者',[['Slot N（约 12s）','一个预定的提议机会'],['可能缺块','网络/提议者故障'],['下一 Slot N+1','时间继续，区块高度不一定增长']],'12 秒是 Slot 时间，不代表每隔 12 秒必有一个新区块。'],
 ['epoch','Epoch','32 Slot 的周期',[['Slot 0...31','组成 Epoch'],['委员会 Attestation','投票用于 fork choice 和 finality'],['Epoch 边界','用于共识 checkpoint 逻辑']],'Slot、Epoch 和执行区块高度是不同概念。']
 ]);
 add('gasper','Gasper = LMD-GHOST + Casper FFG','ETH / POS FINALITY','E26','短期链头选择和长期最终性如何分工',[
 ['head','LMD-GHOST','选当前规范头',[['验证者最新有效 Attestation','按 Fork Choice 权重聚合'],['在树上择最重分支','可能随新投票改变'],['得到 Head','还不等于最终性']],'Fork Choice 负责选择暂时的规范链头。'],
 ['finality','Casper FFG','Justified / Finalized Checkpoints',[['Epoch checkpoint votes','验证者按规则投票'],['达到对应门槛','形成 Justification'],['后续满足安全规则','可 Finalize 之前 checkpoint']],'最终性来自投票与惩罚/安全假设，不是“固定 N 确认=最终确定”。']
 ]);
})();
