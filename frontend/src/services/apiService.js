import { evaluateCompliance, extractEntitiesFromRawText } from './ruleEngine.js'

/**
 * Realistic preset packaged commodities for instant testing & demonstrations
 */
export const PRESET_SAMPLES = [
  {
    id: 'PRESET-TATA-SALT',
    productName: 'Tata Salt (Vacuum Evaporated Iodized)',
    category: 'Packaged Food & Beverages',
    expectedOutcome: 'compliant',
    thumbnail: '🧂',
    description: 'Compliant sample: Complete 8 declarations with standard metric units and tax clause.',
    extracted: {
      commodityName: 'Vacuum Evaporated Iodized Salt',
      manufacturer:
        'Tata Consumer Products Ltd., 1, Bishop Lefroy Road, Kolkata, West Bengal - 700020. Regd. Office: Mumbai.',
      netQuantity: '1 kg',
      mrp: 'Rs. 28.00 (inclusive of all taxes)',
      monthYear: '07/2026',
      consumerCare:
        'Toll-Free: 1800-108-4488, Email: care@tataconsumer.com, Address: Consumer Care Manager, Kolkata 700020',
      countryOfOrigin: 'India',
      expiryDate: 'Best Before 24 Months from Packaging',
      batchNumber: 'B.No. TS-26G-902',
    },
    rawOcrText: `TATA SALT
VACUUM EVAPORATED IODIZED SALT
Net Quantity: 1 kg
MRP: Rs. 28.00 (inclusive of all taxes)
Unit Sale Price: Rs. 0.028 / g
Pkd On: 07/2026  |  Use By: 06/2028
Batch No: TS-26G-902
Manufactured & Marketed By: Tata Consumer Products Ltd.
1, Bishop Lefroy Road, Kolkata, West Bengal - 700020
Country of Origin: India
For feedback/queries, write to Consumer Care Manager at above address
or Call Toll Free: 1800-108-4488 | Email: care@tataconsumer.com
FSSAI Lic. No. 10014031001025`,
  },
  {
    id: 'PRESET-AASHIRVAAD-ATTA',
    productName: 'Aashirvaad Superior MP Atta',
    category: 'Food Grains & Pulses',
    expectedOutcome: 'non-compliant',
    thumbnail: '🌾',
    description:
      'Non-compliant sample: Consumer care helpline missing and non-standard date format.',
    extracted: {
      commodityName: 'Whole Wheat Flour (Atta)',
      manufacturer: 'ITC Limited, 37 J.L. Nehru Road, Kolkata, WB - 700071',
      netQuantity: '5 kg',
      mrp: 'Rs. 278.00 (inclusive of all taxes)',
      monthYear: '2026',
      consumerCare: '',
      countryOfOrigin: 'India',
      expiryDate: '',
      batchNumber: 'LOT-441B',
    },
    rawOcrText: `AASHIRVAAD SHARBATI ATTA
100% Whole Wheat Flour
Net Wt: 5 kg
Max Retail Price: Rs. 278.00 (inclusive of all taxes)
Mfg Year: 2026
Lot No: LOT-441B
Manufactured by: ITC Limited, 37 J.L. Nehru Road, Kolkata 700071
Country of Origin: India`,
  },
  {
    id: 'PRESET-AMUL-GHEE',
    productName: 'Amul Pure Ghee (1L Pet Jar)',
    category: 'Edible Oils & Fats',
    expectedOutcome: 'needs-review',
    thumbnail: '🧈',
    description:
      'Needs Review sample: MRP lacks explicit "(inclusive of all taxes)" statement.',
    extracted: {
      commodityName: 'Pure Ghee',
      manufacturer:
        'Gujarat Co-operative Milk Marketing Federation Ltd., Amul Dairy Road, Anand - 388001, Gujarat',
      netQuantity: '1 L (905 g)',
      mrp: 'Rs. 650.00',
      monthYear: '08/2026',
      consumerCare: 'Helpline: 1800-258-3333, Email: customercare@amul.coop',
      countryOfOrigin: 'India',
      expiryDate: 'Best Before 9 Months from packaging',
      batchNumber: 'B.No. GHE-190',
    },
    rawOcrText: `AMUL PURE GHEE
Net Volume: 1 L (905 g)
MRP: Rs. 650.00
Packed: 08/2026  |  Best Before: 9 Months
Batch: GHE-190
Marketed by: GCMMF Ltd., Anand 388001, Gujarat, India
Country of Origin: India
For complaints: customercare@amul.coop | 1800-258-3333`,
  },
  {
    id: 'PRESET-IMPORTED-CHOCOLATE',
    productName: 'Swiss Delice Dark Chocolate 100g',
    category: 'Packaged Food & Beverages',
    expectedOutcome: 'non-compliant',
    thumbnail: '🍫',
    description:
      'Import violation: Missing mandatory Country of Origin and Indian importer license address.',
    extracted: {
      commodityName: 'Dark Chocolate Confectionery (72% Cocoa)',
      manufacturer: 'Chocolat Bern AG, Bern, Switzerland',
      netQuantity: '100 g',
      mrp: 'Rs. 320.00 (inclusive of all taxes)',
      monthYear: '05/2026',
      consumerCare: '',
      countryOfOrigin: '',
      expiryDate: 'Best Before 18 Months',
      batchNumber: 'LOT-CH-7712',
    },
    rawOcrText: `SWISS DELICE 72% NOIR
Dark Chocolate Bar
Net Weight: 100 g
MRP: Rs. 320.00 (inclusive of all taxes)
Date of Packing: 05/2026
Lot: LOT-CH-7712
Manufactured by: Chocolat Bern AG, Bern, Switzerland`,
  },
  {
    id: 'PRESET-GOOD-DAY-BISCUITS',
    productName: 'Britannia Good Day Butter Cookies',
    category: 'Packaged Food & Beverages',
    expectedOutcome: 'compliant',
    thumbnail: '🍪',
    description: 'Compliant sample: Full 8 declarations verified with 98% score.',
    extracted: {
      commodityName: 'Butter Cookies / Biscuits',
      manufacturer:
        'Britannia Industries Ltd., 5/1A Hungerford Street, Kolkata - 700017, West Bengal. Plant: Bidadi, Bengaluru.',
      netQuantity: '200 g',
      mrp: 'Rs. 45.00 (inclusive of all taxes)',
      monthYear: '08/2026',
      consumerCare:
        'Toll Free: 1800-425-4449, Email: feedback@britindia.com, Exec: Consumer Care, Kolkata 700017',
      countryOfOrigin: 'India',
      expiryDate: 'Best Before 6 Months from Mfd.',
      batchNumber: 'B.No. GD-0826-C',
    },
    rawOcrText: `BRITANNIA GOOD DAY BUTTER COOKIES
Common Name: Biscuits
Net Weight: 200 g
Max. Retail Price: Rs. 45.00 (incl. of all taxes)
Unit Sale Price: Rs. 0.225 / g
Mfg. Date: 08/2026  |  Best Before: 6 Months
Batch No.: GD-0826-C
Mfg by: Britannia Industries Ltd., 5/1A Hungerford Street, Kolkata - 700017
Made in India / Country of Origin: India
Customer Grievance: Toll Free 1800-425-4449 | feedback@britindia.com`,
  },
  {
    id: 'PRESET-HERBAL-HAIR-OIL',
    productName: 'Ayurvedic Herbal Hair Oil (200ml)',
    category: 'Personal Care & Cosmetics',
    expectedOutcome: 'needs-review',
    thumbnail: '🧴',
    description:
      'Needs Review: Manufacturer address missing 6-digit PIN code and generic contact email.',
    extracted: {
      commodityName: 'Ayurvedic Proprietary Hair Oil',
      manufacturer: 'Vaidya Herbals Pvt Ltd, Industrial Area, Haridwar, Uttarakhand',
      netQuantity: '200 ml',
      mrp: 'Rs. 195.00 (inclusive of all taxes)',
      monthYear: '06/2026',
      consumerCare: 'Ph: 01334-299881 (No email provided)',
      countryOfOrigin: 'India',
      expiryDate: 'Exp: 05/2029 (3 Years)',
      batchNumber: 'B-HB-902',
    },
    rawOcrText: `VAIDYA AYURVEDIC HAIR OIL
Net Vol: 200 ml
MRP: Rs. 195.00 (inclusive of all taxes)
Mfd. Date: 06/2026  |  Exp: 05/2029
Batch No: B-HB-902
Manufactured by: Vaidya Herbals Pvt Ltd, Industrial Area, Haridwar, Uttarakhand
Country of Origin: India
Contact: 01334-299881`,
  },
]

