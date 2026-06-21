import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardPlus, Clock3, FileCheck2, Plus, TrendingUp, X } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, categoryColor, StatusBadge } from '../components/Ui'
import { useAppStore } from '../store/AppStore'
import { categories, type Category } from '../types'
import { classificationAgreement } from '../utils/metrics'

export function Dashboard() {
  const { tickets, sops, evaluations, addTicket } = useAppStore()
  const [showCreate, setShowCreate] = useState(false)
  const [metricDetail, setMetricDetail] = useState<'tickets' | 'pending' | 'sops' | 'evaluation' | null>(null)
  const navigate = useNavigate()
  const agreement = classificationAgreement(evaluations)
  const pending = tickets.filter((ticket) => ticket.status === '待确认' || ticket.status === '待分析').length
  const published = sops.filter((sop) => sop.status === '已发布').length
  const coverage = Math.round((new Set(sops.map((sop) => sop.ticketId)).size / tickets.length) * 100)
  const distribution = useMemo(() => categories.map((category) => ({ category, count: tickets.filter((ticket) => ticket.category === category).length })), [tickets])
  const recent = [...tickets].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6)

  function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const ticket = addTicket({
      title: String(data.get('title')), category: String(data.get('category')) as Category,
      scenario: String(data.get('scenario')), symptom: String(data.get('symptom')),
      impact: String(data.get('impact')), expected: String(data.get('expected')),
    })
    setShowCreate(false)
    navigate(`/tickets/${ticket.id}`)
  }

  return <>
    <section className="hero-row">
      <div><h2>早上好，一起开始今天的工作吧</h2><p>这里汇总经营异常、诊断进展与 SOP 沉淀情况。当前有 <strong>{pending}</strong> 条问题等待处理。</p></div>
      <button className="primary-button" onClick={() => setShowCreate(true)}><Plus size={17} />录入新工单</button>
    </section>

    <section className="metric-grid">
      <Metric icon={<AlertTriangle />} color="blue" label="异常工单" value={tickets.length} unit="条" note="五类经营场景" trend="查看30条明细" onClick={() => setMetricDetail('tickets')} />
      <Metric icon={<Clock3 />} color="amber" label="待人工确认" value={pending} unit="条" note="需确认分类、原因与来源" trend="查看待办清单" onClick={() => setMetricDetail('pending')} />
      <Metric icon={<FileCheck2 />} color="green" label="SOP 覆盖率" value={coverage} unit="%" note={`${published} 份已正式发布`} trend="查看SOP资产" onClick={() => setMetricDetail('sops')} />
      <Metric icon={<CheckCircle2 />} color="purple" label="分类一致率" value={agreement} unit="%" note="20 条人工标注样本" trend="查看评测对照" onClick={() => setMetricDetail('evaluation')} />
    </section>

    <section className="dashboard-grid">
      <div className="card chart-card">
        <div className="card-head"><div><h3>问题分类分布</h3><p>30 条脱敏工单的五类场景构成</p></div><Badge tone="blue">本期</Badge></div>
        <div className="bar-chart">{distribution.map((item) => <div className="bar-item" key={item.category}>
          <div className="bar-track"><div className="bar-fill" style={{ height: `${Math.max(20, item.count * 12)}%`, background: categoryColor[item.category] }}><span>{item.count}</span></div></div>
          <small>{item.category}</small>
        </div>)}</div>
      </div>
      <div className="card causes-card">
        <div className="card-head"><div><h3>高频根因</h3><p>从已分析工单中聚合</p></div><TrendingUp size={18} className="muted" /></div>
        <div className="cause-list">
          {[['责任人或升级路径不清', 18, 72], ['系统状态未及时同步', 12, 54], ['验收与结束条件缺失', 10, 43], ['跨团队信息口径不一致', 8, 36]].map(([label, count, percent], i) => <div className="cause-row" key={String(label)}>
            <span className="rank">0{i + 1}</span><div><strong>{label}</strong><div className="mini-track"><i style={{ width: `${percent}%` }} /></div></div><b>{count}次</b>
          </div>)}
        </div>
      </div>
    </section>

    <section className="card table-card" id="recent">
      <div className="card-head"><div><h3>近期异常工单</h3><p>优先处理待确认与高影响问题</p></div><button className="text-button">查看全部 <ArrowRight size={15} /></button></div>
      <div className="data-table">
        <div className="table-row table-header"><span>工单编号</span><span>问题概要</span><span>分类</span><span>责任人</span><span>状态</span><span>更新时间</span></div>
        {recent.map((ticket) => <Link className="table-row" to={`/tickets/${ticket.id}`} key={ticket.id}>
          <span className="mono">{ticket.id}</span><span><strong>{ticket.title}</strong><small>{ticket.symptom}</small></span><span><i className="category-dot" style={{ background: categoryColor[ticket.category] }} />{ticket.category}</span><span>{ticket.owner}</span><span><StatusBadge status={ticket.status} /></span><span>{formatDate(ticket.createdAt)}</span>
        </Link>)}
      </div>
    </section>

    <section className="card sop-strip" id="sop-library"><div><div className="sop-icon"><ClipboardPlus /></div><div><h3>SOP 资产库</h3><p>已沉淀 {sops.length} 份结构化 SOP，其中 {published} 份通过校验并发布。</p></div></div><Link to={sops[0] ? `/sops/${sops[0].id}` : '/'} className="secondary-button">打开最近 SOP <ArrowRight size={15} /></Link></section>

    {showCreate && <div className="modal-backdrop"><div className="modal">
      <div className="modal-head"><div><span className="eyebrow">结构化录入</span><h2>新建异常工单</h2></div><button className="icon-button" onClick={() => setShowCreate(false)}><X /></button></div>
      <form onSubmit={submitTicket} className="form-grid">
        <label className="span-2">问题标题<input name="title" required placeholder="用一句话描述核心问题" /></label>
        <label>问题分类<select name="category">{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>发生场景<input name="scenario" required placeholder="例如：订单发货后" /></label>
        <label className="span-2">异常现象<textarea name="symptom" required placeholder="描述观察到的事实，不先下结论" /></label>
        <label>业务影响<textarea name="impact" required placeholder="影响哪些用户或指标" /></label>
        <label>期望结果<textarea name="expected" required placeholder="达到什么状态才算解决" /></label>
        <div className="modal-actions span-2"><button type="button" className="ghost-button" onClick={() => setShowCreate(false)}>取消</button><button className="primary-button"><ClipboardPlus size={16} />创建并诊断</button></div>
      </form>
    </div></div>}

    {metricDetail && <MetricDetailModal type={metricDetail} onClose={() => setMetricDetail(null)} />}
  </>
}

