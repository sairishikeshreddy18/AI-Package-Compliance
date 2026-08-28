import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IconDownload,
  IconPrint,
  IconShieldCheck,
} from '../components/Icons'
import StatusBadge from '../components/StatusBadge'
import { useApp } from '../context/AppContext'

function ComplianceReport() {
  const { lastResult, settings, history, viewScanById } = useApp()
  const [copiedSummary, setCopiedSummary] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadJson = () => {
    const reportData = {
      reportType: 'Legal Metrology Inspection Audit Report',
      department: 'Department of Consumer Affairs, Legal Metrology Division',
      office: settings.officeName,
      inspector: {
        name: settings.officerName,
        badgeNumber: settings.badgeNumber,
        designation: settings.designation,
      },
      caseDetails: {
        id: lastResult.id,
        scannedOn: lastResult.scannedOn,
        productName: lastResult.productName,
        category: lastResult.category,
        overallStatus: lastResult.overallStatus,
        complianceScore: lastResult.score,
      },
      declarationsChecked: lastResult.checks,
      statutoryRemarks: lastResult.remarks,
      generatedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `LM_Report_${lastResult.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopySummary = () => {
    const summaryText = `LEGAL METROLOGY INSPECTION REPORT\n================================\nCase ID: ${lastResult.id}\nProduct: ${lastResult.productName}\nStatus: ${lastResult.overallStatus.toUpperCase()} (${lastResult.score}% Compliance)\nOfficer: ${settings.officerName} (${settings.badgeNumber})\nOffice: ${settings.officeName}\nDate: ${lastResult.scannedOn}\n\nStatutory Remarks:\n${lastResult.remarks}`

    navigator.clipboard.writeText(summaryText)
    setCopiedSummary(true)
    setTimeout(() => setCopiedSummary(false), 2000)
  }

  return (
    <section className="report-page">
      {/* Top Action Bar (hidden on print) */}
      <div className="page-header no-print">
        <div>
          <div className="page-header-badge">
            <IconShieldCheck />
            <span>Official Inspection Assessment</span>
          </div>
          <h1>Compliance Inspection Report</h1>
          <p>Official assessment notice under Legal Metrology (Packaged Commodities) Rules, 2011.</p>
        </div>

        <div className="button-row">
          <Link to="/results" className="btn btn-secondary">
            Back to Results
          </Link>
          <button type="button" className="btn btn-secondary" onClick={handleCopySummary}>
            {copiedSummary ? 'Copied!' : 'Copy Summary'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleDownloadJson}>
            <IconDownload /> JSON Export
          </button>
          <button type="button" className="btn btn-primary" onClick={handlePrint}>
            <IconPrint /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Official Government Inspection Report Document */}
      <article className="card official-report-doc">
        {/* Official Header */}
        <div className="report-doc-header">
          <div className="emblem-seal">
            <div className="emblem-circle">⚖️</div>
            <div className="emblem-text">
              <span className="gov-title">GOVERNMENT OF INDIA</span>
              <span className="dept-title">DEPARTMENT OF CONSUMER AFFAIRS</span>
              <span className="division-title">LEGAL METROLOGY DIVISION — ENFORCEMENT WING</span>
            </div>
          </div>

          <div className="report-reference-box">
            <div className="ref-item">
              <span className="ref-label">Report Reference</span>
              <strong>RPT-{lastResult.id.replace('LM-', '')}</strong>
            </div>
            <div className="ref-item">
              <span className="ref-label">Inspection Date</span>
              <strong>{lastResult.scannedOn}</strong>
            </div>
            <div className="ref-item">
              <span className="ref-label">Case File No.</span>
              <code>{lastResult.id}</code>
            </div>
          </div>
        </div>

        <div className="report-divider"></div>

        {/* Section 1: Inspection & Officer Metadata */}
        <div className="report-meta-grid">
          <div className="meta-block">
            <span className="meta-kicker">INSPECTING AUTHORITY</span>
            <p className="meta-name">{settings.officerName}</p>
            <p className="meta-sub">{settings.designation}</p>
            <p className="meta-sub">Badge / ID: {settings.badgeNumber}</p>
            <p className="meta-sub">{settings.officeName}</p>
          </div>

          <div className="meta-block">
            <span className="meta-kicker">COMMODITY UNDER ASSESSMENT</span>
            <p className="meta-name">{lastResult.productName}</p>
            <p className="meta-sub">Category: {lastResult.category || 'Packaged Commodity'}</p>
            <p className="meta-sub">
              Net Quantity: {lastResult.extracted?.netQuantity || 'Not Stated'}
            </p>
            <p className="meta-sub">Declared MRP: {lastResult.extracted?.mrp || 'Not Stated'}</p>
          </div>

          <div className="meta-block status-summary-block">
            <span className="meta-kicker">STATUTORY DETERMINATION</span>
            <div className="report-status-badge-wrap">
              <StatusBadge status={lastResult.overallStatus} size="lg" />
            </div>
            <p className="report-score-display">
              Compliance Rating: <strong>{lastResult.score}%</strong>
            </p>
            <p className="meta-sub-fine">
              Evaluated under Rule 6(1) of LM (Packaged Commodities) Rules, 2011
            </p>
          </div>
        </div>

        {/* Section 2: Statutory Audit Matrix */}
        <div className="report-section">
          <h2 className="report-section-title">1. Statutory Declaration Audit Matrix</h2>
          <div className="table-wrap">
            <table className="table report-table">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Rule Citation</th>
                  <th style={{ width: '25%' }}>Mandatory Requirement</th>
                  <th style={{ width: '25%' }}>Detected Label Declaration</th>
                  <th style={{ width: '15%' }}>Status</th>
                  <th style={{ width: '20%' }}>Inspector Finding</th>
                </tr>
              </thead>
              <tbody>
                {lastResult.checks?.map((check) => (
                  <tr key={check.id}>
                    <td>
                      <span className="rule-badge">{check.ruleNumber}</span>
                    </td>
                    <td>
                      <strong>{check.title}</strong>
                      <div className="text-xs muted">{check.expectedFormat}</div>
                    </td>
                    <td>
                      {check.detectedValue ? (
                        <span className="detected-snippet">{check.detectedValue}</span>
                      ) : (
                        <span className="text-danger font-semibold">MISSING / NOT FOUND</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={check.status} />
                    </td>
                    <td>
                      <span className="text-xs">{check.explanation}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Statutory Observations & Legal Notice */}
        <div className="report-section">
          <h2 className="report-section-title">2. Findings & Legal Enforcement Observations</h2>
          <div className="report-finding-card">
            <p>{lastResult.remarks}</p>
          </div>

          {lastResult.overallStatus === 'non-compliant' && (
            <div className="statutory-warning-card">
              <div className="warning-heading">
                <IconShieldCheck />
                <strong>Statutory Notice Under Section 36 of Legal Metrology Act, 2009</strong>
              </div>
              <p>
                Whoever manufactures, packs, imports, sells, distributes, delivers, offers, exposes or
                possesses for sale any pre-packaged commodity which does not conform to all the
                declarations on the package as prescribed under the Legal Metrology (Packaged
                Commodities) Rules, 2011 shall be punishable with fine which may extend to twenty-five
                thousand rupees, for the second offence to fifty thousand rupees and for the subsequent
                offence with fine which may extend to one lakh rupees or with imprisonment.
              </p>
            </div>
          )}
        </div>

        {/* Section 4: Officer Signature & Stamp Area */}
        <div className="report-signature-grid">
          <div className="sig-block">
            <div className="sig-line"></div>
            <p className="sig-title">Signature of Inspecting Officer</p>
            <p className="sig-detail">
              <strong>{settings.officerName}</strong>
            </p>
            <p className="sig-detail">{settings.designation}</p>
            <p className="sig-detail">Badge No: {settings.badgeNumber}</p>
          </div>

          <div className="seal-block">
            <div className="official-stamp-circle">
              <span>LEGAL METROLOGY</span>
              <span>INSPECTION</span>
              <span>VERIFIED</span>
            </div>
          </div>
        </div>

        <div className="report-doc-footer">
          <span>LegalMetrix Automated Compliance Verification System</span>
          <span>Official Inspection Document · Generated on {new Date().toLocaleDateString('en-IN')}</span>
        </div>
      </article>

      {/* Bottom Historical Reports Archive (no-print) */}
      <article className="card no-print" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div>
            <h2>Previous Inspection Reports</h2>
            <p className="muted">Select any previous inspection case to preview its audit report</p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 5).map((item) => (
                <tr key={item.id}>
                  <td>
                    <code>{item.id}</code>
                  </td>
                  <td>
                    <strong>{item.productName}</strong>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.scannedOn}</td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => viewScanById(item.id)}
                    >
                      Load Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}

export default ComplianceReport
