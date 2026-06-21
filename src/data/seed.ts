import type { Category, Diagnosis, EvaluationCase, KnowledgeSource, Ticket } from '../types'

export const knowledgeSources: KnowledgeSource[] = [
  {
    id: 'src-shopify',
    title: '订单履约与发货处理指南',
    publisher: 'Shopify Help Center',
    url: 'https://help.shopify.com/en/manual/fulfillment/fulfilling-orders',
    summary: '公开说明订单履约、发货状态更新和异常处理的基本步骤。',
    categories: ['订单履约', '客户投诉'],
  },
  {
    id: 'src-google-sre',
    title: 'Managing Incidents',
    publisher: 'Google SRE',
    url: 'https://sre.google/sre-book/managing-incidents/',
    summary: '公开介绍事故响应中的职责划分、沟通、控制和复盘方法。',
    categories: ['系统异常', '项目交付'],
  },
  {
    id: 'src-atlassian',
    title: 'Incident response best practices',
    publisher: 'Atlassian',
    url: 'https://www.atlassian.com/incident-management/incident-response',
    summary: '公开介绍异常分级、响应角色、升级机制及结束后的复盘。',
    categories: ['系统异常', '内部流程', '项目交付'],
  },
]

const templates: Record<Category, Array<[string, string, string, string]>> = {
  客户投诉: [
    ['退款到账时间反复被咨询', '客户三次询问退款进度，客服口径不一致', '客户满意度下降并产生升级投诉', '统一回复并确认退款到账'],
    ['优惠权益未按承诺发放', '活动页面显示赠券但账户未收到', '影响活动信任与复购意愿', '补发权益并修正活动说明'],
    ['重复收到营销短信', '客户退订后仍连续收到触达短信', '存在投诉和品牌风险', '停止触达并确认退订生效'],
    ['售后工单长期无人响应', '工单超过48小时无处理记录', '客户在社交平台公开反馈', '完成响应并建立超时升级机制'],
    ['不同渠道回复结论冲突', '在线客服与电话客服给出不同方案', '客户需要重复解释问题', '形成唯一处理口径并同步渠道'],
    ['补偿方案审批反复退回', '客服提交的补偿申请两次被驳回', '延长客诉解决周期', '明确补偿边界并一次审批通过'],
  ],
  订单履约: [
    ['订单已支付但未进入仓库', '支付成功两小时后仍显示待下发', '订单可能无法按承诺时间发出', '补发仓库指令并核对状态'],
    ['同一订单发生重复发货', '仓库生成两个相同运单号记录', '可能产生货损和追回成本', '拦截重复包裹并修复触发条件'],
    ['库存显示可售但无法出库', '前台可下单，仓库反馈实际缺货', '造成延迟发货和退款', '校准库存并通知受影响客户'],
    ['物流轨迹连续三天未更新', '包裹揽收后无后续节点', '客户集中咨询订单去向', '核查承运商并给出明确时限'],
    ['退款成功后订单仍可发货', '退款完成但仓库任务未取消', '存在货款两失风险', '拦截发货并同步退款状态'],
    ['预售订单提前触发催发货', '系统按普通订单计算履约时限', '运营产生大量无效跟进', '修正规则并恢复预售标签'],
  ],
  系统异常: [
    ['运营后台批量导出失败', '导出任务持续转圈且没有错误提示', '日报无法按时提交', '恢复导出并补充失败告警'],
    ['客服系统间歇性无法登录', '部分坐席收到认证超时提示', '高峰期排队客户增加', '恢复认证并定位超时原因'],
    ['看板指标出现重复计算', '当日订单量较明细高出约20%', '管理层获得错误经营判断', '更正口径并回刷历史数据'],
    ['消息通知延迟半小时', '异常告警晚于实际发生时间', '错过首轮处置窗口', '恢复实时通知并验证延迟'],
    ['移动端上传凭证闪退', '特定系统版本选择图片后退出', '一线人员无法提交验收资料', '提供替代入口并发布修复'],
    ['权限变更后未及时生效', '调岗员工仍可访问原项目', '存在数据访问风险', '回收权限并核查同步链路'],
  ],
  项目交付: [
    ['上线验收标准双方理解不一', '客户按新增口径拒绝签署验收单', '项目回款节点延期', '对齐书面标准并完成验收'],
    ['关键配置未进入交付清单', '上线后发现消息模板仍为测试版本', '客户业务通知内容错误', '修正配置并完善上线检查'],
    ['培训完成但客户不会操作', '参训人员无法独立完成核心流程', '上线后支持工作量激增', '补充实操验收和操作指引'],
    ['需求变更未同步研发排期', '客户确认变更后版本计划未更新', '交付承诺与开发进度冲突', '完成影响评估并重新确认排期'],
    ['数据迁移结果缺少抽检', '全量迁移后发现部分字段为空', '上线数据可信度受到质疑', '回滚问题批次并完成抽样验收'],
    ['项目风险连续两周未升级', '周报标红事项没有责任人推进', '最终影响计划上线日期', '明确升级机制并恢复里程碑'],
  ],
  内部流程: [
    ['合同审批卡在离岗人员', '流程节点负责人休假且无代理人', '签约时间延误两天', '转交代理人并补充自动委托'],
    ['同一数据被多团队重复统计', '运营和财务各自维护订单日报', '口径冲突并浪费人力', '确定唯一数据源和维护责任'],
    ['紧急事项没有明确升级路径', '一线只在群内反复询问', '关键问题无人决策', '建立分级响应与升级联系人'],
    ['离职交接遗漏未结事项', '接手人不知道三个客户待办', '客户跟进中断', '补齐清单并设置交接验收'],
    ['周报问题只有描述没有行动', '连续三周记录同一风险但无负责人', '问题持续积累未闭环', '增加责任人、期限和关闭标准'],
    ['费用报销因材料要求反复退回', '申请人三次补充不同证明', '处理周期超过十个工作日', '一次告知材料清单并标准化审核'],
  ],
}

