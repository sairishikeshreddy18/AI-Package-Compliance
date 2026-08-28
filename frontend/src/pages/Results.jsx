import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IconAlert,
  IconCheck,
  IconClock,
  IconEdit,
  IconReports,
  IconScan,
  IconShieldCheck,
  IconSparkles,
} from '../components/Icons'
import StatusBadge from '../components/StatusBadge'
import { useApp } from '../context/AppContext'
import { evaluateCompliance } from '../services/ruleEngine'

function Results() {
  const { lastResult, currentScan, setLastResult, settings } = useApp()

  const [copiedOcr, setCopiedOcr] = useState(false)
  const [editFields, setEditFields] = useState(() => ({ ...(lastResult?.extracted || {}) }))
  const [showEditModal, setShowEditModal] = useState(false)

  if (!lastResult) {
    return (
      <section className="results-empty-state">
        <div className="card text-center py-6">
          <h2>No Inspection Result Available</h2>
          <p className="muted">Please scan a packaged commodity to evaluate statutory compliance.</p>
          <Link to="/scan" className="btn btn-primary" style={{ marginTop: '16px' }}>
            <IconScan /> Start Product Scan
          </Link>
        </div>
      </section>
    )
  }

  const handleCopyOcr = () => {
    if (lastResult.rawOcrText) {
      navigator.clipboard.writeText(lastResult.rawOcrText)
      setCopiedOcr(true)
      setTimeout(() => setCopiedOcr(false), 2000)
    }
  }

  const handleSaveEditedFields = (e) => {
    e.preventDefault()
    const updatedEvaluation = evaluateCompliance(editFields, { strictness: settings.strictness })
    const updatedResult = {
      ...lastResult,
      ...updatedEvaluation,
      extracted: editFields,
    }
    setLastResult(updatedResult)
    setShowEditModal(false)
  }

  const passedCount = lastResult.checks?.filter((c) => c.status === 'passed').length || 0
  const warningCount = lastResult.checks?.filter((c) => c.status === 'warning').length || 0
  const failedCount =
    lastResult.checks?.filter((c) => c.status === 'failed' || c.status === 'missing').length || 0
  const totalCount = lastResult.checks?.length || 0

  return (
    <section className="results-page">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <div className="page-header-badge">
            <IconShieldCheck />
            <span>Inspection Result · Case {lastResult.id}</span>
          </div>
          <h1>{lastResult.productName}</h1>
          <p>
            Category: <strong>{lastResult.category || 'Packaged Commodity'}</strong> · Inspected on{' '}
            {lastResult.scannedOn} · Inspector: <strong>{settings.officerName}</strong>
          </p>
        </div>

        <div className="button-row">
          <StatusBadge status={lastResult.overallStatus} size="lg" />
          <Link to="/reports" className="btn btn-primary">
            <IconReports /> View Formal Report
          </Link>
          <Link to="/scan" className="btn btn-secondary">
            <IconScan /> Scan Another
          </Link>
        </div>
      </div>

      {/* 4 Score Metric Cards */}
      <div className="stat-grid results-stat-grid">
        <article className="stat-card">
          <div className="stat-icon">
            <IconSparkles />
          </div>
          <p className="stat-label">Compliance Score</p>
          <p
            className={`stat-value ${
              lastResult.score >= 90
                ? 'text-success'
                : lastResult.score >= 70
                ? 'text-warning'
                : 'text-danger'
            }`}
          >
            {lastResult.score}%
          </p>
          <div className="progress">
            <div
              className={`progress-fill ${
                lastResult.score >= 90
                  ? 'bg-success'
                  : lastResult.score >= 70
                  ? 'bg-warning'
                  : 'bg-danger'
              }`}
              style={{ width: `${lastResult.score}%` }}
            />
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon success">
            <IconCheck />
          </div>
          <p className="stat-label">Compliant Declarations</p>
          <p className="stat-value text-success">
            {passedCount} / {totalCount}
          </p>
          <p className="stat-hint">Satisfies statutory rule criteria</p>
        </article>

        <article className="stat-card">
          <div className="stat-icon warning">
            <IconClock />
          </div>
          <p className="stat-label">Needs Review / Warnings</p>
          <p className="stat-value text-warning">{warningCount}</p>
          <p className="stat-hint">Ambiguous formatting or partial data</p>
        </article>

        <article className="stat-card">
          <div className="stat-icon danger">
            <IconAlert />
          </div>
          <p className="stat-label">Non-Compliant / Missing</p>
          <p className="stat-value text-danger">{failedCount}</p>
          <p className="stat-hint">Statutory violations detected</p>
        </article>
      </div>

      {/* Main Results Layout */}
      <div className="two-column results-layout">
        {/* Left Column: Label Image & Extracted Values */}
        <div className="results-left-col">
          {/* Label Image Card */}
          <article className="card">
            <div className="card-header">
              <h2>Packaged Commodity Label</h2>
              <span className="case-badge">{lastResult.source || 'Scanned Media'}</span>
            </div>

            {currentScan?.previewUrl && !currentScan.previewUrl.startsWith('preset:') ? (
              <img
                className="result-image"
                src={currentScan.previewUrl}
                alt="Uploaded product label"
              />
            ) : (
              <div className="result-preset-view">
                <div className="preset-large-icon">📦</div>
                <strong>{lastResult.productName}</strong>
                <p className="muted">Preserved Inspection Record</p>
              </div>
            )}

            <div className="image-footer-meta">
              <span>{currentScan?.fileName || `${lastResult.productName}.jpg`}</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setEditFields({ ...(lastResult.extracted || {}) })
                  setShowEditModal(true)
                }}
              >
                <IconEdit /> Edit Fields
              </button>
            </div>
          </article>

          {/* Extracted Attributes Card */}
          <article className="card">
            <div className="card-header">
              <h2>Extracted Declarations</h2>
              <button
                type="button"
                className="text-link text-sm"
                onClick={() => {
                  setEditFields({ ...(lastResult.extracted || {}) })
                  setShowEditModal(true)
                }}
              >
                Modify Values
              </button>
            </div>

            <dl className="detail-list">
              <div>
                <dt>Commodity</dt>
                <dd>{lastResult.extracted?.commodityName || <span className="text-danger">Not Detected</span>}</dd>
              </div>
              <div>
                <dt>Manufacturer / Packer</dt>
                <dd>{lastResult.extracted?.manufacturer || <span className="text-danger">Not Detected</span>}</dd>
              </div>
              <div>
                <dt>Net Quantity</dt>
                <dd>{lastResult.extracted?.netQuantity || <span className="text-danger">Not Detected</span>}</dd>
              </div>
              <div>
                <dt>MRP (Retail Price)</dt>
                <dd>{lastResult.extracted?.mrp || <span className="text-danger">Not Detected</span>}</dd>
              </div>
              <div>
                <dt>Mfg / Packing Date</dt>
                <dd>{lastResult.extracted?.monthYear || <span className="text-danger">Not Detected</span>}</dd>
              </div>
              <div>
                <dt>Consumer Care</dt>
                <dd>{lastResult.extracted?.consumerCare || <span className="text-danger">Not Detected</span>}</dd>
              </div>
              <div>
                <dt>Country of Origin</dt>
                <dd>{lastResult.extracted?.countryOfOrigin || <span className="text-danger">Not Detected</span>}</dd>
              </div>
              {lastResult.extracted?.batchNumber && (
                <div>
                  <dt>Batch / Lot No.</dt>
                  <dd>{lastResult.extracted.batchNumber}</dd>
                </div>
              )}
            </dl>
          </article>

          {/* OCR Raw Text Transcript */}
          {lastResult.rawOcrText && (
            <article className="card ocr-terminal-card">
              <div className="card-header">
                <h2>Raw OCR Transcript</h2>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleCopyOcr}>
                  {copiedOcr ? 'Copied!' : 'Copy OCR'}
                </button>
              </div>
              <pre className="ocr-text-box">{lastResult.rawOcrText}</pre>
            </article>
          )}
        </div>

        {/* Right Column: Detailed Statutory Audit Checklist */}
        <div className="results-right-col">
          <article className="card checklist-card">
            <div className="card-header">
              <div>
                <h2>Legal Metrology Audit Checklist</h2>
                <p className="muted">
                  Statutory checks mandated under Legal Metrology (Packaged Commodities) Rules, 2011
                </p>
              </div>
            </div>

            <div className="checks-accordion-list">
              {lastResult.checks?.map((check) => (
                <div key={check.id} className={`check-card check-${check.status}`}>
                  <div className="check-card-header">
                    <div className="check-title-row">
                      <span className="check-rule-pill">{check.ruleNumber}</span>
                      <strong className="check-title">{check.title}</strong>
                      {check.isSuspicious && (
                        <span className="suspicious-flag-pill" title="Low OCR extraction confidence">
                          ⚠️ Needs Physical Check
                        </span>
                      )}
                    </div>
                    <div className="check-header-badges">
                      {check.confidence > 0 && (
                        <span className="confidence-pill" title="OCR confidence">
                          {check.confidence}% conf.
                        </span>
                      )}
                      <StatusBadge status={check.status} />
                    </div>
                  </div>

                  <div className="check-body">
                    <div className="check-data-row">
                      <span className="check-label">Detected Text:</span>
                      <span className="check-val">
                        {check.detectedValue ? (
                          <code>{check.detectedValue}</code>
                        ) : (
                          <em className="text-danger">Not Found on Label</em>
                        )}
                      </span>
                    </div>

                    <div className="check-data-row">
                      <span className="check-label">Statutory Requirement:</span>
                      <span className="check-requirement">{check.expectedFormat}</span>
                    </div>

                    <div className="check-explanation">
                      <strong>Finding:</strong> {check.explanation}
                    </div>

                    {check.status !== 'passed' && (
                      <div className="check-action-required">
                        <strong>Recommended Action:</strong> {check.recommendedAction}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Inspector Summary Remarks */}
            <div className="remarks-box">
              <h3>Inspector Assessment Summary</h3>
              <p>{lastResult.remarks}</p>
            </div>
          </article>
        </div>
      </div>

      {/* Edit Values Modal */}
      {showEditModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card edit-modal">
            <div className="modal-header">
              <h2>Modify Extracted Declarations</h2>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowEditModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEditedFields}>
              <div className="modal-form-grid">
                <label>
                  Commodity Name
                  <input
                    type="text"
                    value={editFields.commodityName || ''}
                    onChange={(e) =>
                      setEditFields({ ...editFields, commodityName: e.target.value })
                    }
                  />
                </label>
                <label>
                  Manufacturer / Packer Details
                  <textarea
                    rows={2}
                    value={editFields.manufacturer || ''}
                    onChange={(e) =>
                      setEditFields({ ...editFields, manufacturer: e.target.value })
                    }
                  />
                </label>
                <label>
                  Net Quantity (e.g. 1 kg, 500 ml)
                  <input
                    type="text"
                    value={editFields.netQuantity || ''}
                    onChange={(e) => setEditFields({ ...editFields, netQuantity: e.target.value })}
                  />
                </label>
                <label>
                  MRP (with inclusive of all taxes clause)
                  <input
                    type="text"
                    value={editFields.mrp || ''}
                    onChange={(e) => setEditFields({ ...editFields, mrp: e.target.value })}
                  />
                </label>
                <label>
                  Month & Year of Manufacture / Packing
                  <input
                    type="text"
                    value={editFields.monthYear || ''}
                    onChange={(e) => setEditFields({ ...editFields, monthYear: e.target.value })}
                  />
                </label>
                <label>
                  Consumer Care Contact (Phone / Email / Address)
                  <textarea
                    rows={2}
                    value={editFields.consumerCare || ''}
                    onChange={(e) =>
                      setEditFields({ ...editFields, consumerCare: e.target.value })
                    }
                  />
                </label>
                <label>
                  Country of Origin
                  <input
                    type="text"
                    value={editFields.countryOfOrigin || ''}
                    onChange={(e) =>
                      setEditFields({ ...editFields, countryOfOrigin: e.target.value })
                    }
                  />
                </label>
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Re-evaluate Compliance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default Results
