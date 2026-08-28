import { Link, useNavigate } from 'react-router-dom'
import {
  IconAlert,
  IconBox,
  IconCheck,
  IconClock,
  IconReports,
  IconScan,
  IconShieldCheck,
  IconSparkles,
} from '../components/Icons'
import StatusBadge from '../components/StatusBadge'
import { useApp } from '../context/AppContext'
import { commonViolations, weeklyScans } from '../data/mockData'

function formatNumber(value) {
  return value.toLocaleString('en-IN')
}

function Dashboard() {
  const navigate = useNavigate()
  const { history, viewScanById, settings } = useApp()

  // Calculate live dynamic stats based on scan history
  const total = history.length
  const compliantCount = history.filter((item) => item.status === 'compliant').length
  const reviewCount = history.filter((item) => item.status === 'needs-review').length
  const nonCompliantCount = history.filter((item) => item.status === 'non-compliant').length

  const compliantRate = total > 0 ? Math.round((compliantCount / total) * 100) : 100
  const reviewRate = total > 0 ? Math.round((reviewCount / total) * 100) : 0
  const failRate = total > 0 ? Math.max(0, 100 - compliantRate - reviewRate) : 0

  const maxWeek = Math.max(...weeklyScans.map((item) => item.value))
  const maxViolation = Math.max(...commonViolations.map((item) => item.count))
  const ringLength = 2 * Math.PI * 54
  const ringOffset = ringLength - (compliantRate / 100) * ringLength

  const recentScans = history.slice(0, 6)

  const handleOpenScan = (scanId, target = 'results') => {
    viewScanById(scanId)
    navigate(target === 'reports' ? '/reports' : '/results')
  }

  return (
    <section className="dashboard-page">
      <div className="page-header">
        <div>
          <div className="page-header-badge">
            <IconShieldCheck />
            <span>Legal Metrology (Packaged Commodities) Rules, 2011</span>
          </div>
          <h1>Compliance Dashboard</h1>
          <p>
            Field Inspection Monitoring & Automated Label Declaration Assessment for{' '}
            <strong>{settings.officeName}</strong>.
          </p>
        </div>
        <div className="button-row">
          <Link to="/scan" className="btn btn-primary">
            <IconScan />
            New Inspection
          </Link>
        </div>
      </div>

      {/* Quick Status Notice */}
      <div className="hero-banner">
        <div className="hero-content">
          <div className="hero-tag">
            <IconSparkles />
            <span>Active Inspection Engine</span>
          </div>
          <h2>Ready for Automated Packaged Commodity Verification</h2>
          <p>
            Capture or upload any packaged food, edible oil, or commodity label. The engine extracts
            mandatory declarations under Rule 6(1) and flags non-compliances instantly.
          </p>
        </div>
        <div className="hero-action">
          <Link to="/scan" className="btn btn-primary">
            <IconScan /> Start Scan
          </Link>
          <Link to="/history" className="btn btn-secondary">
            View Archive
          </Link>
        </div>
      </div>

      {/* 4 Key Stat Cards */}
      <div className="stat-grid">
        <article className="stat-card">
          <div className="stat-icon">
            <IconBox />
          </div>
          <p className="stat-label">Total Scans Recorded</p>
          <p className="stat-value">{formatNumber(total)}</p>
          <p className="stat-hint">Active inspection database</p>
        </article>

        <article className="stat-card">
          <div className="stat-icon success">
            <IconCheck />
          </div>
          <p className="stat-label">Compliant Packages</p>
          <p className="stat-value text-success">{formatNumber(compliantCount)}</p>
          <p className="stat-hint">{compliantRate}% statutory compliance rate</p>
        </article>

        <article className="stat-card">
          <div className="stat-icon warning">
            <IconClock />
          </div>
          <p className="stat-label">Needs Review / Ambiguous</p>
          <p className="stat-value text-warning">{formatNumber(reviewCount)}</p>
          <p className="stat-hint">{reviewRate}% flagged for officer review</p>
        </article>

        <article className="stat-card">
          <div className="stat-icon danger">
            <IconAlert />
          </div>
          <p className="stat-label">Non-Compliant Violations</p>
          <p className="stat-value text-danger">{formatNumber(nonCompliantCount)}</p>
          <p className="stat-hint">{failRate}% missing mandatory declarations</p>
        </article>
      </div>

      {/* Grid: Compliance Rate & Common Violations */}
      <div className="dashboard-grid">
        <article className="card">
          <div className="card-header">
            <div>
              <h2>Compliance Rate Overview</h2>
              <p className="muted">Proportion of scanned items meeting Rule 6(1) declarations</p>
            </div>
          </div>
          <div className="rate-layout">
            <div className="ring-wrap">
              <svg className="rate-ring" viewBox="0 0 140 140" aria-hidden="true">
                <circle className="rate-track" cx="70" cy="70" r="54" />
                <circle
                  className="rate-progress"
                  cx="70"
                  cy="70"
                  r="54"
                  strokeDasharray={ringLength}
                  strokeDashoffset={ringOffset}
                />
              </svg>
              <div className="ring-label">
                <strong>{compliantRate}%</strong>
                <span>compliant</span>
              </div>
            </div>
            <ul className="legend">
              <li>
                <span className="dot success"></span>
                Compliant · {formatNumber(compliantCount)} ({compliantRate}%)
              </li>
              <li>
                <span className="dot warning"></span>
                Needs review · {formatNumber(reviewCount)} ({reviewRate}%)
              </li>
              <li>
                <span className="dot danger"></span>
                Non-compliant · {formatNumber(nonCompliantCount)} ({failRate}%)
              </li>
            </ul>
          </div>

          <div className="chart-title-sub">Weekly Inspection Activity</div>
          <div className="bar-chart compact">
            {weeklyScans.map((item) => (
              <div key={item.day} className="bar-item">
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ height: `${(item.value / maxWeek) * 100}%` }}
                    title={`${item.day}: ${item.value} scans`}
                  />
                </div>
                <span>{item.day}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <h2>Frequent Statutory Violations</h2>
              <p className="muted">Common declaration deficiencies identified under LM PC Rules</p>
            </div>
          </div>
          <div className="h-bars">
            {commonViolations.map((item) => (
              <div key={item.label} className="h-bar-row wide">
                <span className="violation-label">{item.label}</span>
                <div className="h-bar-track">
                  <div
                    className="h-bar-fill"
                    style={{ width: `${(item.count / maxViolation) * 100}%` }}
                  />
                </div>
                <strong className="violation-count">{item.count}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>

      {/* Recent Scans Table */}
      <article className="card">
        <div className="card-header">
          <div>
            <h2>Recent Product Inspections</h2>
            <p className="muted">Latest packaged commodities evaluated by field officers</p>
          </div>
          <Link to="/history" className="text-link">
            View complete archive ({total}) →
          </Link>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Inspection Date</th>
                <th>Officer</th>
                <th>Score</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentScans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center muted py-4">
                    No scans available. Upload an image to start your first inspection.
                  </td>
                </tr>
              ) : (
                recentScans.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <code className="case-badge">{item.id}</code>
                    </td>
                    <td>
                      <strong>{item.productName}</strong>
                    </td>
                    <td>
                      <span className="category-tag">{item.category || 'Commodity'}</span>
                    </td>
                    <td>{item.scannedOn}</td>
                    <td>{item.officer || settings.officerName}</td>
                    <td>
                      <span
                        className={`score-pill ${
                          item.score >= 90
                            ? 'score-high'
                            : item.score >= 70
                            ? 'score-mid'
                            : 'score-low'
                        }`}
                      >
                        {item.score}%
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenScan(item.id, 'results')}
                        >
                          Results
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenScan(item.id, 'reports')}
                        >
                          <IconReports />
                          Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}

export default Dashboard