/**
 * Tests live connection to an external OCR / AI backend service
 */
export async function testBackendConnection(apiUrl = 'http://localhost:8080/api') {
  const cleanUrl = apiUrl.replace(/\/$/, '')
  const startTime = Date.now()

  // Build list of ports/URLs to test (configured URL, port 8080, port 8000, and relative /api)
  const candidateBases = [
    cleanUrl,
    'http://localhost:8080/api',
    'http://127.0.0.1:8080/api',
    'http://localhost:8000/api',
    'http://127.0.0.1:8000/api',
    '/api',
  ]
  const uniqueBases = Array.from(new Set(candidateBases.map((u) => u.replace(/\/$/, ''))))

  for (const base of uniqueBases) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)

      const endpointsToTry = [`${base}/health`, `${base}/api/health`, `${base}/ping`, base]

      for (const ep of endpointsToTry) {
        try {
          const response = await fetch(ep, { method: 'GET', signal: controller.signal })
          clearTimeout(timeoutId)
          if (response && response.ok) {
            const latencyMs = Date.now() - startTime
            return {
              online: true,
              latencyMs,
              status: response.status,
              activeUrl: base,
              message: `Backend service is Online and reachable at ${base} (${latencyMs}ms latency)`,
            }
          }
        } catch {
          // try next endpoint
        }
      }
      clearTimeout(timeoutId)
    } catch {
      // try next base
    }
  }

  const latencyMs = Date.now() - startTime
  return {
    online: false,
    latencyMs,
    status: 0,
    message: 'Backend server offline (connection refused or CORS blocked). Start backend via python -m uvicorn backend.main:app.',
  }
}

