import { LEGAL_METROLOGY_RULES } from '../rules/complianceRules.js'

/**
 * Intelligent Information Extraction / NLP parser that extracts structured Legal Metrology
 * declarations from unstructured raw OCR text streams.
 *
 * @param {string} rawText - Unstructured text from OCR
 * @returns {Object} Extracted key-value declaration map with confidence scores
 */
export function extractEntitiesFromRawText(rawText = '') {
  if (!rawText || typeof rawText !== 'string') {
    return { extracted: {}, fieldConfidences: {} }
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  const fullText = rawText

  const extracted = {
    commodityName: '',
    manufacturer: '',
    netQuantity: '',
    mrp: '',
    monthYear: '',
    consumerCare: '',
    countryOfOrigin: '',
    expiryDate: '',
    batchNumber: '',
  }

  const fieldConfidences = {}

  // 1. MRP Extraction
  const mrpRegex = /(?:M\.?R\.?P\.?|MAX(?:IMUM)?\s*RETAIL\s*PRICE|PRICE|RSP)[\s:.-]*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?)(?:\s*(?:\/|-)?\s*(?:incl\.?|inclusive|all\s*taxes)[^.\n]*)?/i
  const mrpMatch = fullText.match(mrpRegex)
  if (mrpMatch) {
    const rawVal = mrpMatch[0].trim()
    extracted.mrp = rawVal.startsWith('MRP') || rawVal.startsWith('M.R.P') ? rawVal : `Rs. ${mrpMatch[1]}`
    if (/incl|inclusive|all\s*taxes/i.test(mrpMatch[0])) {
      extracted.mrp += ' (inclusive of all taxes)'
    }
    fieldConfidences.mrp = 95
  } else {
    // Fallback: look for solitary Rs / ₹ patterns
    const priceFallback = /(?:Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i.exec(fullText)
    if (priceFallback) {
      extracted.mrp = `Rs. ${priceFallback[1]}`
      fieldConfidences.mrp = 70
    }
  }

  // 2. Net Quantity Extraction
  const netQtyRegex = /(?:NET\s*(?:QTY|QUANTITY|WT|WEIGHT|VOL|VOLUME|CONTENT|CONTENTS))[\s:.-]*([\d.]+\s*(?:g|gm|gms|kg|kgs|ml|l|ltr|litres|liter|m|cm|mm|n|units|pcs|count|packets|tablets|capsules|N|U)\b[^\n,]*)/i
  const netQtyMatch = fullText.match(netQtyRegex)
  if (netQtyMatch) {
    extracted.netQuantity = netQtyMatch[1].trim()
    fieldConfidences.netQuantity = 96
  } else {
    // Fallback: Look for standalone metric weight expressions
    const metricFallback = /\b(\d+(?:\.\d+)?\s*(?:kg|kgs|gm|gms|g|ml|ltr|litres|liter|L)\b)/i.exec(fullText)
    if (metricFallback) {
      extracted.netQuantity = metricFallback[1].trim()
      fieldConfidences.netQuantity = 75
    }
  }

  // 3. Month & Year / Date of Packing Extraction
  const dateRegex = /(?:MFD|PKD|PACKED|MFG|MANUFACTURED|DATE\s*OF\s*(?:MFG|PKD|PACKING|IMPORT))[\s:.-]*([A-Za-z0-9/\s.,'-]+?\b(?:\d{2,4}))/i
  const dateMatch = fullText.match(dateRegex)
  if (dateMatch) {
    extracted.monthYear = dateMatch[1].trim()
    fieldConfidences.monthYear = 90
  } else {
    const rawDateMatch = /\b((?:0[1-9]|1[0-2])[/.-]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s.,'-]+\d{2,4})\b/i.exec(
      fullText
    )
    if (rawDateMatch) {
      extracted.monthYear = rawDateMatch[1].trim()
      fieldConfidences.monthYear = 70
    }
  }

  // 4. Consumer Care Extraction
  const careRegex = /(?:CONSUMER\s*CARE|CUSTOMER\s*CARE|GRIEVANCE|FEEDBACK|HELPLINE|TOLL\s*FREE|COMPLAINTS?)[\s:.-]*([^\n]+(?:(?:\n[^\n]+){1,2})?)/i
  const careMatch = fullText.match(careRegex)
  if (careMatch) {
    extracted.consumerCare = careMatch[0].trim().replace(/\s+/g, ' ')
    fieldConfidences.consumerCare = 92
  } else {
    // Check for phone/email in text
    const emailMatch = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.exec(fullText)
    const phoneMatch = /(?:\+91|0)?\s*(?:1800[\s-]?\d{3,4}[\s-]?\d{3,4}|\d{3,5}[\s-]?\d{6,8})/.exec(fullText)
    if (emailMatch || phoneMatch) {
      const parts = []
      if (phoneMatch) parts.push(`Helpline: ${phoneMatch[0]}`)
      if (emailMatch) parts.push(`Email: ${emailMatch[0]}`)
      extracted.consumerCare = parts.join(', ')
      fieldConfidences.consumerCare = 80
    }
  }

  // 5. Country of Origin
  const originRegex = /(?:COUNTRY\s*OF\s*ORIGIN|MADE\s*IN|PRODUCE\s*OF)[\s:.-]*([A-Za-z\s]+?)(?:[.\n,]|$)/i
  const originMatch = fullText.match(originRegex)
  if (originMatch) {
    extracted.countryOfOrigin = originMatch[1].trim()
    fieldConfidences.countryOfOrigin = 95
  } else if (/India/i.test(fullText)) {
    extracted.countryOfOrigin = 'India'
    fieldConfidences.countryOfOrigin = 85
  }

  // 6. Manufacturer / Packer Details
  const mfgRegex = /(?:MFD\s*BY|MANUFACTURED\s*(?:&|AND)?\s*MARKETED\s*BY|PACKED\s*BY|IMPORTED\s*BY|PRODUCED\s*BY|MARKETED\s*BY)[\s:.-]*([^\n]+(?:(?:\n[^\n]+){1,3})?)/i
  const mfgMatch = fullText.match(mfgRegex)
  if (mfgMatch) {
    extracted.manufacturer = mfgMatch[0].trim().replace(/\s+/g, ' ')
    fieldConfidences.manufacturer = 90
  }

  // 7. Commodity Name
  const commodityRegex = /(?:COMMODITY|GENERIC\s*NAME|PRODUCT\s*NAME|ITEM)[\s:.-]*([^\n]+)/i
  const commodityMatch = fullText.match(commodityRegex)
  if (commodityMatch) {
    extracted.commodityName = commodityMatch[1].trim()
    fieldConfidences.commodityName = 92
  } else if (lines.length > 0) {
    // Top non-header lines usually hold brand & commodity name
    const candidate = lines.find((l) => l.length > 3 && l.length < 60 && !/^(mrp|net|batch|pkd|mfd|date|fssai)/i.test(l))
    if (candidate) {
      extracted.commodityName = candidate
      fieldConfidences.commodityName = 70
    }
  }

  // 8. Batch / Lot Number
  const batchMatch = /(?:BATCH|LOT|B\.NO|LOT\s*NO)[\s:.-]*([A-Za-z0-9/-]+)/i.exec(fullText)
  if (batchMatch) {
    extracted.batchNumber = batchMatch[0].trim()
    fieldConfidences.batchNumber = 90
  }

  // 9. Expiry / Best Before
  const expMatch = /(?:BEST\s*BEFORE|EXPIRY|EXP|USE\s*BY)[\s:.-]*([^\n,]+)/i.exec(fullText)
  if (expMatch) {
    extracted.expiryDate = expMatch[0].trim()
    fieldConfidences.expiryDate = 90
  }

  return { extracted, fieldConfidences }
}

/**
 * Validates and checks extracted label information against Legal Metrology (Packaged Commodities) Rules.
 *
 * @param {Object} extracted - Extracted fields from OCR / AI or input
 * @param {Object} options - Configuration options (strictness, custom rules, fieldConfidences)
 * @returns {Object} Full compliance evaluation result
 */
export function evaluateCompliance(extracted = {}, options = {}) {
  const { strictness = 'standard', fieldConfidences = {} } = options

  const checks = LEGAL_METROLOGY_RULES.map((rule) => {
    const value = (extracted[rule.id] || '').trim()
    const confidenceScore = fieldConfidences[rule.id] ?? (value ? 90 : 0)
    const checkResult = validateField(rule.id, value, strictness, confidenceScore)

    return {
      id: rule.id,
      ruleNumber: rule.ruleNumber,
      title: rule.title,
      label: rule.label,
      category: rule.category,
      mandatory: rule.mandatory,
      found: checkResult.status === 'passed' || checkResult.status === 'warning',
      status: checkResult.status, // 'passed' | 'warning' | 'failed' | 'missing'
      detectedValue: value || null,
      expectedFormat: rule.expectedFormat,
      confidence: checkResult.confidence,
      explanation: checkResult.explanation,
      recommendedAction: checkResult.recommendedAction,
      statutoryRef: rule.statutoryRef,
      isSuspicious: checkResult.isSuspicious || false,
    }
  })

  // Calculate statistics
  const mandatoryChecks = checks.filter((c) => c.mandatory)
  const passedCount = checks.filter((c) => c.status === 'passed').length
  const warningCount = checks.filter((c) => c.status === 'warning').length
  const failedCount = checks.filter((c) => c.status === 'failed' || c.status === 'missing').length
  const mandatoryFailedCount = mandatoryChecks.filter(
    (c) => c.status === 'failed' || c.status === 'missing'
  ).length

  // Calculate score (0 to 100)
  let score = 0
  if (checks.length > 0) {
    const totalPoints = checks.reduce((acc, c) => {
      const weight = c.mandatory ? 1.5 : 0.8
      let itemScore = 0
      if (c.status === 'passed') itemScore = 1
      else if (c.status === 'warning') itemScore = 0.65
      else itemScore = 0
      return acc + itemScore * weight
    }, 0)

    const maxPoints = checks.reduce((acc, c) => acc + (c.mandatory ? 1.5 : 0.8), 0)
    score = Math.round((totalPoints / maxPoints) * 100)
  }

  // Determine overall status
  let overallStatus = 'compliant'
  if (mandatoryFailedCount > 0 || score < 70) {
    overallStatus = 'non-compliant'
  } else if (warningCount > 0 || score < 90) {
    overallStatus = 'needs-review'
  } else {
    overallStatus = 'compliant'
  }

  // Generate remarks
  let remarks = ''
  if (overallStatus === 'compliant') {
    remarks =
      'All mandatory Legal Metrology (Packaged Commodities) declarations are present and compliant with statutory standards under Rule 6(1).'
  } else if (overallStatus === 'needs-review') {
    const warnings = checks.filter((c) => c.status === 'warning').map((c) => c.title)
    remarks = `Inspection indicates potential ambiguities or missing subtext in: ${warnings.join(
      ', '
    )}. Recommended for verification by the field inspecting officer.`
  } else {
    const missingItems = checks
      .filter((c) => c.mandatory && (c.status === 'failed' || c.status === 'missing'))
      .map((c) => c.title)
    remarks = `Statutory violation detected: Missing or non-conforming mandatory declarations for ${missingItems.join(
      ', '
    )}. Notice required under Section 18 / Section 36 of Legal Metrology Act, 2009.`
  }

  return {
    overallStatus,
    score,
    passedCount,
    warningCount,
    failedCount,
    totalChecks: checks.length,
    checks,
    extracted,
    remarks,
    evaluatedAt: new Date().toISOString(),
  }
}

/**
 * Validates an individual field according to Legal Metrology standards
 */
function validateField(fieldId, value, strictness, confidenceScore = 90) {
  if (!value || value.trim() === '') {
    return {
      status: 'missing',
      confidence: 0,
      isSuspicious: false,
      explanation: 'Declaration is completely missing on the package label.',
      recommendedAction: 'Issue notice for missing mandatory declaration under Rule 6(1).',
    }
  }

  const clean = value.trim()

  // Low confidence check from OCR
  if (confidenceScore < 60) {
    return {
      status: 'warning',
      confidence: confidenceScore,
      isSuspicious: true,
      explanation: `Low OCR recognition confidence (${confidenceScore}%). Text may be blurred, smudged or misread.`,
      recommendedAction: 'Verify physical packaging label directly or edit the extracted field manually.',
    }
  }

  switch (fieldId) {
    case 'commodityName': {
      if (clean.length < 2) {
        return {
          status: 'failed',
          confidence: 40,
          isSuspicious: true,
          explanation: 'Commodity name is ambiguous or too short.',
          recommendedAction: 'Verify generic description complies with Rule 6(1)(b).',
        }
      }
      return {
        status: 'passed',
        confidence: Math.max(confidenceScore, 90),
        explanation: `Generic name '${clean}' is clearly stated.`,
        recommendedAction: 'No action needed. Compliant.',
      }
    }

    case 'manufacturer': {
      const hasPin = /\b\d{6}\b/.test(clean)

      if (clean.length < 15) {
        return {
          status: 'warning',
          confidence: 60,
          isSuspicious: true,
          explanation:
            'Manufacturer address appears incomplete or lacks full postal details.',
          recommendedAction:
            'Verify complete physical address including postal PIN code as required under Rule 6(1)(a).',
        }
      }

      if (!hasPin && strictness === 'strict') {
        return {
          status: 'warning',
          confidence: 75,
          explanation:
            'Address is declared but 6-digit postal PIN code was not explicitly detected.',
          recommendedAction:
            'Confirm if full registered office location is verifiable.',
        }
      }

      return {
        status: 'passed',
        confidence: Math.max(confidenceScore, 92),
        explanation: 'Manufacturer/Packer name and address are fully declared.',
        recommendedAction: 'No action needed. Compliant.',
      }
    }

    case 'netQuantity': {
      // Check for standard metric units (g, kg, ml, l, L, m, cm, mm, N, U, units, pcs, count)
      const metricPattern = /\b\d+(\.\d+)?\s*(g|gm|gms|kg|kgs|ml|l|ltr|liter|litres|m|cm|mm|n|units|pcs|count|packets|tablets|capsules)\b/i
      const isValidMetric = metricPattern.test(clean)

      if (!isValidMetric) {
        return {
          status: 'warning',
          confidence: 65,
          isSuspicious: true,
          explanation:
            'Net quantity is declared but unit symbol may deviate from standard metric notation under Second Schedule.',
          recommendedAction:
            'Ensure unit adheres to metric specifications (g, kg, ml, l, N).',
        }
      }

      return {
        status: 'passed',
        confidence: Math.max(confidenceScore, 95),
        explanation: `Net quantity '${clean}' declared in standard metric units.`,
        recommendedAction: 'No action needed. Compliant.',
      }
    }

    case 'mrp': {
      // Check for currency indicator and taxes clause
      const hasCurrency = /(rs|inr|₹|\u20B9)/i.test(clean)
      const hasTaxClause = /(incl|inclusive|incl\.|all\s*taxes)/i.test(clean)

      if (!hasCurrency) {
        return {
          status: 'warning',
          confidence: 70,
          isSuspicious: true,
          explanation:
            'Price numeral detected but missing standard currency prefix (Rs. or ₹).',
          recommendedAction: 'Check that MRP specifies Indian Rupee symbol or Rs.',
        }
      }

      if (!hasTaxClause) {
        return {
          status: 'warning',
          confidence: 75,
          explanation:
            "MRP declared but mandatory subtext '(inclusive of all taxes)' is missing or unclear.",
          recommendedAction:
            'Rule 6(1)(e) mandates the explicit declaration "inclusive of all taxes".',
        }
      }

      return {
        status: 'passed',
        confidence: Math.max(confidenceScore, 98),
        explanation: `MRP '${clean}' declared with mandatory inclusive tax statement.`,
        recommendedAction: 'No action needed. Compliant.',
      }
    }

    case 'monthYear': {
      // Check for MM/YYYY, Month YYYY, MMM-YYYY, or valid date
      const datePattern = /(0[1-9]|1[0-2])[/.-]\d{2,4}|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s.,'-]+\d{2,4}|\b\d{4}\b/i
      const isValidDate = datePattern.test(clean)

      if (!isValidDate) {
        return {
          status: 'warning',
          confidence: 60,
          isSuspicious: true,
          explanation:
            'Date of manufacture/packing format is non-standard or ambiguous.',
          recommendedAction:
            'Verify month and year format conforms to MM/YYYY or Month YYYY.',
        }
      }

      return {
        status: 'passed',
        confidence: Math.max(confidenceScore, 92),
        explanation: `Date of manufacture/packing '${clean}' is valid.`,
        recommendedAction: 'No action needed. Compliant.',
      }
    }

    case 'consumerCare': {
      // Check for phone/helpline, email, or address
      const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(clean)
      const hasPhone = /(\+91|0)?\s*\d{3,5}[-\s]?\d{6,8}|\b1800\b|\bhelpline\b|\bphone\b|\btel\b/i.test(
        clean
      )

      if (!hasEmail && !hasPhone && clean.length < 15) {
        return {
          status: 'warning',
          confidence: 55,
          isSuspicious: true,
          explanation:
            'Consumer redressal information lacks valid email or direct helpline number.',
          recommendedAction:
            'Rule 6(1)(n) requires telephone number and email address for consumer complaints.',
        }
      }

      return {
        status: 'passed',
        confidence: Math.max(confidenceScore, 95),
        explanation: 'Consumer care contact details (phone/email/address) present.',
        recommendedAction: 'No action needed. Compliant.',
      }
    }

    case 'countryOfOrigin': {
      if (clean.length < 3) {
        return {
          status: 'warning',
          confidence: 50,
          isSuspicious: true,
          explanation: 'Country of origin is unclear or abbreviation unrecognized.',
          recommendedAction: 'Ensure Country of Origin is declared unambiguously.',
        }
      }
      return {
        status: 'passed',
        confidence: Math.max(confidenceScore, 96),
        explanation: `Country of origin declared as '${clean}'.`,
        recommendedAction: 'No action needed. Compliant.',
      }
    }

    case 'expiryDate':
    case 'batchNumber': {
      return {
        status: 'passed',
        confidence: Math.max(confidenceScore, 90),
        explanation: `Declaration present: '${clean}'.`,
        recommendedAction: 'No action needed.',
      }
    }

    default:
      return {
        status: 'passed',
        confidence: Math.max(confidenceScore, 85),
        explanation: 'Declaration present.',
        recommendedAction: 'No action needed.',
      }
  }
}
