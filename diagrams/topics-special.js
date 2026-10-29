/* Supplemental cases where a generic related diagram would start on the wrong topic. */
(()=>{
const add=window.StackAtlasExtra.register;
const spec=(id,name,tag,featured,sub,states)=>add({id,name,tag,featured,sub,color:'#98c6f5',description:sub,states:states.map(([id,label,title,nodes,note])=>({id,label,title,nodes:nodes.map(([title,detail,kind])=>({title,detail,kind})),note}))});
spec('rolluproots','Rollup 承诺与 L1 结算','L2 / COMMITMENTS','E33','L2 Output Root 不等于 L1 Execution stateRoot',[
 ['optimistic','Optimistic','Output Proposal / Challenge',[['L2 Sequencer','执行 L2 交易与状态转换'],['L1 Output/State Commitment','发布到 L1 的 Rollup 状态承诺'],['Challenge / Finalization','按协议等待争议窗口与 L1 最终性']],'L2 的 state/output commitment 是 L1 合约验证的声明，不能直接等同 L1 区块头 stateRoot。'],
 ['zk','Validity Proof','证明驱动的状态更新',[['L2 Execution','汇总交易与新的承诺'],['Validity Proof','证明状态转移满足约束'],['L1 Verifier / Bridge','验证证明并更新可消费状态']],'证明有效不自动代表所有跨链提现已经可立即执行；还要遵守 L1 结算与桥条件。']
]);
spec('storageadvanced','嵌套 Mapping 与数组槽位推导','SOLIDITY / STORAGE PATH','E07','由声明 Slot 一步步推导复杂值的逻辑位置',[
 ['mapping','mapping(address=>uint)','简单 Mapping',[['声明槽位 p','变量声明的位置编号'],['pad32(address)||pad32(p)','固定 64-byte 编码'],['keccak256(...)','得到逻辑 Storage Slot']],'Storage Trie 内部还会对逻辑 Slot 再执行一次哈希来选择路径。'],
 ['nested','nested mapping','两次 Mapping Key 哈希',[['inner = keccak256(pad(k1)||pad(p))','外层 Mapping 位置'],['slot = keccak256(pad(k2)||inner)','内层 Key 定位'],['eth_getStorageAt(slot)','传入逻辑 Slot，不需手工再哈希']],'映射键顺序不能调换；动态类型键使用 Solidity Storage Layout 指定编码规则。'],
 ['array','dynamic array','动态数组元素寻址',[['声明 Slot p 保存长度','只对动态数组适用'],['dataStart=keccak256(pad32(p))','元素数据区域起点'],['按元素大小计算 Slot / Offset','小元素可能共享 Slot']],'动态数组的实际存储位置还取决于元素能否打包及嵌套结构。']
]);
})();
