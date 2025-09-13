import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { ConsumerPortal } from './pages/ConsumerPortal'
import { QRScanner } from './pages/QRScanner'
import { ProductStory } from './pages/ProductStory'
import { RegulatorDashboard } from './pages/RegulatorDashboard'
import { StakeholderDashboard } from './pages/StakeholderDashboard'
import { BlockchainExplorer } from './pages/BlockchainExplorer'
import { AdminDashboard } from './pages/AdminDashboard'
import { LoginPage } from './pages/LoginPage'
import { NotFound } from './pages/NotFound'
import { AnalyticsDashboard } from './pages/AnalyticsDashboard'
import { GeoAnalyticsDashboard } from './pages/GeoAnalyticsDashboard'
import { ComplianceReports } from './pages/ComplianceReports'
import { AuditLogs } from './pages/AuditLogs'
import { TestPage } from './TestPage'
import { useAuthStore } from './stores'

function App() {
  const { initializeAuth } = useAuthStore()
  
  useEffect(() => {
    // Initialize auth state from localStorage on app start
    if (initializeAuth) {
      initializeAuth()
    }
  }, [])
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/consumer" element={<ConsumerPortal />} />
        <Route path="/scan" element={<QRScanner />} />
        <Route path="/product/:batchId" element={<ProductStory />} />
        <Route path="/regulator" element={<RegulatorDashboard />} />
        <Route path="/stakeholder" element={<StakeholderDashboard />} />
        <Route path="/explorer" element={<BlockchainExplorer />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/geo-analytics" element={<GeoAnalyticsDashboard />} />
        <Route path="/compliance" element={<ComplianceReports />} />
        <Route path="/audit" element={<AuditLogs />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

export default App