import type { EvaluationCase, SOP } from '../types'

export function classificationAgreement(cases: EvaluationCase[]) {
  if (!cases.length) return 0
  return Math.round((cases.filter((item) => item.expected === item.predicted).length / cases.length) * 100)
}

export function sopChecks(sop: SOP) {
  return {
    owner: Boolean(sop.owner.trim()),
    endCondition: Boolean(sop.endCondition.trim()),
    evidence: sop.evidenceIds.length > 0,
  }
}

export function sopIsCompliant(sop: SOP) {
  return Object.values(sopChecks(sop)).every(Boolean)
}

export function sopComplianceRate(sops: SOP[]) {
  const sample = sops.slice(0, 10)
  if (!sample.length) return 0
  return Math.round((sample.filter(sopIsCompliant).length / sample.length) * 100)
}

export function diagnosisConfirmed(confirmed: Record<string, boolean>) {
  return Object.values(confirmed).every(Boolean)
}
