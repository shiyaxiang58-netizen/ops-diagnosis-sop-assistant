export const categories = ['客户投诉', '订单履约', '系统异常', '项目交付', '内部流程'] as const
export type Category = (typeof categories)[number]
export type TicketStatus = '待分析' | '待确认' | '已确认' | '已生成SOP'
export type SopStatus = '草稿' | '已发布'

export interface EvidenceRef {
  id: string
  sourceId: string
  excerpt: string
  supports: string
}

export interface RootCause {
  id: string
  level1: string
  level2: string
  evidenceId?: string
}

export interface Diagnosis {
  aiCategory: Category
  finalCategory: Category
  causes: RootCause[]
  aiOwner: string
  finalOwner: string
  confidence: number
  evidences: EvidenceRef[]
  confirmed: {
    category: boolean
    causes: boolean
    owner: boolean
    evidence: boolean
  }
}

export interface Ticket {
  id: string
  title: string
  scenario: string
  symptom: string
  impact: string
  expected: string
  record: string
  category: Category
  status: TicketStatus
  owner: string
  createdAt: string
  diagnosis?: Diagnosis
}

export interface SopStep {
  id: string
  title: string
  owner: string
  detail: string
  doneWhen: string
}

export interface SopVersion {
  version: number
  savedAt: string
  status: SopStatus
}

export interface SOP {
  id: string
  ticketId: string
  title: string
  scenario: string
  objective: string
  owner: string
  prerequisites: string
  escalation: string
  endCondition: string
  steps: SopStep[]
  evidenceIds: string[]
  status: SopStatus
  version: number
  versions: SopVersion[]
  updatedAt: string
}

export interface KnowledgeSource {
  id: string
  title: string
  publisher: string
  url: string
  summary: string
  categories: Category[]
}

export interface EvaluationCase {
  ticketId: string
  expected: Category
  predicted: Category
}

export type ConfirmationKey = keyof Diagnosis['confirmed']
