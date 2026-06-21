import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { buildSeedTickets, evaluationCases, knowledgeSources } from '../data/seed'
import { MockProvider } from '../services/ai'
import type { Category, ConfirmationKey, Diagnosis, SOP, Ticket } from '../types'
import { diagnosisConfirmed } from '../utils/metrics'

const STORAGE_KEY = 'ops-sop-assistant-v1'

interface PersistedState { tickets: Ticket[]; sops: SOP[] }

function buildSeedSops(tickets: Ticket[]): SOP[] {
  return tickets.slice(0, 10).map((ticket, index) => {
    const evidenceIds = index === 7 ? [] : [ticket.diagnosis?.evidences[0]?.id ?? `seed-evidence-${index}`]
    return {
      id: `SOP-${String(index + 1).padStart(3, '0')}`,
      ticketId: ticket.id,
      title: `${ticket.title}处理SOP`,
      scenario: ticket.scenario,
      objective: ticket.expected,
      owner: index === 5 ? '' : ticket.owner,
      prerequisites: '确认工单信息完整，并记录当前状态和影响范围。',
      escalation: '超过2小时未恢复，或影响扩大时升级至部门负责人。',
      endCondition: index === 8 ? '' : `${ticket.expected}，相关人员确认结果并留存处理记录。`,
      steps: [
        { id: `step-${index}-1`, title: '核实问题', owner: ticket.owner, detail: `复核现象：${ticket.symptom}`, doneWhen: '信息、影响范围和时间线已确认' },
        { id: `step-${index}-2`, title: '执行处置', owner: ticket.owner, detail: ticket.expected, doneWhen: '关键状态恢复且无新增异常' },
        { id: `step-${index}-3`, title: '回访与复盘', owner: '运营经理', detail: '通知相关方并记录原因和改进项', doneWhen: '相关方确认并形成复盘记录' },
      ],
      evidenceIds,
      status: index < 6 ? '已发布' : '草稿',
      version: 1,
      versions: [{ version: 1, savedAt: '2026-06-22T08:00:00.000Z', status: index < 6 ? '已发布' : '草稿' }],
      updatedAt: '2026-06-22T08:00:00.000Z',
    }
  })
}

function initialState(): PersistedState {
  const tickets = buildSeedTickets()
  const fallback = { tickets, sops: buildSeedSops(tickets) }
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return fallback
    const parsed = JSON.parse(saved) as PersistedState
    return Array.isArray(parsed.tickets) && Array.isArray(parsed.sops) ? parsed : fallback
  } catch {
    return fallback
  }
}

interface NewTicketInput {
  title: string
  category: Category
  scenario: string
  symptom: string
  impact: string
  expected: string
}

interface AppStoreValue {
  tickets: Ticket[]
  sops: SOP[]
  sources: typeof knowledgeSources
  evaluations: typeof evaluationCases
  addTicket(input: NewTicketInput): Ticket
  analyzeTicket(id: string): Promise<void>
  updateDiagnosis(id: string, patch: Partial<Pick<Diagnosis, 'finalCategory' | 'finalOwner'>>): void
  confirmDiagnosis(id: string, key: ConfirmationKey): void
  generateSop(ticketId: string): SOP
  updateSop(id: string, patch: Partial<SOP>): void
  saveSop(id: string): void
  publishSop(id: string): { ok: boolean; message?: string }
  resetData(): void
}

