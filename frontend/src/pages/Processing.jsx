import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconAlert, IconCheck, IconRefresh, IconScan, IconShieldCheck } from '../components/Icons'
import { useApp } from '../context/AppContext'
import { analyzeLabelImage } from '../services/apiService'

const PIPELINE_STEPS = [
  { id: 1, label: 'Image Ingestion & Pre-processing', subtext: 'Optimizing contrast, orientation & text region boundaries' },
  { id: 2, label: 'Optical Character Recognition (OCR)', subtext: 'Extracting text streams and tabular label declarations' },
  { id: 3, label: 'NLP Information & Entity Extraction', subtext: 'Parsing MRP, Net Quantity, Dates, Manufacturer & PIN codes' },
  { id: 4, label: 'Legal Metrology Rule Engine Verification', subtext: 'Evaluating Rule 6(1) declarations against PC Rules, 2011' },
  { id: 5, label: 'Assembling Compliance Audit Report', subtext: 'Computing risk score, violations & statutory references' },
]

function Processing() {
  const navigate = useNavigate()
  const { currentScan, finishScanWithResult, settings, updateSettings } = useApp()

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [progressPercent, setProgressPercent] = useState(12)
  const [processingError, setProcessingError] = useState('')
  const [isRetrying, setIsRetrying] = useState(false)
  const [statusLog, setStatusLog] = useState('Initializing scan pipeline...')

  const executedRef = useRef(false)

  const runPipeline = useCallback(async () => {
    if (!currentScan) {
      navigate('/scan')
      return
    }

    setProcessingError('')
    setCurrentStepIndex(0)
    setProgressPercent(15)
    setStatusLog('Reading label photo bytes...')

    try {
      // Step 1: Pre-processing
      await new Promise((r) => setTimeout(r, 600))
      setCurrentStepIndex(1)
      setProgressPercent(35)
      setStatusLog('Running OCR optical text extraction...')

      // Step 2: OCR
      await new Promise((r) => setTimeout(r, 700))
      setCurrentStepIndex(2)
      setProgressPercent(60)
      setStatusLog('Extracting mandatory Legal Metrology key-value pairs...')

      // Step 3: NLP & Rule Engine (Perform actual analysis)
      const analysisPromise = analyzeLabelImage(currentScan.file || currentScan, {
        apiMode: settings.apiMode,
        apiUrl: settings.apiUrl,
        presetId: currentScan.presetId,
        category: currentScan.category,
        strictness: settings.strictness,
        customFileName: currentScan.customFileName || currentScan.fileName,
      })

      await new Promise((r) => setTimeout(r, 700))
      setCurrentStepIndex(3)
      setProgressPercent(85)
      setStatusLog('Evaluating declarations against LM (PC) Rules, 2011...')

      const result = await analysisPromise

      // Step 4: Finalize
      await new Promise((r) => setTimeout(r, 500))
      setCurrentStepIndex(4)
      setProgressPercent(100)
      setStatusLog('Inspection audit complete!')

      await new Promise((r) => setTimeout(r, 400))

      // Complete and transition
      finishScanWithResult(result)
      navigate('/results')
    } catch (err) {
      console.error('Processing error:', err)
      setProcessingError(err.message || 'An error occurred during label processing.')
    }
  }, [currentScan, finishScanWithResult, navigate, settings])

  useEffect(() => {
    if (!currentScan) {
      navigate('/scan')
      return
    }

    if (!executedRef.current) {
      executedRef.current = true
      runPipeline()
    }
  }, [currentScan, navigate, runPipeline])

  const handleRetry = () => {
    setIsRetrying(true)
    executedRef.current = false
    runPipeline().finally(() => setIsRetrying(false))
  }

  if (!currentScan) {
    return null
  }

  return (
    <section className="processing-page">
      <div className="page-header">
        <div>
          <div className="page-header-badge">
            <IconShieldCheck />
            <span>Automated Inspection Pipeline</span>
          </div>
          <h1>Processing Label Scan</h1>
          <p>Analyzing mandatory packaged commodity declarations under Rule 6(1).</p>
        </div>
      </div>

      <div className="card processing-card">
        <div className="processing-header">
          <div className="processing-mode-tag">
            <span className={`status-indicator-dot ${settings.apiMode === 'live' ? 'live' : 'demo'}`} />
            {settings.apiMode === 'live' ? 'Live OCR Backend Mode' : 'Intelligent Simulation Engine'}
          </div>
          <p className="processing-file-badge">File: {currentScan.fileName}</p>
        </div>

        {processingError ? (
          <div className="processing-error-state">
            <div className="stat-icon danger" style={{ margin: '0 auto 16px' }}>
              <IconAlert />
            </div>
            <h2>Processing Interrupted</h2>
            <p className="form-error" style={{ margin: '12px 0 16px' }}>
              {processingError}
            </p>
            <div className="button-row" style={{ justifyContent: 'center', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                <IconRefresh /> Retry Analysis
              </button>
              {settings.apiMode === 'live' && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    updateSettings({ apiMode: 'demo' })
                    handleRetry()
                  }}
                >
                  Switch to Demo Engine & Continue
                </button>
              )}
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/scan')}>
                Return to Scan
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Animated Scanning Spinner */}
            <div className="processing-visual-box">
              <div className="scanner-animation-ring">
                <div className="spinner"></div>
                <div className="scanner-icon">
                  <IconScan />
                </div>
              </div>
              <div className="progress-outer">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <div className="progress-status-row">
                <span className="status-log-text">{statusLog}</span>
                <strong className="progress-percentage">{progressPercent}%</strong>
              </div>
            </div>

            {/* Stepper Checklist */}
            <div className="pipeline-stepper">
              {PIPELINE_STEPS.map((step, idx) => {
                const isDone = idx < currentStepIndex
                const isActive = idx === currentStepIndex

                return (
                  <div
                    key={step.id}
                    className={`pipeline-step-item ${isDone ? 'done' : isActive ? 'active' : ''}`}
                  >
                    <div className="step-indicator">
                      {isDone ? <IconCheck /> : <span>{step.id}</span>}
                    </div>
                    <div className="step-content">
                      <p className="step-title">{step.label}</p>
                      <p className="step-sub">{step.subtext}</p>
                    </div>
                    {isActive && <span className="step-active-badge">Processing</span>}
                  </div>
                )
              })}
            </div>

            <div className="processing-footer-note">
              <p className="muted">
                {settings.apiMode === 'live'
                  ? `Sending label payload to configured endpoint: ${settings.apiUrl}`
                  : 'Demonstration Mode active: Simulating Legal Metrology OCR & entity extraction.'}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default Processing