function Metric({ icon, color, label, value, unit, note, trend, onClick }: { icon: React.ReactNode; color: string; label: string; value: number; unit: string; note: string; trend: string; onClick(): void }) {
  return <button className="metric-card metric-card-button" onClick={onClick}><div className={`metric-icon ${color}`}>{icon}</div><div className="metric-label">{label}</div><div className="metric-value">{value}<span>{unit}</span></div><div className="metric-foot"><span>{note}</span><em>{trend} →</em></div></button>
}

function MetricDetailModal({ type, onClose }: { type: 'tickets' | 'pending' | 'sops' | 'evaluation'; onClose(): void }) {
  const { tickets, sops, evaluations } = useAppStore()
  const config = {
    tickets: { title: '异常工单明细', subtitle: '30条脱敏模拟工单，覆盖五类经营场景' },
    pending: { title: '待人工确认清单', subtitle: '需要确认分类、原因树、责任角色与引用来源' },
    sops: { title: 'SOP 资产明细', subtitle: '根据确认后的诊断生成，可编辑、保存版本并发布' },
    evaluation: { title: '分类一致性评测', subtitle: '20条人工标注样本与系统预测逐条对照' },
  }[type]
  const ticketRows = type === 'pending' ? tickets.filter((ticket) => ticket.status === '待确认' || ticket.status === '待分析') : tickets

  return <div className="modal-backdrop"><div className="modal metric-detail-modal">
    <div className="modal-head"><div><span className="eyebrow">指标模拟数据</span><h2>{config.title}</h2><p>{config.subtitle}</p></div><button className="icon-button" onClick={onClose}><X /></button></div>
    <div className="metric-detail-list">
      {(type === 'tickets' || type === 'pending') && ticketRows.map((ticket) => <Link to={`/tickets/${ticket.id}`} className="metric-detail-row" key={ticket.id} onClick={onClose}>
        <span className="detail-index">{ticket.id}</span><div><strong>{ticket.title}</strong><small>{ticket.symptom}</small></div><Badge tone="blue">{ticket.category}</Badge><StatusBadge status={ticket.status} /><ArrowRight size={15} />
      </Link>)}
      {type === 'sops' && sops.map((sop) => <Link to={`/sops/${sop.id}`} className="metric-detail-row" key={sop.id} onClick={onClose}>
        <span className="detail-index">{sop.id}</span><div><strong>{sop.title}</strong><small>责任人：{sop.owner || '待补充'} · 版本 V{sop.version}</small></div><Badge tone={sop.evidenceIds.length ? 'green' : 'amber'}>{sop.evidenceIds.length ? '已有来源' : '缺少来源'}</Badge><StatusBadge status={sop.status} /><ArrowRight size={15} />
      </Link>)}
      {type === 'evaluation' && evaluations.map((item) => { const ticket = tickets.find((entry) => entry.id === item.ticketId); const ok = item.expected === item.predicted; return <div className="metric-detail-row" key={item.ticketId}>
        <span className="detail-index">{item.ticketId}</span><div><strong>{ticket?.title}</strong><small>人工标注：{item.expected} · 系统预测：{item.predicted}</small></div><Badge tone={ok ? 'green' : 'red'}>{ok ? '一致' : '不一致'}</Badge><span className="detail-confidence">{ok ? '通过' : '需复核'}</span>{ok ? <CheckCircle2 size={16} className="green-text" /> : <AlertTriangle size={16} className="red-text" />}
      </div>})}
    </div>
    <div className="metric-detail-footer"><span>以上数据均为脱敏模拟内容，可进入明细继续操作。</span><button className="secondary-button" onClick={onClose}>关闭</button></div>
  </div></div>
}

function formatDate(value: string) { return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) }
