import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import UploadScan from './pages/UploadScan'
import Processing from './pages/Processing'
import Results from './pages/Results'
import ComplianceReport from './pages/ComplianceReport'
import History from './pages/History'
import Settings from './pages/Settings'

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="scan" element={<UploadScan />} />
            <Route path="upload" element={<Navigate to="/scan?mode=upload" replace />} />
            <Route path="processing" element={<Processing />} />
            <Route path="results" element={<Results />} />
            <Route path="reports" element={<ComplianceReport />} />
            <Route path="report" element={<Navigate to="/reports" replace />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
