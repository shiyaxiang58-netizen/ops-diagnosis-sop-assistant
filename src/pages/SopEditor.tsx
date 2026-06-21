import { AlertCircle, ArrowLeft, CheckCircle2, Clock, ExternalLink, FileCheck2, Plus, Save, ShieldCheck, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, EmptyState, StatusBadge } from '../components/Ui'
import { useAppStore } from '../store/AppStore'
import { sopChecks } from '../utils/metrics'

export function SopEditor() {
  const { id } = useParams()
  const { sops, tickets, sources, updateSop, saveSop, publishSop } = useAppStore()
  const sop = sops.find((item) => item.id === id)
  const [message, setMessage] = useState('')
  if (!sop) return <EmptyState title="未找到该 SOP" description="请从已确认的异常工单重新生成。" />
  const ticket = tickets.find((item) => item.id === sop.ticketId)
  const checks = sopChecks(sop)
  const evidence = ticket?.diagnosis?.evidences.filter((item) => sop.evidenceIds.includes(item.id)) ?? []

  function publish() {
    const result = publishSop(sop!.id)
    setMessage(result.ok ? 'SOP 已发布，概览指标已同步更新。' : result.message ?? '发布失败')
  }

  return <>
    <div className="page-toolbar"><Link to={`/tickets/${sop.ticketId}`} className="back-link"><ArrowLeft size={16} />返回异常详情</Link><div><StatusBadge status={sop.status} /><span className="mono muted">{sop.id} · V{sop.version}</span></div></div>
    <section className="editor-toolbar"><div><input className="title-input" value={sop.title} onChange={(e) => updateSop(sop.id, { title: e.target.value })} /><p>来源工单：{ticket?.id} · 最后保存 {formatTime(sop.updatedAt)}</p></div><div><button className="secondary-button" onClick={() => { saveSop(sop.id); setMessage('已保存为新版本。') }}><Save size={16} />保存版本</button><button className="primary-button" onClick={publish}><FileCheck2 size={16} />发布 SOP</button></div></section>
    {message && <div className={`alert ${message.includes('已发布') || message.includes('已保存') ? 'success' : 'error'}`}>{message.includes('已发布') || message.includes('已保存') ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}{message}</div>}
    <div className="editor-grid">
      <div className="sop-document">
        <div className="document-head"><Badge tone="blue">标准作业程序</Badge><span>由已确认诊断生成 · 支持人工编辑</span></div>
        <EditorField label="适用场景" value={sop.scenario} onChange={(value) => updateSop(sop.id, { scenario: value })} />
        <EditorField label="处理目标" value={sop.objective} onChange={(value) => updateSop(sop.id, { objective: value })} />
        <div className="two-column-fields"><EditorField label="第一责任人 *" value={sop.owner} onChange={(value) => updateSop(sop.id, { owner: value })} /><EditorField label="升级条件" value={sop.escalation} onChange={(value) => updateSop(sop.id, { escalation: value })} /></div>
        <EditorField label="前置条件" value={sop.prerequisites} onChange={(value) => updateSop(sop.id, { prerequisites: value })} />
        <div className="editor-section-title"><div><span>处理步骤</span><small>每一步都必须说明责任人和完成标志</small></div><button className="text-button" onClick={() => updateSop(sop.id, { steps: [...sop.steps, { id: crypto.randomUUID(), title: '新增步骤', owner: sop.owner, detail: '', doneWhen: '' }] })}><Plus size={15} />添加步骤</button></div>
        <div className="steps-editor">{sop.steps.map((step, index) => <div className="step-editor" key={step.id}>
          <span className="step-index">{String(index + 1).padStart(2, '0')}</span><div className="step-body"><div className="step-title-row"><input value={step.title} onChange={(e) => updateSop(sop.id, { steps: sop.steps.map((item) => item.id === step.id ? { ...item, title: e.target.value } : item) })} /><button className="icon-button danger" title="移除此步骤" onClick={() => updateSop(sop.id, { steps: sop.steps.filter((item) => item.id !== step.id) })}><Trash2 size={15} /></button></div>
          <textarea value={step.detail} onChange={(e) => updateSop(sop.id, { steps: sop.steps.map((item) => item.id === step.id ? { ...item, detail: e.target.value } : item) })} />
          <div className="step-meta"><label>责任人<input value={step.owner} onChange={(e) => updateSop(sop.id, { steps: sop.steps.map((item) => item.id === step.id ? { ...item, owner: e.target.value } : item) })} /></label><label>完成标志<input value={step.doneWhen} onChange={(e) => updateSop(sop.id, { steps: sop.steps.map((item) => item.id === step.id ? { ...item, doneWhen: e.target.value } : item) })} /></label></div></div>
        </div>)}</div>
        <EditorField label="结束条件 *" value={sop.endCondition} onChange={(value) => updateSop(sop.id, { endCondition: value })} />
      </div>
      <aside className="editor-aside">
        <section className="card checklist"><div className="card-head"><div><h3>发布检查</h3><p>三项全部满足后才可发布</p></div></div>
          <CheckRow ok={checks.owner} label="已明确第一责任人" /><CheckRow ok={checks.endCondition} label="已填写可验收结束条件" /><CheckRow ok={checks.evidence} label="至少保留一个引用来源" />
        </section>
        <section className="card"><div className="card-head"><div><h3>引用依据</h3><p>可追溯到公开资料与原始诊断</p></div><ShieldCheck size={18} /></div>
          <div className="source-stack">{evidence.length ? evidence.map((item) => { const source = sources.find((s) => s.id === item.sourceId); return <a href={source?.url} target="_blank" rel="noreferrer" key={item.id}><div><strong>{source?.title}</strong><p>{item.excerpt}</p></div><ExternalLink size={14} /></a> }) : <div className="missing-source"><AlertCircle /><strong>暂无引用来源</strong><p>返回异常详情补充并确认来源。</p></div>}</div>
        </section>
        <section className="card version-card"><div className="card-head"><div><h3>版本记录</h3><p>保存时自动生成版本快照</p></div><Clock size={18} /></div>{[...sop.versions].reverse().map((version) => <div className="version-row" key={version.version}><i /><div><strong>版本 V{version.version}</strong><small>{formatTime(version.savedAt)}</small></div><Badge tone={version.status === '已发布' ? 'green' : 'neutral'}>{version.status}</Badge></div>)}</section>
      </aside>
    </div>
  </>
}

function EditorField({ label, value, onChange }: { label: string; value: string; onChange(value: string): void }) { return <label className="editor-field"><span>{label}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} /></label> }
function CheckRow({ ok, label }: { ok: boolean; label: string }) { return <div className={`check-row ${ok ? 'ok' : ''}`}>{ok ? <CheckCircle2 /> : <AlertCircle />}<span>{label}</span><Badge tone={ok ? 'green' : 'amber'}>{ok ? '通过' : '待补充'}</Badge></div> }
function formatTime(value: string) { return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) }
