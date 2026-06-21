import { AlertCircle, ArrowLeft, Bot, Check, CheckCircle2, ChevronRight, ExternalLink, FileText, Loader2, ShieldCheck, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge, EmptyState, StatusBadge } from '../components/Ui'
import { useAppStore } from '../store/AppStore'
import { categories, type ConfirmationKey } from '../types'
import { diagnosisConfirmed } from '../utils/metrics'

const sections: Array<{ key: ConfirmationKey; title: string; description: string }> = [
  { key: 'category', title: '问题分类', description: '确认问题所属业务域' },
  { key: 'causes', title: '原因树', description: '确认直接原因与机制原因' },
  { key: 'owner', title: '责任角色', description: '确认闭环第一责任人' },
  { key: 'evidence', title: '引用来源', description: '确认结论具有可追溯依据' },
]

export function TicketDetail() {
  const { id } = useParams()
  const { tickets, sops, sources, analyzeTicket, confirmDiagnosis, updateDiagnosis, generateSop } = useAppStore()
  const ticket = tickets.find((item) => item.id === id)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  if (!ticket) return <EmptyState title="未找到该工单" description="工单可能已被恢复为演示数据。" />
  const diagnosis = ticket.diagnosis
  const existingSop = sops.find((item) => item.ticketId === ticket.id)
  const allConfirmed = diagnosis ? diagnosisConfirmed(diagnosis.confirmed) : false

  async function analyze() {
    setAnalyzing(true); setError('')
    try { await analyzeTicket(ticket!.id) } catch (e) { setError(e instanceof Error ? e.message : '分析失败') } finally { setAnalyzing(false) }
  }

  function openSop() {
    try { const sop = existingSop ?? generateSop(ticket!.id); navigate(`/sops/${sop.id}`) } catch (e) { setError(e instanceof Error ? e.message : '无法生成SOP') }
  }

  return <>
    <div className="page-toolbar"><Link to="/" className="back-link"><ArrowLeft size={16} />返回概览</Link><div><StatusBadge status={ticket.status} /><span className="mono muted">{ticket.id}</span></div></div>
    <section className="detail-hero"><div><div className="title-line"><h2>{ticket.title}</h2><Badge tone="purple">{ticket.category}</Badge></div><p>{ticket.symptom}</p></div><button className="primary-button" onClick={openSop} disabled={!allConfirmed && !existingSop}><FileText size={16} />{existingSop ? '打开 SOP' : '生成 SOP'}<ChevronRight size={15} /></button></section>
    {error && <div className="alert error"><AlertCircle size={17} />{error}</div>}
    <div className="detail-grid">
      <div className="detail-left">
        <section className="card">
          <div className="card-head"><div><h3>原始工单</h3><p>诊断只基于已记录的业务事实</p></div><Badge tone="neutral">结构化信息</Badge></div>
          <div className="info-grid"><Info label="发生场景" value={ticket.scenario} /><Info label="当前影响" value={ticket.impact} /><Info label="期望结果" value={ticket.expected} /><Info label="处理记录" value={ticket.record} /></div>
        </section>
        <section className="card timeline-card"><div className="card-head"><div><h3>处理进度</h3><p>从录入到 SOP 发布的完整链路</p></div></div><div className="process-line">
          {['工单录入', 'AI诊断', '人工确认', 'SOP生成', '发布复盘'].map((step, index) => <div className={`process-step ${index === 0 || diagnosis || (index >= 2 && allConfirmed) || (index >= 3 && existingSop) ? 'done' : ''}`} key={step}><i>{index < 3 && (index === 0 || diagnosis || allConfirmed) ? <Check size={13} /> : index + 1}</i><span>{step}</span></div>)}
        </div></section>
      </div>
      <section className="card diagnosis-panel">
        <div className="card-head"><div className="ai-title"><span><Bot size={20} /></span><div><h3>智能诊断建议</h3><p>AI 提议，关键结果由人工确认</p></div></div>{diagnosis && <Badge tone="blue">置信度 {Math.round(diagnosis.confidence * 100)}%</Badge>}</div>
        {!diagnosis ? <div className="analysis-empty"><div className="ai-orbit"><Sparkles /></div><h3>尚未生成诊断</h3><p>系统将结合工单信息和公开知识源，生成分类、原因树、责任角色与引用依据。</p><button className="primary-button" onClick={analyze} disabled={analyzing}>{analyzing ? <Loader2 className="spin" size={17} /> : <Sparkles size={17} />}{analyzing ? '正在分析...' : '开始智能诊断'}</button></div> : <div className="diagnosis-sections">
          {sections.map((section, index) => <div className={`diagnosis-section ${diagnosis.confirmed[section.key] ? 'confirmed' : ''}`} key={section.key}>
            <div className="section-heading"><div><span className="section-number">0{index + 1}</span><div><h4>{section.title}</h4><p>{section.description}</p></div></div><button onClick={() => confirmDiagnosis(ticket.id, section.key)} className={diagnosis.confirmed[section.key] ? 'confirm-button checked' : 'confirm-button'}>{diagnosis.confirmed[section.key] ? <><CheckCircle2 size={15} />已确认</> : '确认此项'}</button></div>
            {section.key === 'category' && <div className="compare-box"><div><small>AI 建议</small><strong>{diagnosis.aiCategory}</strong></div><ChevronRight /><label><small>最终确认</small><select value={diagnosis.finalCategory} onChange={(e) => updateDiagnosis(ticket.id, { finalCategory: e.target.value as typeof diagnosis.finalCategory })}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div>}
            {section.key === 'causes' && <div className="cause-tree">{diagnosis.causes.map((cause, i) => <div key={cause.id} className="tree-item"><i /><div><Badge tone={i === 0 ? 'blue' : 'purple'}>{cause.level1}</Badge><strong>{cause.level2}</strong><small>依据：{cause.evidenceId ? '已关联来源' : '暂无证据'}</small></div></div>)}</div>}
            {section.key === 'owner' && <div className="compare-box"><div><small>AI 建议</small><strong>{diagnosis.aiOwner}</strong></div><ChevronRight /><label><small>最终确认</small><input value={diagnosis.finalOwner} onChange={(e) => updateDiagnosis(ticket.id, { finalOwner: e.target.value })} /></label></div>}
            {section.key === 'evidence' && <div className="evidence-list">{diagnosis.evidences.length ? diagnosis.evidences.map((evidence) => { const source = sources.find((item) => item.id === evidence.sourceId); return <a href={source?.url} target="_blank" rel="noreferrer" key={evidence.id}><ShieldCheck size={18} /><div><strong>{source?.title ?? '未知来源'}</strong><p>{evidence.excerpt}</p><small>支持结论：{evidence.supports}</small></div><ExternalLink size={15} /></a> }) : <div className="alert"><AlertCircle size={16} />暂无证据，需人工补充后确认</div>}</div>}
          </div>)}
          <div className={`confirmation-summary ${allConfirmed ? 'ready' : ''}`}><ShieldCheck /><div><strong>{allConfirmed ? '诊断结果已完成确认' : `还需确认 ${Object.values(diagnosis.confirmed).filter((item) => !item).length} 项`}</strong><p>{allConfirmed ? '分类、原因、责任角色和来源均已确认，可以生成 SOP。' : '关键结果全部确认后，系统才会开放 SOP 生成。'}</p></div></div>
        </div>}
      </section>
    </div>
  </>
}

function Info({ label, value }: { label: string; value: string }) { return <div className="info-item"><small>{label}</small><p>{value}</p></div> }
