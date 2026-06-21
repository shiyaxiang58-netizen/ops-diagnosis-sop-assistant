import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Evaluation } from './pages/Evaluation'
import { SopEditor } from './pages/SopEditor'
import { TicketDetail } from './pages/TicketDetail'

export function App() {
  return <Routes><Route element={<Layout />}>
    <Route path="/" element={<Dashboard />} />
    <Route path="/tickets/:id" element={<TicketDetail />} />
    <Route path="/sops/:id" element={<SopEditor />} />
    <Route path="/evaluation" element={<Evaluation />} />
  </Route></Routes>
}
