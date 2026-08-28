import { createContext, useCallback, useEffect, useState } from 'react'
import {
  INITIAL_SETTINGS,
  sampleHistory,
  sampleScanResult,
} from '../data/mockData'

const AppContext = createContext(null)

const STORAGE_KEYS = {
  HISTORY: 'legalmetrix_history_v1',
  SETTINGS: 'legalmetrix_settings_v1',
  LAST_RESULT: 'legalmetrix_last_result_v1',
}

export function AppProvider({ children }) {
  // 1. Settings state (hydrated from localStorage)
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS
    } catch {
      return INITIAL_SETTINGS
    }
  })

  // 2. Scan History state (hydrated from localStorage)
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY)
      return saved ? JSON.parse(saved) : sampleHistory
    } catch {
      return sampleHistory
    }
  })

  // 3. Last Result state (hydrated from localStorage)
  const [lastResult, setLastResult] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAST_RESULT)
      return saved ? JSON.parse(saved) : sampleScanResult
    } catch {
      return sampleScanResult
    }
  })

  // 4. Current Scan in-flight data
  const [currentScan, setCurrentScan] = useState(null)

  // 5. Global Search query
  const [searchQuery, setSearchQuery] = useState('')

  // 6. Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Legal Metrology PC Rules 2011 Active',
      text: 'Rule engine loaded with standard mandatory declarations.',
      time: 'Just now',
      type: 'info',
    },
  ])

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    } catch (e) {
      console.warn('Failed to save settings to localStorage:', e)
    }
  }, [settings])

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history))
    } catch (e) {
      console.warn('Failed to save history to localStorage:', e)
    }
  }, [history])

  // Sync lastResult to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_RESULT, JSON.stringify(lastResult))
    } catch (e) {
      console.warn('Failed to save lastResult to localStorage:', e)
    }
  }, [lastResult])

  const updateSettings = useCallback((newPartialSettings) => {
    setSettings((prev) => ({ ...prev, ...newPartialSettings }))
  }, [])

  const startScan = useCallback((scanPayload) => {
    // scanPayload can be File or object { file, fileName, fileSize, previewUrl, presetId, category }
    if (scanPayload instanceof File) {
      const previewUrl = URL.createObjectURL(scanPayload)
      setCurrentScan({
        file: scanPayload,
        fileName: scanPayload.name,
        fileSize: scanPayload.size,
        previewUrl,
        category: 'Packaged Food & Beverages',
      })
    } else {
      setCurrentScan(scanPayload)
    }
  }, [])

  const finishScanWithResult = useCallback(
    (resultData) => {
      setLastResult(resultData)

      // Add to history
      const historyEntry = {
        id: resultData.id,
        productName: resultData.productName,
        category: resultData.category || 'General Commodity',
        scannedOn: resultData.scannedOn,
        status: resultData.overallStatus,
        officer: settings.officerName,
        score: resultData.score,
        previewUrl: currentScan?.previewUrl || null,
        fullResult: resultData,
      }

      setHistory((prev) => [historyEntry, ...prev])

      // Add notification for review/non-compliant
      if (resultData.overallStatus === 'non-compliant') {
        setNotifications((prev) => [
          {
            id: Date.now(),
            title: `Violation Alert: ${resultData.productName}`,
            text: `Score: ${resultData.score}% · Non-compliant with LM PC Rules.`,
            time: 'Just now',
            type: 'alert',
          },
          ...prev,
        ])
      }
    },
    [currentScan, settings.officerName]
  )

  const viewScanById = useCallback(
    (scanId) => {
      const found = history.find((item) => item.id === scanId)
      if (found) {
        if (found.fullResult) {
          setLastResult(found.fullResult)
        } else {
          setLastResult({
            id: found.id,
            productName: found.productName,
            category: found.category,
            scannedOn: found.scannedOn,
            overallStatus: found.status,
            score: found.score,
            ...sampleScanResult,
          })
        }
        if (found.previewUrl) {
          setCurrentScan({
            fileName: `${found.productName}.jpg`,
            fileSize: 0,
            previewUrl: found.previewUrl,
          })
        }
        return true
      }
      return false
    },
    [history]
  )

  const deleteScan = useCallback((scanId) => {
    setHistory((prev) => prev.filter((item) => item.id !== scanId))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  const resetHistory = useCallback(() => {
    setHistory(sampleHistory)
  }, [])

  const value = {
    // Settings & shortcuts
    settings,
    updateSettings,
    officerName: settings.officerName,
    setOfficerName: (name) => updateSettings({ officerName: name }),
    officeName: settings.officeName,
    setOfficeName: (office) => updateSettings({ officeName: office }),

    // Scanning flow
    currentScan,
    setCurrentScan,
    startScan,
    lastResult,
    setLastResult,
    finishScanWithResult,

    // History
    history,
    setHistory,
    viewScanById,
    deleteScan,
    clearHistory,
    resetHistory,

    // Search & notifications
    searchQuery,
    setSearchQuery,
    notifications,
    setNotifications,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export { AppContext }
export { useApp } from './useApp'
