import { useState } from 'react'
import {
  IconCheck,
  IconDownload,
  IconRefresh,
  IconShieldCheck,
  IconSparkles,
  IconTrash,
} from '../components/Icons'
import { useApp } from '../context/AppContext'
import { testBackendConnection } from '../services/apiService'

function Settings() {
  const { settings, updateSettings, history, resetHistory, clearHistory } = useApp()

  const [formData, setFormData] = useState({ ...settings })
  const [saveToast, setSaveToast] = useState(false)
  const [isTestingApi, setIsTestingApi] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    updateSettings(formData)
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2500)
  }

  const handleTestApi = async () => {
    setIsTestingApi(true)
    setTestResult(null)
    const res = await testBackendConnection(formData.apiUrl)
    setTestResult(res)
    setIsTestingApi(false)
  }

  const handleExportAllData = () => {
    const fullBackup = {
      settings: formData,
      history,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    }

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `LegalMetrix_System_Backup_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <section className="settings-page">
      <div className="page-header">
        <div>
          <div className="page-header-badge">
            <IconShieldCheck />
            <span>Application Preferences</span>
          </div>
          <h1>System Settings</h1>
          <p>
            Configure inspector credentials, rule engine strictness, and external OCR/AI backend
            endpoints.
          </p>
        </div>
      </div>

      {saveToast && (
        <div className="save-toast-banner">
          <IconCheck /> Settings successfully saved to browser local storage!
        </div>
      )}

      <form className="settings-form-layout" onSubmit={handleSubmit}>
        {/* Section 1: Inspector Profile */}
        <article className="card settings-section-card">
          <div className="card-header">
            <div>
              <h2>Field Inspector Profile</h2>
              <p className="muted">
                These credentials appear on all generated Legal Metrology inspection notices and audit
                reports.
              </p>
            </div>
          </div>

          <div className="settings-grid">
            <label className="form-group">
              <span className="form-label">Officer Name</span>
              <input
                type="text"
                className="text-input"
                value={formData.officerName || ''}
                onChange={(e) => handleChange('officerName', e.target.value)}
                placeholder="e.g. A. Sharma"
                required
              />
            </label>

            <label className="form-group">
              <span className="form-label">Designation / Title</span>
              <input
                type="text"
                className="text-input"
                value={formData.designation || ''}
                onChange={(e) => handleChange('designation', e.target.value)}
                placeholder="e.g. Senior Legal Metrology Inspector"
              />
            </label>

            <label className="form-group">
              <span className="form-label">Inspector Badge / ID Number</span>
              <input
                type="text"
                className="text-input"
                value={formData.badgeNumber || ''}
                onChange={(e) => handleChange('badgeNumber', e.target.value)}
                placeholder="e.g. LM-IN-40892"
              />
            </label>

            <label className="form-group">
              <span className="form-label">Office / Enforcement Division</span>
              <input
                type="text"
                className="text-input"
                value={formData.officeName || ''}
                onChange={(e) => handleChange('officeName', e.target.value)}
                placeholder="e.g. District Legal Metrology Office, Zone-IV"
                required
              />
            </label>

            <label className="form-group full-width">
              <span className="form-label">Jurisdiction Area</span>
              <input
                type="text"
                className="text-input"
                value={formData.jurisdiction || ''}
                onChange={(e) => handleChange('jurisdiction', e.target.value)}
                placeholder="e.g. Central & State Packaged Commodities Wing"
              />
            </label>
          </div>
        </article>

        {/* Section 2: Backend OCR / AI Integration */}
        <article className="card settings-section-card">
          <div className="card-header">
            <div>
              <div className="card-kicker">
                <IconSparkles /> API & Model Architecture
              </div>
              <h2>OCR / AI Backend Service Integration</h2>
              <p className="muted">
                Connect the frontend to an external FastAPI, Flask, or PyTorch Legal Metrology OCR
                microservice.
              </p>
            </div>
          </div>

          <div className="api-mode-selector">
            <div
              className={`mode-card ${formData.apiMode === 'demo' ? 'active' : ''}`}
              onClick={() => handleChange('apiMode', 'demo')}
            >
              <div className="mode-radio-circle">
                {formData.apiMode === 'demo' && <div className="mode-radio-dot" />}
              </div>
              <div>
                <strong>Demonstration & Simulation Engine (Offline)</strong>
                <p className="muted text-xs">
                  Runs local rule engine on high-accuracy simulated OCR profiles. Perfect for
                  college/SIH demonstrations without starting a backend server.
                </p>
              </div>
            </div>

            <div
              className={`mode-card ${formData.apiMode === 'live' ? 'active' : ''}`}
              onClick={() => handleChange('apiMode', 'live')}
            >
              <div className="mode-radio-circle">
                {formData.apiMode === 'live' && <div className="mode-radio-dot" />}
              </div>
              <div>
                <strong>Live External Backend API (HTTP / REST)</strong>
                <p className="muted text-xs">
                  Sends multipart image files to your custom FastAPI/Flask/Tesseract/YOLO endpoint
                  (<code>POST /analyze</code>).
                </p>
              </div>
            </div>
          </div>

          <div className="api-url-config" style={{ marginTop: '16px' }}>
            <label className="form-group">
              <span className="form-label">Backend API Base Endpoint URL</span>
              <div className="input-with-button">
                <input
                  type="url"
                  className="text-input"
                  value={formData.apiUrl || ''}
                  onChange={(e) => handleChange('apiUrl', e.target.value)}
                  placeholder="http://localhost:8000/api"
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleTestApi}
                  disabled={isTestingApi}
                >
                  <IconRefresh /> {isTestingApi ? 'Pinging...' : 'Test Connection'}
                </button>
              </div>
            </label>

            {testResult && (
              <div
                className={`api-test-feedback ${
                  testResult.online ? 'test-success' : 'test-failure'
                }`}
              >
                <strong>{testResult.online ? '✓ Server Online' : '✕ Server Offline / Unreachable'}</strong>
                <span className="text-xs">{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Backend Integration Specs for Developers / SIH Judges */}
          <details className="backend-spec-details">
            <summary className="text-link text-xs font-semibold">
              View Expected Backend REST API Contract & Payloads
            </summary>
            <div className="backend-spec-content">
              <p className="text-xs muted">
                To connect a Python FastAPI/Flask backend, implement this endpoint:
              </p>
              <pre className="code-snippet">
{`POST /api/analyze
Content-Type: multipart/form-data
Body: { image: File, category: string, strictness: string }

Response JSON:
{
  "productName": "Tata Salt (1kg)",
  "extracted": {
    "commodityName": "Vacuum Evaporated Iodized Salt",
    "manufacturer": "Tata Consumer Products Ltd, Kolkata 700020",
    "netQuantity": "1 kg",
    "mrp": "Rs. 28.00 (inclusive of all taxes)",
    "monthYear": "07/2026",
    "consumerCare": "1800-108-4488, care@tataconsumer.com",
    "countryOfOrigin": "India"
  },
  "rawText": "TATA SALT 1kg..."
}`}
              </pre>
            </div>
          </details>
        </article>

        {/* Section 3: Legal Metrology Rule Configuration */}
        <article className="card settings-section-card">
          <div className="card-header">
            <div>
              <h2>Legal Metrology Rule Engine Parameters</h2>
              <p className="muted">
                Statutory calibration under the Legal Metrology (Packaged Commodities) Rules, 2011.
              </p>
            </div>
          </div>

          <div className="settings-grid">
            <label className="form-group">
              <span className="form-label">Enforcement Strictness Level</span>
              <select
                className="select-input"
                value={formData.strictness || 'standard'}
                onChange={(e) => handleChange('strictness', e.target.value)}
              >
                <option value="standard">Standard Statutory Enforcement (Recommended)</option>
                <option value="strict">Strict / Zero Tolerance (Flag Missing PIN, Format)</option>
                <option value="advisory">Advisory / Educational Mode (Soft Warnings)</option>
              </select>
            </label>

            <label className="form-group">
              <span className="form-label">Theme & Visual Identity</span>
              <input
                type="text"
                className="text-input"
                value="LegalMetrix Bright Yellow (#FFD60A) & Clean White"
                readOnly
                disabled
              />
            </label>
          </div>
        </article>

        {/* Section 4: Data Management & Backup */}
        <article className="card settings-section-card">
          <div className="card-header">
            <div>
              <h2>Data Management & Storage</h2>
              <p className="muted">
                Local storage currently contains <strong>{history.length}</strong> inspection records.
              </p>
            </div>
          </div>

          <div className="data-actions-row">
            <button type="button" className="btn btn-secondary" onClick={handleExportAllData}>
              <IconDownload /> Export All Data & Settings (JSON)
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetHistory}>
              <IconRefresh /> Restore Default Sample Data
            </button>
            <button
              type="button"
              className="btn btn-secondary text-danger"
              onClick={() => {
                if (window.confirm('Clear all locally saved scan history?')) {
                  clearHistory()
                }
              }}
            >
              <IconTrash /> Clear All Local Data
            </button>
          </div>
        </article>

        {/* Save Settings Bar */}
        <div className="settings-submit-bar">
          <button type="submit" className="btn btn-primary btn-lg">
            <IconCheck /> Save Application Settings
          </button>
        </div>
      </form>
    </section>
  )
}

export default Settings
