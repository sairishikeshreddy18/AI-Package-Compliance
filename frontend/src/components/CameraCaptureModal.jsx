import { useEffect, useRef, useState } from 'react'
import { IconCamera, IconClose, IconRefresh } from './Icons'

function CameraCaptureModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [facingMode, setFacingMode] = useState('environment') // 'environment' (back) or 'user' (front)
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null)
  const [cameraError, setCameraError] = useState('')
  const [isInitializing, setIsInitializing] = useState(false)

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  const startCamera = async (mode = facingMode) => {
    stopTracks()
    setIsInitializing(true)
    setCameraError('')
    setCapturedPhotoUrl(null)

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser or environment.')
      }

      const constraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (err) {
      console.warn('Camera initialization error:', err)
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings.'
          : err.message || 'Unable to access camera.'
      )
    } finally {
      setIsInitializing(false)
    }
  }

  useEffect(() => {
    let active = true

    async function initCamera() {
      if (!isOpen) return
      setIsInitializing(true)
      setCameraError('')
      setCapturedPhotoUrl(null)

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access is not supported by your browser or environment.')
        }

        const constraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        if (!active) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
      } catch (err) {
        if (active) {
          console.warn('Camera initialization error:', err)
          setCameraError(
            err.name === 'NotAllowedError'
              ? 'Camera permission denied. Please allow camera access in your browser settings.'
              : err.message || 'Unable to access camera.'
          )
        }
      } finally {
        if (active) {
          setIsInitializing(false)
        }
      }
    }

    if (isOpen) {
      initCamera()
    } else {
      stopTracks()
    }

    return () => {
      active = false
      stopTracks()
    }
  }, [isOpen, facingMode])

  const handleClose = () => {
    stopTracks()
    setCapturedPhotoUrl(null)
    setCameraError('')
    onClose()
  }

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }

  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `label_capture_${Date.now()}.jpg`, {
            type: 'image/jpeg',
          })
          const url = URL.createObjectURL(blob)
          setCapturedPhotoUrl(url)
          // Store captured file reference
          canvasRef.current._capturedFile = file
        }
      },
      'image/jpeg',
      0.92
    )
  }

  const handleRetake = () => {
    if (capturedPhotoUrl) {
      URL.revokeObjectURL(capturedPhotoUrl)
    }
    setCapturedPhotoUrl(null)
    startCamera(facingMode)
  }

  const handleConfirmPhoto = () => {
    const file = canvasRef.current?._capturedFile
    if (file) {
      onCapture(file)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Camera Capture">
      <div className="modal-card camera-modal">
        <div className="modal-header">
          <div className="camera-header-title">
            <IconCamera />
            <strong>Capture Product Label</strong>
          </div>
          <button type="button" className="icon-btn" onClick={handleClose} aria-label="Close camera">
            <IconClose />
          </button>
        </div>

        <div className="camera-viewport-wrap">
          {cameraError ? (
            <div className="camera-error-panel">
              <p className="form-error">{cameraError}</p>
              <p className="muted" style={{ marginTop: '12px', fontSize: '13px' }}>
                You can also use the standard <strong>Upload Image</strong> option or choose a preset
                sample.
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '14px' }}
                onClick={() => setFacingMode((prev) => prev)}
              >
                <IconRefresh /> Retry Camera
              </button>
            </div>
          ) : capturedPhotoUrl ? (
            <div className="camera-preview-captured">
              <img src={capturedPhotoUrl} alt="Captured product label" />
              <div className="capture-badge">Photo Captured</div>
            </div>
          ) : (
            <div className="camera-live-frame">
              <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
              <div className="camera-target-guide">
                <div className="target-corner top-left"></div>
                <div className="target-corner top-right"></div>
                <div className="target-corner bottom-left"></div>
                <div className="target-corner bottom-right"></div>
                <div className="target-scan-line"></div>
                <span className="target-hint">Align package label declarations within frame</span>
              </div>
              {isInitializing && <div className="camera-loading">Initializing Camera...</div>}
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <div className="camera-controls">
          {!capturedPhotoUrl ? (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={toggleFacingMode}
                disabled={!!cameraError}
                title="Switch between front and back camera"
              >
                <IconRefresh /> Switch Camera
              </button>

              <button
                type="button"
                className="shutter-button"
                onClick={handleTakePhoto}
                disabled={!!cameraError || isInitializing}
                aria-label="Capture photo"
              >
                <div className="shutter-inner"></div>
              </button>

              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-secondary" onClick={handleRetake}>
                <IconRefresh /> Retake
              </button>
              <button type="button" className="btn btn-primary" onClick={handleConfirmPhoto}>
                Use This Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CameraCaptureModal
