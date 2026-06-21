import { categoryEvidenceSource, categoryOwners, knowledgeSources } from '../data/seed'
import type { Diagnosis, Ticket } from '../types'

export interface AIProvider {
  analyze(ticket: Ticket): Promise<Diagnosis>
}

export class MockProvider implements AIProvider {
  async analyze(ticket: Ticket): Promise<Diagnosis> {
    const sourceId = categoryEvidenceSource[ticket.category]
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      aiCategory: ticket.category,
      finalCategory: ticket.category,
      aiOwner: categoryOwners[ticket.category],
      finalOwner: categoryOwners[ticket.category],
      confidence: 0.89,
      causes: [
        { id: crypto.randomUUID(), level1: '直接原因', level2: ticket.symptom, evidenceId: sourceId },
        { id: crypto.randomUUID(), level1: '机制原因', level2: '责任、时限或结束条件未形成统一标准', evidenceId: sourceId },
      ],
      evidences: [{
        id: crypto.randomUUID(),
        sourceId,
        excerpt: knowledgeSources.find((source) => source.id === sourceId)?.summary ?? '暂无证据',
        supports: '处理流程、责任划分与闭环验证',
      }],
      confirmed: { category: false, causes: false, owner: false, evidence: false },
    }
  }
}

export interface OpenAICompatibleConfig {
  baseUrl: string
  model: string
  apiKey: string
}

export class OpenAICompatibleProvider implements AIProvider {
  constructor(private readonly config: OpenAICompatibleConfig) {}

  async analyze(ticket: Ticket): Promise<Diagnosis> {
    const response = await fetch(`${this.config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.config.apiKey}` },
      body: JSON.stringify({
        model: this.config.model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: '你是经营问题诊断助手。仅输出符合 Diagnosis 结构的 JSON，所有关键结论必须提供 evidence。' },
          { role: 'user', content: JSON.stringify({ ticket, knowledgeSources }) },
        ],
      }),
    })
    if (!response.ok) throw new Error(`API 请求失败（${response.status}）`)
    const payload = await response.json()
    const text = payload?.choices?.[0]?.message?.content
    if (!text) throw new Error('API 未返回可解析的诊断结果')
    const diagnosis = JSON.parse(text) as Diagnosis
    if (!diagnosis.aiCategory || !Array.isArray(diagnosis.causes) || !Array.isArray(diagnosis.evidences)) {
      throw new Error('API 返回格式不符合诊断结构')
    }
    return { ...diagnosis, confirmed: { category: false, causes: false, owner: false, evidence: false } }
  }
}
