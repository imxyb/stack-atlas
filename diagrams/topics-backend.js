/* Domain-correct Go / MySQL / Kafka / Redis / distributed illustrations. */
(()=>{
 const add=window.StackAtlasExtra.register;
 const shape=(v)=>v.map(([id,label,title,nodes,note,layout])=>({id,label,title,nodes:nodes.map(([title,detail,kind])=>({title,detail,kind})),note,layout}));
 const put=(id,name,tag,featured,sub,views,options={})=>add({id,name,tag,featured,sub,description:options.description||sub,kind:options.kind,color:options.color||'#bdeaa0',states:shape(views)});
 put('channelsync','Channel 同步语义','GO / MEMORY MODEL','G02','发送完成和消费完成不能混为一谈',[
  ['unbuffered','无缓冲','同步握手',[['Producer','准备发送值'],['Consumer','接收值并建立同步关系'],['Producer 返回','发送/接收完成握手']], '无缓冲 channel 的发送不能在相应接收发生之前完成；其同步性不等于业务处理已经完成。'],
  ['buffered','有缓冲','发送到队列',[['Producer','发送进入 buffer'],['Channel Buffer','可能仍有未处理元素'],['Consumer','稍后 receive 和处理']],'有缓冲 channel 的发送成功不等于消费者处理完成；需要业务 ACK 才能证明处理。']
 ]);
 put('goroutinecancel','Goroutine 生命周期与取消','GO / CONCURRENCY','G09','任务归属、取消传播与退出确认',[
  ['owned','正常退出','显式所有权',[['入口任务','创建 Context + 总超时'],['有界工作池','执行、检查 ctx.Done'],['Wait / Close','等待子任务，释放连接']],'cancel 是信号，不是强杀；调用方应明确谁创建、谁收尾。'],
  ['leak','泄漏路径','取消被忽略',[['请求超时','Context 被取消'],['子任务未监听','阻塞在 channel / I/O'],['Goroutine 泄漏','资源长期不释放','warning']],'无界 goroutine、无人接收的 channel 和缺少 I/O deadline 是常见泄漏源。']
 ]);
 put('nextkey','Gap / Record / Next-Key 锁区间','MYSQL / INDEX LOCKS','M04','在有序索引上观察间隙与记录保护',[
  ['record','记录锁','Record Lock',[], '记录锁保护命中的索引记录；不会单独阻止两条记录间新增键。'],
  ['gap','间隙锁','Gap Lock',[], 'Gap Lock 抑制间隙中的插入，不等于给所有已有记录上独占记录锁。'],
  ['next','Next-Key','Next-Key Lock',[], 'Next-Key = 索引记录锁 + 其前方间隙；例如 (15,20] 会阻止插入 18。']
 ],{kind:'nextkey',color:'#9bd4e8'});
 put('mysqlwal','Undo / Redo / Binlog 职责和两阶段提交','MYSQL / COMMIT','M05','为什么事务既需要 MVCC，又需要崩溃恢复与复制',[
  ['purpose','三者职责','三种日志为什么共存',[], 'Undo = 事务回滚/MVCC；Redo = InnoDB 崩溃恢复；Binlog = Server 层复制与 CDC。'],
  ['commit','提交协同','Redo 与 Binlog 两阶段提交',[], '示意的是事务提交协调顺序；具体 durable 保证依赖 innodb_flush_log_at_trx_commit 和 sync_binlog 等配置。']
 ],{kind:'logs',color:'#edbb81'});
 put('stockcas','高并发库存/余额条件更新','MYSQL / ATOMIC UPDATE','M08','在数据库落地“不超卖/不透支”不变式',[
  ['unsafe','先查后改','业务分两步读取',[['读库存 = 1','请求 A 和 B 都看到 1'],['两个请求判断可卖','各自以为能够扣减'],['竞争写入','可能发生超卖/丢失更新','warning']],'单独 SELECT 后再 UPDATE 不是跨请求原子操作；还会涉及乐观锁和重试。'],
  ['safe','条件 UPDATE','数据库一次条件写',[['唯一业务请求 ID','事务内先执行幂等约束'],['UPDATE stock = stock - 1','WHERE stock >= 1'],['检查 affected rows','成功一个，另一个失败或重试']],'真正的库存不变式由数据库事务、唯一键和受影响行数保护。']
 ]);
 put('redlock','Redlock 与一致性边界','REDIS / LEASE','R04','锁算法是否足以保护外部资产正确性',[
  ['quorum','多节点尝试','Redlock 的多数派租约',[['多个独立 Redis 节点','客户端按期限申请锁'],['多数派成功','且扣除获取耗时仍有足够 TTL'],['租约期限','并非永远有效']],'多数派租约协议仍受时钟、暂停、网络与故障假设影响。'],
  ['external','外部写正确性','旧客户端恢复',[['A 取得租约后长暂停','租约过期'],['B 取得新租约并写 DB','新版本成功'],['A 恢复写入','旧客户端仍可能修改数据','warning']],'对于不可逆资金写入，资源侧版本/Fencing 或数据库条件事务才是更强的约束。']
 ]);
 put('kafkalog','Kafka Partition、Leader、ISR 与 HW','KAFKA / REPLICATION','K01','副本与消费者可见进度并非同一个偏移量',[
  ['replica','复制关系','Leader 与 ISR',[['Leader Partition','Producer 写入 leader，推进 LEO'],['ISR Followers','合格副本追赶 Leader'],['acks=all','确认条件还依赖 min.insync.replicas']],'ISR 是符合要求的同步副本集合；LEO 表示日志末端下一偏移。'],
  ['watermark','可见水位','HW / LEO 的边界',[['Leader LEO','本地已追加的日志末端'],['High Watermark','ISR 复制进度决定的已提交边界'],['Consumer','常规 fetch 不会暴露未达到 HW 的数据']],'HW 不是“最后一条生产者写入的 offset”，而是副本复制承诺的可见边界。']
 ]);
 put('produceridem','Kafka Producer 幂等写原理','KAFKA / PRODUCER','K03','PID + Epoch + 分区 Sequence Number 的去重边界',[
  ['retry','请求重试','Broker 识别重复批次',[['Producer PID + Epoch','每 Partition 维护 Sequence'],['Broker 记录序号','重复批次被识别'],['重试不重复追加','在相同生产者会话与规则内']],'Kafka 幂等生产者按分区序号去重，而非按业务 orderId 去重。'],
  ['business','业务重复','应用事件重复产生',[['订单服务调用两次','生成两个业务事件'],['Kafka 看到不同序号','都可能合法追加'],['消费者 Inbox / UNIQUE','需要业务幂等保护']],'Producer 幂等不能保证业务方只产生一次消息。']
 ]);
 put('dlq','重试 Topic / Dead Letter Queue','KAFKA / RETRY','K09','失败分类、延迟重试与毒消息隔离',[
  ['transient','暂时性故障','有限次数退避',[['Consumer 处理失败','识别网络超时或服务过载'],['Delay/Retry Topic','指数退避 + Jitter，限制预算'],['原 Topic / 业务更新','成功后幂等落库']],'重试应隔离线程和队列；过多重试会放大下游故障。'],
  ['poison','永久性错误','进入 DLQ',[['无法解析 / 规则拒绝','判断不可重试'],['DLQ + 错误上下文','保存 key、次数、原因'],['人工修复后重放','记录可追踪的补偿流程']],'DLQ 不等于可以丢弃消息，应提供监控、审计及幂等回放。']
 ]);
 put('outbox','订单支付 → Outbox → 扣库存 / 发券','EVENTS / OUTBOX','C04','业务效果必须幂等，Kafka 事务不覆盖外部 DB',[
  ['publish','生产者事务','避免数据库与 MQ 双写',[['支付数据库事务','订单 PAID + Outbox 同事务'],['CDC / Relay','发布 Kafka 事件'],['Kafka Topic','可重试投递，不承诺唯一业务效果']],'Outbox 保证数据库写入与待发送事件原子持久化；消息仍可能重复。'],
  ['consume','消费端事务','跨服务最终一致',[['库存 Inbox UNIQUE','与条件扣减同一 DB 事务'],['发券消费者','按 payment_event_id 幂等'],['对账补偿','检查长时间中间状态']],'Kafka 至 MySQL 的 Exactly-once 业务效果要靠消费者端唯一键和事务。']
 ]);
 put('idempotency','API 幂等状态机','DISTRIBUTED / IDEMPOTENCY','H05','一次业务请求跨超时与重试保持同一个结果',[
  ['success','首次执行','强业务键',[['Client 请求 requestId','持久建立 UNIQUE Key'],['DB 事务处理','余额与结果原子写入'],['存结果/状态','后续重复请求返回相同业务状态']],'幂等不只是请求去重缓存；资金效果和幂等记录必须持久关联。'],
  ['unknown','结果未知','提交成功但响应超时',[['数据库已提交','客户端未收到 ACK'],['客户端原 requestId 重试','禁止再扣一次'],['查询既有结果','返回已确认状态']],'超时并不能直接推断失败；在提交结果未知时必须查询已有业务记录。']
 ]);
})();
