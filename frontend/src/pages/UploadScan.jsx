import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CameraCaptureModal from '../components/CameraCaptureModal'
import {
  IconCamera,
  IconClose,
  IconScan,
  IconShieldCheck,
  IconSparkles,
  IconUpload,
} from '../components/Icons'
import { useApp } from '../context/AppContext'
import { COMMODITY_CATEGORIES } from '../rules/complianceRules'
import { PRESET_SAMPLES } from '../services/apiService'

const MAX_SIZE_BYTES = 15 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function UploadScan() {
  const navigate = useNavigate()
  const { startScan, settings } = useApp()

  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Packaged Food & Beverages')
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)

  const clearImage = () => {
    if (preview && !preview.startsWith('data:') && !preview.startsWith('preset:')) {
      URL.revokeObjectURL(preview)
    }
    setFile(null)
    setPreview('')
    setSelectedPreset(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const applyFile = (selected) => {
    if (!selected) return

    const name = (selected.name || '').toLowerCase()
    const isValidExt = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext)) || selected.type.startsWith('image/')

    if (!isValidExt) {
      setError('Please upload a valid image (JPG, PNG, WEBP) of the packaged commodity label.')
      return
    }

    if (selected.size > MAX_SIZE_BYTES) {
      setError('Image file is larger than 15 MB. Please select a compressed photo.')
      return
    }

    clearImage()
    setError('')
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setSelectedPreset(null)
  }

  const handleInputChange = (event) => {
    const chosen = event.target.files?.[0]
    if (chosen) {
      applyFile(chosen)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    const dropped = event.dataTransfer?.files?.[0]
    if (dropped) {
      applyFile(dropped)
    }
  }

  const handleSelectPreset = (preset) => {
    setError('')
    setSelectedPreset(preset)
    setSelectedCategory(preset.category)
    setFile({
      name: `${preset.productName}.jpg`,
      size: 142000,
      type: 'image/jpeg',
    })
    // Use an icon placeholder / simulated visual preview
    setPreview(`preset:${preset.id}`)
  }

  const handleCameraCapture = (capturedFile) => {
    applyFile(capturedFile)
  }

  const handleScanSubmit = (event) => {
    event.preventDefault()

    if (!file && !selectedPreset) {
      setError('Please upload an image, capture via camera, or select a preset sample first.')
      return
    }

    // Dispatch scan initialization to context
    startScan({
      file: file instanceof File ? file : null,
      fileName: file ? file.name : `${selectedPreset?.productName}.jpg`,
      fileSize: file ? file.size : 124000,
      previewUrl: preview,
      presetId: selectedPreset ? selectedPreset.id : null,
      category: selectedCategory,
      customFileName: file ? file.name : null,
    })

    navigate('/processing')
  }

  return (
    <section className="upload-page">
      <div className="page-header">
        <div>
          <div className="page-header-badge">
            <IconShieldCheck />
            <span>Statutory Verification Flow</span>
          </div>
          <h1>Scan Packaged Product</h1>
          <p>
            Upload or capture a label image to check mandatory declarations under Legal Metrology
            Rules.
          </p>
        </div>
      </div>

      <div className="upload-layout-grid">
        {/* Main Upload Card */}
        <form className="card upload-card" onSubmit={handleScanSubmit}>
          <input
            ref={fileInputRef}
            className="visually-hidden"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/*"
            onChange={handleInputChange}
          />

          <div className="form-group">
            <label htmlFor="commodity-category" className="form-label">
              Commodity Category
            </label>
            <select
              id="commodity-category"
              className="select-input"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {COMMODITY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {!file ? (
            <div
              className={isDragging ? 'dropzone dragging' : 'dropzone'}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="dropzone-icon">
                <IconUpload />
              </div>
              <h2>Drag and drop label photo here</h2>
              <p className="muted">
                or <strong className="text-link">browse files</strong> from your computer
              </p>
              <p className="dropzone-meta">
                Supported formats: JPG, PNG, WEBP · Max size: 15 MB · High resolution recommended
              </p>
            </div>
          ) : (
            <div className="preview-panel">
              {preview.startsWith('preset:') ? (
                <div className="preset-preview-box">
                  <span className="preset-emoji">{selectedPreset?.thumbnail || '📦'}</span>
                  <div>
                    <strong>{selectedPreset?.productName}</strong>
                    <p className="muted">{selectedPreset?.description}</p>
                  </div>
                </div>
              ) : (
                <img src={preview} alt="Selected label preview" className="preview-image" />
              )}

              <div className="preview-meta">
                <p>
                  <span className="muted">Selected Item</span>
                  <strong>{file.name}</strong>
                </p>
                <p>
                  <span className="muted">Category</span>
                  <strong>{selectedCategory}</strong>
                </p>
                <p>
                  <span className="muted">File Size</span>
                  <strong>{formatFileSize(file.size)}</strong>
                </p>
                <p>
                  <span className="muted">Engine Target</span>
                  <strong>
                    {settings.apiMode === 'live' ? 'Live OCR Backend' : 'Demo Simulation'}
                  </strong>
                </p>
              </div>

              <button type="button" className="btn btn-secondary btn-sm" onClick={clearImage}>
                <IconClose /> Change Image
              </button>
            </div>
          )}

          {error && <p className="form-error">{error}</p>}

          <div className="upload-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <IconUpload />
              Upload Photo
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCameraOpen(true)}
            >
              <IconCamera />
              Use Camera
            </button>

            <button type="submit" className="btn btn-primary" disabled={!file && !selectedPreset}>
              <IconScan />
              Analyze & Verify Compliance
            </button>
          </div>
        </form>

        {/* Side Panel: Presets & Inspector Guidance */}
        <aside className="upload-sidebar">
          <article className="card preset-card">
            <div className="card-header">
              <div>
                <div className="card-kicker">
                  <IconSparkles /> Quick Test Presets
                </div>
                <h2>Test With Real Samples</h2>
                <p className="muted">
                  Click any sample to evaluate realistic packaged commodity scenarios instantly:
                </p>
              </div>
            </div>

            <div className="preset-list">
              {PRESET_SAMPLES.map((preset) => {
                const isSelected = selectedPreset?.id === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`preset-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(preset)}
                  >
                    <span className="preset-thumb">{preset.thumbnail}</span>
                    <div className="preset-info">
                      <div className="preset-title-row">
                        <strong>{preset.productName}</strong>
                        <span className={`preset-badge ${preset.expectedOutcome}`}>
                          {preset.expectedOutcome === 'compliant'
                            ? 'Compliant'
                            : preset.expectedOutcome === 'needs-review'
                            ? 'Review'
                            : 'Violation'}
                        </span>
                      </div>
                      <p className="preset-desc">{preset.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </article>

          <article className="card info-card">
            <h3>Statutory Checklist Guidelines</h3>
            <ul className="guideline-list">
              <li>Ensure good ambient lighting without severe flash reflections.</li>
              <li>Ensure all 8 mandatory declarations are within the frame.</li>
              <li>Include MRP and unit sale price declaration if applicable.</li>
              <li>Verify customer helpline and manufacturer address clarity.</li>
            </ul>
          </article>
        </aside>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </section>
  )
}

export default UploadScan