const owners: Record<Category, string> = {
  客户投诉: '客户运营负责人',
  订单履约: '订单履约经理',
  系统异常: '技术值班负责人',
  项目交付: '项目交付经理',
  内部流程: '流程运营负责人',
}

const evidenceSource: Record<Category, string> = {
  客户投诉: 'src-shopify',
  订单履约: 'src-shopify',
  系统异常: 'src-google-sre',
  项目交付: 'src-atlassian',
  内部流程: 'src-atlassian',
}

function createDiagnosis(category: Category, index: number, symptom: string): Diagnosis {
  const sourceId = evidenceSource[category]
  const confirmed = index % 5 === 0
  return {
    aiCategory: category,
    finalCategory: category,
    confidence: 0.82 + (index % 4) * 0.04,
    aiOwner: owners[category],
    finalOwner: owners[category],
    causes: [
      { id: `cause-${index}-1`, level1: category === '系统异常' ? '系统与配置' : '流程与协作', level2: symptom, evidenceId: sourceId },
      { id: `cause-${index}-2`, level1: '管理机制', level2: '缺少明确责任人、时限或关闭条件', evidenceId: sourceId },
    ],
    evidences: [{ id: `ev-${index}`, sourceId, excerpt: '明确负责人、处理步骤、升级路径和完成验证。', supports: '责任划分与闭环处理建议' }],
    confirmed: { category: confirmed, causes: confirmed, owner: confirmed, evidence: confirmed },
  }
}

export function buildSeedTickets(): Ticket[] {
  const base = new Date('2026-06-22T09:00:00+08:00').getTime()
  let index = 0
  return (Object.entries(templates) as [Category, typeof templates[Category]][]).flatMap(([category, items]) =>
    items.map(([title, symptom, impact, expected]) => {
      index += 1
      const diagnosis = createDiagnosis(category, index, symptom)
      const status = index % 5 === 0 ? '已确认' : index % 3 === 0 ? '待分析' : '待确认'
      return {
        id: `WO-2026-${String(index).padStart(3, '0')}`,
        title,
        scenario: `${category}日常运营场景`,
        symptom,
        impact,
        expected,
        record: '已完成基础信息收集，等待统一诊断与处置。',
        category,
        status,
        owner: owners[category],
        createdAt: new Date(base - index * 7.2e7).toISOString(),
        diagnosis: status === '待分析' ? undefined : diagnosis,
      } satisfies Ticket
    }),
  )
}

export const evaluationCases: EvaluationCase[] = buildSeedTickets().slice(0, 20).map((ticket, index) => ({
  ticketId: ticket.id,
  expected: ticket.category,
  predicted: index === 7 ? '客户投诉' : index === 16 ? '内部流程' : ticket.category,
}))

export const categoryOwners = owners
export const categoryEvidenceSource = evidenceSource
