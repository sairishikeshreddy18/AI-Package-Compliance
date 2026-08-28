import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  IconClose,
  IconDownload,
  IconRefresh,
  IconReports,
  IconResults,
  IconScan,
  IconSearch,
  IconShieldCheck,
  IconTrash,
} from '../components/Icons'
import StatusBadge from '../components/StatusBadge'
import { useApp } from '../context/AppContext'
import { COMMODITY_CATEGORIES } from '../rules/complianceRules'

function History() {
  const navigate = useNavigate()
  const { history, viewScanById, deleteScan, clearHistory, resetHistory, searchQuery, setSearchQuery } =
    useApp()

  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'compliant' | 'needs-review' | 'non-compliant'
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest') // 'newest' | 'oldest' | 'score_high' | 'score_low'

  const handleOpenScan = (scanId, target = 'results') => {
    viewScanById(scanId)
    navigate(target === 'reports' ? '/reports' : '/results')
  }

  const filteredHistory = useMemo(() => {
    return history
      .filter((item) => {
        // Text Search
        const query = searchQuery.trim().toLowerCase()
        const matchSearch =
          !query ||
          (item.productName && item.productName.toLowerCase().includes(query)) ||
          (item.id && item.id.toLowerCase().includes(query)) ||
          (item.officer && item.officer.toLowerCase().includes(query))

        // Status Filter
        const matchStatus = statusFilter === 'all' || item.status === statusFilter

        // Category Filter
        const matchCategory =
          categoryFilter === 'all' || (item.category && item.category.includes(categoryFilter))

        return matchSearch && matchStatus && matchCategory
      })
      .sort((a, b) => {
        if (sortBy === 'score_high') return (b.score || 0) - (a.score || 0)
        if (sortBy === 'score_low') return (a.score || 0) - (b.score || 0)
        // Default to preserving array order (newest on top)
        return 0
      })
  }, [history, searchQuery, statusFilter, categoryFilter, sortBy])

  const handleExportCsv = () => {
    if (history.length === 0) return

    const headers = ['Case ID', 'Product Name', 'Category', 'Inspection Date', 'Officer', 'Score (%)', 'Status']
    const rows = history.map((item) => [
      item.id,
      `"${(item.productName || '').replace(/"/g, '""')}"`,
      `"${item.category || 'General Commodity'}"`,
      item.scannedOn,
      `"${item.officer || 'A. Sharma'}"`,
      item.score || 0,
      item.status,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `LegalMetrix_Inspection_History_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const compliantCount = history.filter((i) => i.status === 'compliant').length
  const reviewCount = history.filter((i) => i.status === 'needs-review').length
  const failCount = history.filter((i) => i.status === 'non-compliant').length

  return (
    <section className="history-page">
      <div className="page-header">
        <div>
          <div className="page-header-badge">
            <IconShieldCheck />
            <span>Inspection Archive</span>
          </div>
          <h1>Inspection History</h1>
          <p>
            Historical record of all packaged commodity audits saved in local browser storage ({history.length}{' '}
            records).
          </p>
        </div>

        <div className="button-row">
          <button type="button" className="btn btn-secondary" onClick={handleExportCsv} disabled={history.length === 0}>
            <IconDownload /> Export CSV
          </button>
          <Link to="/scan" className="btn btn-primary">
            <IconScan /> New Scan
          </Link>
        </div>
      </div>

      {/* Mini Summary Counters */}
      <div className="history-summary-strip">
        <div className="summary-pill">
          <span>Total Records</span>
          <strong>{history.length}</strong>
        </div>
        <div className="summary-pill success">
          <span>Compliant</span>
          <strong>{compliantCount}</strong>
        </div>
        <div className="summary-pill warning">
          <span>Needs Review</span>
          <strong>{reviewCount}</strong>
        </div>
        <div className="summary-pill danger">
          <span>Non-Compliant</span>
          <strong>{failCount}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card filter-bar-card">
        <div className="filter-grid">
          {/* Search Box */}
          <div className="search-input-wrap">
            <IconSearch />
            <input
              type="search"
              placeholder="Search by Product Name, Case ID, Officer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <IconClose />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="filter-select-wrap">
            <label htmlFor="filter-status" className="filter-label">
              Status:
            </label>
            <select
              id="filter-status"
              className="select-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="compliant">Compliant</option>
              <option value="needs-review">Needs Review</option>
              <option value="non-compliant">Non-Compliant</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="filter-select-wrap">
            <label htmlFor="filter-category" className="filter-label">
              Category:
            </label>
            <select
              id="filter-category"
              className="select-input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {COMMODITY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-select-wrap">
            <label htmlFor="filter-sort" className="filter-label">
              Sort:
            </label>
            <select
              id="filter-sort"
              className="select-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Recent First</option>
              <option value="score_high">Score: High to Low</option>
              <option value="score_low">Score: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main History Table */}
      <article className="card history-table-card">
        {filteredHistory.length === 0 ? (
          <div className="history-empty-box">
            <div className="history-empty-icon">📂</div>
            <h3>No Inspection Records Found</h3>
            <p className="muted">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your search query or filters.'
                : 'No inspection records saved yet. Start by scanning a product.'}
            </p>
            <div className="button-row" style={{ justifyContent: 'center', marginTop: '16px' }}>
              {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setCategoryFilter('all')
                  }}
                >
                  Reset Filters
                </button>
              )}
              <button type="button" className="btn btn-primary" onClick={resetHistory}>
                <IconRefresh /> Load Sample Records
              </button>
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table history-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Inspection Date</th>
                  <th>Officer</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <code className="case-badge">{item.id}</code>
                    </td>
                    <td>
                      <strong>{item.productName}</strong>
                    </td>
                    <td>
                      <span className="category-tag">{item.category || 'General Commodity'}</span>
                    </td>
                    <td>{item.scannedOn}</td>
                    <td>{item.officer || 'A. Sharma'}</td>
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
                        {item.score != null ? `${item.score}%` : '—'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenScan(item.id, 'results')}
                          title="View detailed results"
                        >
                          <IconResults /> Results
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenScan(item.id, 'reports')}
                          title="View inspection report"
                        >
                          <IconReports /> Report
                        </button>
                        <button
                          type="button"
                          className="btn-icon-danger"
                          onClick={() => deleteScan(item.id)}
                          title="Delete record"
                          aria-label="Delete"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Actions */}
        {history.length > 0 && (
          <div className="history-table-footer">
            <span className="muted text-sm">
              Showing {filteredHistory.length} of {history.length} records
            </span>
            <div className="button-row">
              <button type="button" className="text-link text-xs" onClick={resetHistory}>
                Restore Default Demo Records
              </button>
              <button
                type="button"
                className="text-danger text-xs font-semibold"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all inspection history?')) {
                    clearHistory()
                  }
                }}
              >
                Clear All Archive
              </button>
            </div>
          </div>
        )}
      </article>
    </section>
  )
}

export default History
