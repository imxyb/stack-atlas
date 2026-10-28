# 第三份面试题整合记录

日期：2026-10-28
来源：第三份用户提供的面试题文本（后端性能、Web3 合约、多链数据/风控、sync.Map 原理）。

## 成果

- 合并前：210 道；合并后：255 道；新增：45 道。
- 多链数据/KYT/AML：新增 D01–D32，共 32 道。
- Web3/DeFi/合约及设计：新增 B22、B23、S24–S29、C09–C11，共 11 道。
- 性能专项：新增 P01，共 1 道。
- Go sync.Map：新增 G59，共 1 道。
- 重点增强旧答案 11 道：G04、G13、M09、R01、R08、H14、B05、B06、B16、S15、A01。
- 新增 4 组交互图：pipeline、riskgraph、syncmap、amm；总图解 24 组。

## 去重策略

性能优化的 SQL、缓存、连接池、并发、熔断、P99 排查多数与原题重合，融入已有答案；新增完整压测方法论。
Web3 的 Reorg、充值提现、EVM、代理、重入等保留旧题；对 SIWE、AMM、借贷、Staking、Paymaster、Marketplace 等新知识点创建独立题。
多链数仓和 KYT/AML 属于原题库缺失明显的方向，因此新建专题；旧 Reorg 和 Event 语义则选择融合。

## 技术事实与准确性校正

1. 旧版 sync.Map 的 read/dirty、misses、expunged 不能笼统当作现代实现：Go 1.24 默认切换 Hash Trie。参见 Go 1.24 Release Notes 和当前 sync/map.go。
2. 原材料的 SQL 示例错误地将 token_address 与 USDT/USDC/DAI 符号比较；D28 改为链 ID + 合约地址的资产维表，并使用历史价格形成 USD 口径。
3. 风险分和多跳资金污染为解释性模型，不等于已证实的资金归属；风控题中增加证据、置信度和误报控制。
4. Flink Exactly-once 不能自动解决链重组；Indexing 需要 canonical 状态和历史撤销。

## 测试

题目 255，道题 ID 唯一，HTML 中三段 JavaScript 均通过语法检查，新增图解成功注册。
GitHub Actions 会尝试自动部署 main；这份记录不代表已经验证公网部署完成。

官方参考：https://go.dev/doc/go1.24
源码：https://go.dev/src/sync/map.go
实现：https://go.dev/src/internal/sync/hashtriemap.go