/**
 * Normalizes varied backend response formats (CamelCase, Snake_case, Nested) into standard format
 */
function normalizeBackendResponse(rawJson) {
  if (!rawJson || typeof rawJson !== 'object') {
    return { extracted: {}, rawText: '', confidences: {} }
  }

  // 1. Direct extracted object
  const ext = rawJson.extracted || rawJson.fields || rawJson.declarations || rawJson.data || rawJson

  // 2. Map snake_case & alternate aliases to standard schema
  const normalized = {
    commodityName:
      ext.commodityName ||
      ext.commodity_name ||
      ext.productName ||
      ext.product_name ||
      ext.commodity ||
      ext.generic_name ||
      '',
    manufacturer:
      ext.manufacturer ||
      ext.manufacturer_name ||
      ext.manufacturer_address ||
      ext.mfg_details ||
      ext.packer ||
      ext.packer_details ||
      '',
    netQuantity:
      ext.netQuantity ||
      ext.net_quantity ||
      ext.net_weight ||
      ext.net_vol ||
      ext.quantity ||
      ext.net_qty ||
      '',
    mrp:
      ext.mrp ||
      ext.retail_price ||
      ext.max_retail_price ||
      ext.price ||
      '',
    monthYear:
      ext.monthYear ||
      ext.month_year ||
      ext.mfg_date ||
      ext.packing_date ||
      ext.pkd_on ||
      ext.date ||
      '',
    consumerCare:
      ext.consumerCare ||
      ext.consumer_care ||
      ext.customer_care ||
      ext.grievance_redressal ||
      ext.helpline ||
      '',
    countryOfOrigin:
      ext.countryOfOrigin ||
      ext.country_of_origin ||
      ext.origin ||
      ext.made_in ||
      '',
    expiryDate:
      ext.expiryDate ||
      ext.expiry_date ||
      ext.best_before ||
      ext.use_by ||
      '',
    batchNumber:
      ext.batchNumber ||
      ext.batch_number ||
      ext.lot_number ||
      ext.lot_no ||
      ext.batch_no ||
      '',
  }

  // 3. Raw OCR Text
  const rawText = rawJson.rawText || rawJson.raw_text || rawJson.text || rawJson.ocr_text || rawJson.transcript || ''

  // 4. Confidences
  const confidences = rawJson.fieldConfidences || rawJson.confidences || rawJson.scores || {}

  // If extracted fields are largely empty but rawText is provided, run NLP extraction
  const populatedCount = Object.values(normalized).filter(Boolean).length
  if (populatedCount <= 1 && rawText.length > 10) {
    const parsed = extractEntitiesFromRawText(rawText)
    Object.assign(normalized, parsed.extracted)
    Object.assign(confidences, parsed.fieldConfidences)
  }

  return {
    extracted: normalized,
    rawText,
    confidences,
    productName: rawJson.productName || rawJson.product_name || normalized.commodityName || 'Scanned Packaged Commodity',
    category: rawJson.category || null,
  }
}

/**
 * Analyzes a product label image via Live Backend API or Intelligent Simulation Engine
 *
 * @param {File|Blob|Object} imageInput - File or image descriptor
 * @param {Object} options - Scanning parameters (apiMode, apiUrl, presetId, category, strictness)
 * @returns {Promise<Object>} Formatted scan result
 */
