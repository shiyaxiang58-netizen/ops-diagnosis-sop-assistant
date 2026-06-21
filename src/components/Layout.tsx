import { BarChart3, ClipboardCheck, FileText, LayoutDashboard, RefreshCw, Search, Sparkles } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/AppStore'

const pageTitles: Record<string, string> = {
  '/': '经营概览',
  '/evaluation': '效果评测',
}

export function Layout() {
  const location = useLocation()
  const { resetData } = useAppStore()
  const title = pageTitles[location.pathname] ?? (location.pathname.includes('/sops/') ? 'SOP 编辑器' : '异常详情')

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Sparkles size={20} /></div><div><strong>智序</strong><span>经营问题诊断助手</span></div></div>
      <nav>
        <p className="nav-label">工作台</p>
        <NavLink to="/" end><LayoutDashboard size={18} />经营概览</NavLink>
        <NavLink to="/evaluation"><BarChart3 size={18} />效果评测</NavLink>
        <p className="nav-label">快捷入口</p>
        <a href="/#recent"><ClipboardCheck size={18} />异常工单</a>
        <a href="/#sop-library"><FileText size={18} />SOP 资产</a>
      </nav>
      <div className="sidebar-foot">
        <div className="ai-status"><span className="status-dot" /><div><strong>模拟 AI 已启用</strong><small>离线演示模式</small></div></div>
        <button className="ghost-button full" onClick={() => { if (window.confirm('确定恢复初始演示数据吗？当前浏览器中的编辑结果会被覆盖。')) resetData() }}><RefreshCw size={15} />恢复演示数据</button>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div><span className="eyebrow">经营问题诊断与 SOP 助手</span><h1>{title}</h1></div><div className="top-actions"><div className="search"><Search size={16} /><span>搜索工单、SOP...</span><kbd>⌘ K</kbd></div><div className="avatar">林</div></div></header>
      <div className="page"><Outlet /></div>
    </main>
  </div>
}
