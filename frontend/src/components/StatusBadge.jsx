function StatusBadge({ status, size = 'normal' }) {
  const labelMap = {
    compliant: 'Compliant',
    'non-compliant': 'Non-compliant',
    pending: 'Pending',
    'needs-review': 'Needs Review',
    passed: 'Compliant',
    failed: 'Non-compliant',
    warning: 'Needs Review',
    found: 'Present',
    missing: 'Missing',
    live: 'Live API',
    demo: 'Demo Mode',
  }

  const classMap = {
    compliant: 'badge badge-success',
    'non-compliant': 'badge badge-danger',
    pending: 'badge badge-warning',
    'needs-review': 'badge badge-warning',
    passed: 'badge badge-success',
    failed: 'badge badge-danger',
    warning: 'badge badge-warning',
    found: 'badge badge-success',
    missing: 'badge badge-danger',
    live: 'badge badge-primary',
    demo: 'badge badge-neutral',
  }

  const sizeClass = size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : ''
  const statusKey = (status || '').toLowerCase()

  return (
    <span className={`${classMap[statusKey] || 'badge'} ${sizeClass}`}>
      {labelMap[statusKey] || status}
    </span>
  )
}

export default StatusBadge
