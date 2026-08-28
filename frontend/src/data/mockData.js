import { evaluateCompliance } from '../services/ruleEngine.js'

export const INITIAL_SETTINGS = {
  officerName: 'A. Sharma',
  officeName: 'District Legal Metrology Office, Zone-IV',
  badgeNumber: 'LM-IN-40892',
  designation: 'Senior Legal Metrology Inspector',
  jurisdiction: 'Central & State Packaged Commodities Wing',
  apiMode: 'demo', // 'demo' | 'live'
  apiUrl: 'http://localhost:8000/api',
  strictness: 'standard', // 'standard' | 'strict' | 'advisory'
  enableCamera: true,
  autoSaveHistory: true,
}

export const sampleScanResult = {
  id: 'LM-2026-1248',
  productName: 'Tata Salt (Vacuum Evaporated Iodized)',
  category: 'Packaged Food & Beverages',
  scannedOn: '27 Aug 2026',
  source: 'demo-simulation',
  ...evaluateCompliance({
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
  }),
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
}

export const sampleHistory = [
  {
    id: 'LM-2026-1248',
    productName: 'Tata Salt (Vacuum Evaporated Iodized)',
    category: 'Packaged Food & Beverages',
    scannedOn: '27 Aug 2026',
    status: 'compliant',
    officer: 'A. Sharma',
    score: 98,
    fullResult: sampleScanResult,
  },
  {
    id: 'LM-2026-1247',
    productName: 'Amul Pure Ghee (1L Pet Jar)',
    category: 'Edible Oils & Fats',
    scannedOn: '27 Aug 2026',
    status: 'needs-review',
    officer: 'A. Sharma',
    score: 84,
    fullResult: {
      id: 'LM-2026-1247',
      productName: 'Amul Pure Ghee (1L Pet Jar)',
      category: 'Edible Oils & Fats',
      scannedOn: '27 Aug 2026',
      source: 'demo-simulation',
      ...evaluateCompliance({
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
      }),
      rawOcrText: `AMUL PURE GHEE\nNet Volume: 1 L (905 g)\nMRP: Rs. 650.00\nPacked: 08/2026\nBatch: GHE-190\nGCMMF Ltd., Anand 388001\ncustomercare@amul.coop | 1800-258-3333`,
    },
  },
  {
    id: 'LM-2026-1246',
    productName: 'Aashirvaad Superior MP Atta',
    category: 'Food Grains & Pulses',
    scannedOn: '26 Aug 2026',
    status: 'non-compliant',
    officer: 'R. Patel',
    score: 68,
    fullResult: {
      id: 'LM-2026-1246',
      productName: 'Aashirvaad Superior MP Atta',
      category: 'Food Grains & Pulses',
      scannedOn: '26 Aug 2026',
      source: 'demo-simulation',
      ...evaluateCompliance({
        commodityName: 'Whole Wheat Flour (Atta)',
        manufacturer: 'ITC Limited, 37 J.L. Nehru Road, Kolkata, WB - 700071',
        netQuantity: '5 kg',
        mrp: 'Rs. 278.00 (inclusive of all taxes)',
        monthYear: '2026',
        consumerCare: '',
        countryOfOrigin: 'India',
        batchNumber: 'LOT-441B',
      }),
      rawOcrText: `AASHIRVAAD SHARBATI ATTA\nNet Wt: 5 kg\nMRP: Rs. 278.00 (inclusive of all taxes)\nMfg Year: 2026\nLot No: LOT-441B\nITC Limited, Kolkata 700071\nCountry of Origin: India`,
    },
  },
  {
    id: 'LM-2026-1245',
    productName: 'Britannia Good Day Butter Cookies',
    category: 'Packaged Food & Beverages',
    scannedOn: '26 Aug 2026',
    status: 'compliant',
    officer: 'A. Sharma',
    score: 98,
    fullResult: {
      id: 'LM-2026-1245',
      productName: 'Britannia Good Day Butter Cookies',
      category: 'Packaged Food & Beverages',
      scannedOn: '26 Aug 2026',
      source: 'demo-simulation',
      ...evaluateCompliance({
        commodityName: 'Butter Cookies / Biscuits',
        manufacturer:
          'Britannia Industries Ltd., 5/1A Hungerford Street, Kolkata - 700017, West Bengal.',
        netQuantity: '200 g',
        mrp: 'Rs. 45.00 (inclusive of all taxes)',
        monthYear: '08/2026',
        consumerCare:
          'Toll Free: 1800-425-4449, Email: feedback@britindia.com, Kolkata 700017',
        countryOfOrigin: 'India',
        expiryDate: 'Best Before 6 Months',
        batchNumber: 'B.No. GD-0826-C',
      }),
    },
  },
  {
    id: 'LM-2026-1244',
    productName: 'Swiss Delice Dark Chocolate 100g',
    category: 'Packaged Food & Beverages',
    scannedOn: '25 Aug 2026',
    status: 'non-compliant',
    officer: 'R. Patel',
    score: 56,
    fullResult: {
      id: 'LM-2026-1244',
      productName: 'Swiss Delice Dark Chocolate 100g',
      category: 'Packaged Food & Beverages',
      scannedOn: '25 Aug 2026',
      source: 'demo-simulation',
      ...evaluateCompliance({
        commodityName: 'Dark Chocolate Confectionery (72% Cocoa)',
        manufacturer: 'Chocolat Bern AG, Bern, Switzerland',
        netQuantity: '100 g',
        mrp: 'Rs. 320.00 (inclusive of all taxes)',
        monthYear: '05/2026',
        consumerCare: '',
        countryOfOrigin: '',
        batchNumber: 'LOT-CH-7712',
      }),
    },
  },
]

export const weeklyScans = [
  { day: 'Mon', value: 148 },
  { day: 'Tue', value: 176 },
  { day: 'Wed', value: 162 },
  { day: 'Thu', value: 198 },
  { day: 'Fri', value: 184 },
  { day: 'Sat', value: 96 },
  { day: 'Sun', value: 72 },
]

export const commonViolations = [
  { label: 'Missing Consumer Care helpline/email [Rule 6(1)(n)]', count: 86 },
  { label: 'Missing MRP "inclusive of all taxes" clause [Rule 6(1)(e)]', count: 64 },
  { label: 'Non-standard Net Quantity metric format [Rule 6(1)(c)]', count: 51 },
  { label: 'Incomplete physical address / Missing PIN [Rule 6(1)(a)]', count: 47 },
  { label: 'Missing Country of Origin on imported goods [Rule 6(10)]', count: 33 },
  { label: 'Ambiguous Month/Year of packing [Rule 6(1)(d)]', count: 28 },
]

export const sampleReports = [
  {
    id: 'RPT-2026-0048',
    caseId: 'LM-2026-1246',
    productName: 'Aashirvaad Superior MP Atta',
    createdOn: '26 Aug 2026',
    status: 'non-compliant',
  },
  {
    id: 'RPT-2026-0047',
    caseId: 'LM-2026-1248',
    productName: 'Tata Salt (Vacuum Evaporated Iodized)',
    createdOn: '27 Aug 2026',
    status: 'compliant',
  },
  {
    id: 'RPT-2026-0046',
    caseId: 'LM-2026-1244',
    productName: 'Swiss Delice Dark Chocolate 100g',
    createdOn: '25 Aug 2026',
    status: 'non-compliant',
  },
]