export async function analyzeLabelImage(imageInput, options = {}) {
  const {
    apiMode = 'demo',
    apiUrl = 'http://localhost:8000/api',
    presetId = null,
    category = 'Packaged Food & Beverages',
    strictness = 'standard',
    customFileName = null,
  } = options

  // Case 1: If user explicitly selected a preset sample or requested demo mode
  if (apiMode === 'demo' || (presetId && apiMode !== 'live')) {
    return runSimulatedAnalysis(imageInput, presetId, category, strictness, customFileName)
  }

  // Case 2: User requested live backend mode
  const cleanUrl = apiUrl.replace(/\/$/, '')
  const formData = new FormData()

  if (imageInput instanceof File || imageInput instanceof Blob) {
    formData.append('image', imageInput, imageInput.name || 'product_label.jpg')
    formData.append('file', imageInput, imageInput.name || 'product_label.jpg')
  }
  formData.append('category', category)
  formData.append('strictness', strictness)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  // Try candidate endpoint paths commonly used in backend frameworks
  const endpointCandidates = [
    `${cleanUrl}/analyze`,
    `${cleanUrl}/api/analyze`,
    'http://localhost:8080/api/analyze',
    'http://127.0.0.1:8080/api/analyze',
    'http://localhost:8000/api/analyze',
    '/api/analyze',
    `${cleanUrl}/ocr`,
    `${cleanUrl}/predict`,
    cleanUrl,
  ]

  let backendResponse = null
  let lastError = null

  for (const endpoint of endpointCandidates) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      if (response.ok) {
        backendResponse = await response.json()
        break
      } else {
        lastError = new Error(`Backend returned HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (fetchErr) {
      if (fetchErr.name === 'AbortError') {
        throw new Error('Backend OCR request timed out after 15 seconds. Ensure the server is responsive.')
      }
      lastError = fetchErr
    }
  }

  clearTimeout(timeoutId)

  if (backendResponse) {
    // Normalize backend response
    const { extracted, rawText, confidences, productName } = normalizeBackendResponse(backendResponse)

    // Evaluate compliance via our Legal Metrology Rule Engine
    const evaluation = evaluateCompliance(extracted, { strictness, fieldConfidences: confidences })

    const scanId =
      backendResponse.id ||
      `LM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    const scannedOn = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    return {
      id: scanId,
      productName: productName || 'Packaged Commodity',
      category: backendResponse.category || category,
      scannedOn,
      source: 'live-backend',
      ...evaluation,
      rawOcrText: rawText || (backendResponse.rawText || ''),
    }
  }

  // If live backend failed, report error or fallback with warning
  console.warn('Live backend failed to respond:', lastError)
  throw new Error(
    `Unable to connect to OCR Backend at ${apiUrl}. (${lastError?.message || 'Server unreachable'}). Please check server status in Settings or switch to Demo Mode.`
  )
}

/**
 * Runs intelligent client-side simulation engine matching image attributes to realistic profiles
 */
async function runSimulatedAnalysis(imageInput, presetId, category, strictness, customFileName) {
  // Realistic processing delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  let selectedPreset = null

  if (presetId) {
    selectedPreset = PRESET_SAMPLES.find((p) => p.id === presetId)
  }

  // If no preset ID, match based on file name
  if (!selectedPreset) {
    const fileName = (customFileName || (imageInput && imageInput.name) || '').toLowerCase()

    if (fileName.includes('salt') || fileName.includes('tata')) {
      selectedPreset = PRESET_SAMPLES[0]
    } else if (fileName.includes('atta') || fileName.includes('wheat') || fileName.includes('flour')) {
      selectedPreset = PRESET_SAMPLES[1]
    } else if (fileName.includes('ghee') || fileName.includes('oil') || fileName.includes('amul')) {
      selectedPreset = PRESET_SAMPLES[2]
    } else if (fileName.includes('chocolate') || fileName.includes('import') || fileName.includes('swiss')) {
      selectedPreset = PRESET_SAMPLES[3]
    } else if (fileName.includes('biscuit') || fileName.includes('cookie') || fileName.includes('britannia')) {
      selectedPreset = PRESET_SAMPLES[4]
    } else if (fileName.includes('cosmetic') || fileName.includes('hair') || fileName.includes('oil')) {
      selectedPreset = PRESET_SAMPLES[5]
    } else {
      const randomIndex = Math.floor(Math.random() * PRESET_SAMPLES.length)
      selectedPreset = PRESET_SAMPLES[randomIndex]
    }
  }

  const scanId = `LM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  const scannedOn = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const evaluation = evaluateCompliance(selectedPreset.extracted, { strictness })

  return {
    id: scanId,
    productName: selectedPreset.productName,
    category: selectedPreset.category || category,
    scannedOn,
    source: 'demo-simulation',
    ...evaluation,
    rawOcrText: selectedPreset.rawOcrText,
  }
}
