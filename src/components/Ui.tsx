import type { ReactNode } from 'react'
import type { Category, TicketStatus } from '../types'

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'purple' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function StatusBadge({ status }: { status: TicketStatus | '草稿' | '已发布' }) {
  const tone = status === '已发布' || status === '已确认' || status === '已生成SOP' ? 'green' : status === '待确认' ? 'amber' : 'blue'
  return <Badge tone={tone}>{status}</Badge>
}

export const categoryColor: Record<Category, string> = {
  客户投诉: '#7259d6', 订单履约: '#2c78dc', 系统异常: '#e5655f', 项目交付: '#e49b38', 内部流程: '#2a9b82',
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><div>◇</div><strong>{title}</strong><p>{description}</p></div>
}
