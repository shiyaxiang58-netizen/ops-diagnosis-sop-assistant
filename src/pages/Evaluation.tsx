import { AlertTriangle, CheckCircle2, ClipboardCheck, FileSearch, Target, XCircle } from 'lucide-react'
import { Badge } from '../components/Ui'
import { useAppStore } from '../store/AppStore'
import { classificationAgreement, sopChecks, sopComplianceRate } from '../utils/metrics'

export function Evaluation() {
  const { evaluations, tickets, sops } = useAppStore()
  const agreement = classificationAgreement(evaluations)
  const sample = sops.slice(0, 10)
  const compliance = sopComplianceRate(sops)
  const passed = evaluations.filter((item) => item.expected === item.predicted).length

  return <>
    <section className="hero-row evaluation-hero"><div><h2>用标注与规则验证，而不是凭感觉判断</h2><p>20 条人工分类样本 + 10 条 SOP 完整性抽查，清楚看到系统哪里可靠、哪里需要改进。</p></div><Badge tone="green">评测集 v1.0</Badge></section>
    <section className="metric-grid evaluation-metrics">
      <EvalMetric icon={<Target />} label="分类一致率" value={`${agreement}%`} detail={`${passed} / ${evaluations.length} 条与人工标注一致`} tone="blue" />
      <EvalMetric icon={<ClipboardCheck />} label="SOP 合规率" value={`${compliance}%`} detail={`${sample.filter((item) => Object.values(sopChecks(item)).every(Boolean)).length} / ${sample.length} 条通过三项检查`} tone="green" />
      <EvalMetric icon={<FileSearch />} label="评测样本" value="30" detail="20 条分类 + 10 条 SOP" tone="purple" />
      <EvalMetric icon={<AlertTriangle />} label="待改进项" value={String((evaluations.length - passed) + sample.filter((item) => !Object.values(sopChecks(item)).every(Boolean)).length)} detail="可下钻查看具体失败原因" tone="amber" />
    </section>

    <section className="evaluation-grid">
      <div className="card table-card">
        <div className="card-head"><div><h3>分类一致性明细</h3><p>系统预测与人工金标准逐条对照</p></div><Badge tone="blue">20 条</Badge></div>
        <div className="eval-table"><div className="eval-row eval-head"><span>工单</span><span>人工标注</span><span>系统分类</span><span>结果</span></div>
          {evaluations.map((item) => { const ticket = tickets.find((t) => t.id === item.ticketId); const ok = item.expected === item.predicted; return <div className="eval-row" key={item.ticketId}><span><strong>{ticket?.title}</strong><small>{item.ticketId}</small></span><span><Badge tone="neutral">{item.expected}</Badge></span><span><Badge tone={ok ? 'blue' : 'red'}>{item.predicted}</Badge></span><span className={ok ? 'result-ok' : 'result-bad'}>{ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}{ok ? '一致' : '不一致'}</span></div> })}
        </div>
      </div>
      <div className="card table-card">
        <div className="card-head"><div><h3>SOP 完整性抽查</h3><p>来源、责任人、结束条件缺一不可</p></div><Badge tone="purple">10 条</Badge></div>
        <div className="sop-eval-list">{sample.map((sop) => { const checks = sopChecks(sop); const ok = Object.values(checks).every(Boolean); const missing = [!checks.evidence && '缺少来源', !checks.owner && '缺少责任人', !checks.endCondition && '缺少结束条件'].filter(Boolean).join('、'); return <div className="sop-eval-row" key={sop.id}><div className={ok ? 'eval-icon ok' : 'eval-icon bad'}>{ok ? <CheckCircle2 /> : <AlertTriangle />}</div><div><strong>{sop.title}</strong><small>{sop.id} · {ok ? '三项检查全部通过' : missing}</small></div><Badge tone={ok ? 'green' : 'amber'}>{ok ? '通过' : '需完善'}</Badge></div> })}</div>
      </div>
    </section>
    <section className="card insight-card"><div className="insight-icon">AI</div><div><h3>评测结论</h3><p>当前分类一致率达到 {agreement}%。主要误差集中在相邻业务域边界，例如“履约问题引发投诉”以及“项目风险未升级”与内部流程问题。下一轮应补充分界样例，并要求模型优先判断问题的首要责任域。</p></div></section>
  </>
}

function EvalMetric({ icon, label, value, detail, tone }: { icon: React.ReactNode; label: string; value: string; detail: string; tone: string }) { return <div className="metric-card eval-metric"><div className={`metric-icon ${tone}`}>{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div> }
