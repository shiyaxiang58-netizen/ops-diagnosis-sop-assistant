import { describe, expect, it } from 'vitest'
import type { EvaluationCase, SOP } from '../types'
import { classificationAgreement, diagnosisConfirmed, sopChecks, sopComplianceRate } from './metrics'

const baseSop: SOP = {
  id: 'SOP-1', ticketId: 'T-1', title: '测试SOP', scenario: '测试', objective: '关闭问题', owner: '负责人',
  prerequisites: '信息完整', escalation: '超时升级', endCondition: '用户确认完成', evidenceIds: ['E-1'], status: '草稿', version: 1,
  steps: [], versions: [], updatedAt: '2026-06-22T00:00:00.000Z',
}

describe('评测指标', () => {
  it('按人工标注与系统预测计算一致率', () => {
    const cases: EvaluationCase[] = [
      { ticketId: '1', expected: '客户投诉', predicted: '客户投诉' },
      { ticketId: '2', expected: '系统异常', predicted: '内部流程' },
    ]
    expect(classificationAgreement(cases)).toBe(50)
  })

  it('检查SOP的责任人、结束条件和来源', () => {
    expect(sopChecks(baseSop)).toEqual({ owner: true, endCondition: true, evidence: true })
    expect(sopChecks({ ...baseSop, owner: '', evidenceIds: [] })).toEqual({ owner: false, endCondition: true, evidence: false })
  })

  it('仅抽查前10条SOP并计算合规率', () => {
    expect(sopComplianceRate([baseSop, { ...baseSop, id: 'SOP-2', endCondition: '' }])).toBe(50)
  })
})

describe('人工确认门禁', () => {
  it('四项全部确认才允许继续', () => {
    expect(diagnosisConfirmed({ category: true, causes: true, owner: true, evidence: true })).toBe(true)
    expect(diagnosisConfirmed({ category: true, causes: false, owner: true, evidence: true })).toBe(false)
  })
})
