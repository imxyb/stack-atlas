# 第二份题库整合记录：ERC-20 Allowance、Permit、Permit2、Witness

整合日期：2026-10-28
素材来源：用户上传《粘贴的文本 (1)(6).txt》，内容为围绕 ERC20 授权竞态、Permit、Permit2 与 Witness 的问答讲解。

## 变更结果

- 原有 206 道题目，更新后 210 道。
- 新增 4 道 P0 独立面试题：S20 / S21 / S22 / S23。
- 增强 2 道旧题：S08（签名重放与 EIP-712 / Permit）、S11（非标准 ERC-20 兼容性）。
- 新增 3 组交互式原理图：allowance、permit2、witness（图解总数 17→20）。
- 没有把原对话的每个追问都拆为独立题，避免 Permit 与 Permit2 重复或答案碎片化。

## 题目详情

- **S20**：从旧授权 100 修改到 50，却因 Bob 抢跑和 approve 覆盖语义累计花掉 150。
- **S21**：对比 approve(0)、increaseAllowance / decreaseAllowance 的语义、合约兼容性与风险边界。
- **S22**：比较 ERC-2612、Permit2 AllowanceTransfer、SignatureTransfer，明确基础授权、子额度、Nonce、过期时间。
- **S23**：Witness 如何签入订单上下文，为什么 Router 没有绑定 transferDetails 时签名通过仍可重定向资产。

## 原素材的技术边界修正

1. 先 approve(0) 无法阻止 spender 在零额度交易上链前消费合法旧授权，因此“彻底避免旧 + 新累计消费”的绝对说法不成立。
2. increaseAllowance / decreaseAllowance 并非 ERC-20 标准必需方法；OpenZeppelin Contracts 5.x 已从 ERC20 实现移除非标准方法。
3. ERC-2612 permit 只设置 Token allowance，不直接进行 transferFrom；Permit2 需要 Token 对 Permit2 的基础授权。
4. Permit2 SignatureTransfer 的 transferDetails 中接收者与请求金额并非天然绑定到普通 Permit 授权的所有业务意图；witness 不代替路由合约的参数检查。
5. 仅有 Witness 哈希签名有效不意味着执行正确，必须把具体 recipient、exactAmount、Token、订单、调用者与实际执行关联。

## 原厂参考资料

- https://docs.openzeppelin.com/contracts/5.x/api/token/erc20
- https://docs.openzeppelin.com/contracts/5.x/changelog
- https://eips.ethereum.org/EIPS/eip-2612
- https://developers.uniswap.org/docs/protocols/permit2/overview
- https://developers.uniswap.org/docs/protocols/permit2/concepts/signature-transfer

## 测试与发布

- 线上 HTML 保留全部 210 道题，ID 唯一。
- 三段脚本已分别通过 JavaScript 语法编译检查。
- 图解 meta/defaults/render 注册和 S20–S23 的对应关系已检查。
- 由 GitHub Actions 从 main 分支自动发布；本记录未声称部署已经完成。

## 后续

等待第三份题库素材，继续按语义去重、深度融合，并保留原有题目 ID 以保护收藏和复习记录。