const AppStoreContext = createContext<AppStoreValue | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState)

  const commit = (updater: (current: PersistedState) => PersistedState) => {
    setState((current) => {
      const next = updater(current)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const value = useMemo<AppStoreValue>(() => ({
    tickets: state.tickets,
    sops: state.sops,
    sources: knowledgeSources,
    evaluations: evaluationCases,
    addTicket(input) {
      const ticket: Ticket = {
        ...input,
        id: `WO-${new Date().getFullYear()}-${String(state.tickets.length + 1).padStart(3, '0')}`,
        status: '待分析', owner: '待分派', record: '用户新建工单，等待智能诊断。', createdAt: new Date().toISOString(),
      }
      commit((current) => ({ ...current, tickets: [ticket, ...current.tickets] }))
      return ticket
    },
    async analyzeTicket(id) {
      const ticket = state.tickets.find((item) => item.id === id)
      if (!ticket) return
      const diagnosis = await new MockProvider().analyze(ticket)
      commit((current) => ({ ...current, tickets: current.tickets.map((item) => item.id === id ? { ...item, diagnosis, status: '待确认' } : item) }))
    },
    updateDiagnosis(id, patch) {
      commit((current) => ({ ...current, tickets: current.tickets.map((ticket) => ticket.id === id && ticket.diagnosis
        ? { ...ticket, diagnosis: { ...ticket.diagnosis, ...patch } }
        : ticket) }))
    },
    confirmDiagnosis(id, key) {
      commit((current) => ({ ...current, tickets: current.tickets.map((ticket) => {
        if (ticket.id !== id || !ticket.diagnosis) return ticket
        const confirmed = { ...ticket.diagnosis.confirmed, [key]: !ticket.diagnosis.confirmed[key] }
        return { ...ticket, status: diagnosisConfirmed(confirmed) ? '已确认' : '待确认', diagnosis: { ...ticket.diagnosis, confirmed } }
      }) }))
    },
    generateSop(ticketId) {
      const existing = state.sops.find((item) => item.ticketId === ticketId)
      if (existing) return existing
      const ticket = state.tickets.find((item) => item.id === ticketId)
      if (!ticket?.diagnosis || !diagnosisConfirmed(ticket.diagnosis.confirmed)) throw new Error('请先完成全部人工确认')
      const now = new Date().toISOString()
      const sop: SOP = {
        id: `SOP-${String(state.sops.length + 1).padStart(3, '0')}`, ticketId, title: `${ticket.title}处理SOP`,
        scenario: ticket.scenario, objective: ticket.expected, owner: ticket.diagnosis.finalOwner,
        prerequisites: '确认工单信息、影响范围和当前处理状态完整。', escalation: '超过约定时限或影响扩大时升级至部门负责人。',
        endCondition: `${ticket.expected}，相关方确认并留存处理记录。`,
        steps: ticket.diagnosis.causes.map((cause, index) => ({
          id: crypto.randomUUID(), title: index === 0 ? '核实与止损' : '纠正与复盘', owner: ticket.diagnosis!.finalOwner,
          detail: index === 0 ? `针对“${cause.level2}”核实范围并采取临时措施。` : '完成根因修复、相关方同步和改进项登记。',
          doneWhen: index === 0 ? '影响范围明确且不再扩大' : '问题关闭且改进项有责任人与期限',
        })),
        evidenceIds: ticket.diagnosis.evidences.map((item) => item.id), status: '草稿', version: 1,
        versions: [{ version: 1, savedAt: now, status: '草稿' }], updatedAt: now,
      }
      commit((current) => ({ tickets: current.tickets.map((item) => item.id === ticketId ? { ...item, status: '已生成SOP' } : item), sops: [sop, ...current.sops] }))
      return sop
    },
    updateSop(id, patch) {
      commit((current) => ({ ...current, sops: current.sops.map((sop) => sop.id === id ? { ...sop, ...patch, updatedAt: new Date().toISOString() } : sop) }))
    },
    saveSop(id) {
      commit((current) => ({ ...current, sops: current.sops.map((sop) => {
        if (sop.id !== id) return sop
        const version = sop.version + 1
        return { ...sop, version, updatedAt: new Date().toISOString(), versions: [...sop.versions, { version, savedAt: new Date().toISOString(), status: sop.status }] }
      }) }))
    },
    publishSop(id) {
      const sop = state.sops.find((item) => item.id === id)
      if (!sop) return { ok: false, message: '未找到SOP' }
      if (!sop.owner.trim()) return { ok: false, message: '请填写责任人后再发布' }
      if (!sop.endCondition.trim()) return { ok: false, message: '请填写结束条件后再发布' }
      if (!sop.evidenceIds.length) return { ok: false, message: '至少保留一个引用来源后才能发布' }
      commit((current) => ({ ...current, sops: current.sops.map((item) => item.id === id ? { ...item, status: '已发布', updatedAt: new Date().toISOString() } : item) }))
      return { ok: true }
    },
    resetData() {
      const tickets = buildSeedTickets()
      const next = { tickets, sops: buildSeedSops(tickets) }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setState(next)
    },
  }), [state])

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore() {
  const context = useContext(AppStoreContext)
  if (!context) throw new Error('useAppStore 必须在 AppStoreProvider 中使用')
  return context
}
