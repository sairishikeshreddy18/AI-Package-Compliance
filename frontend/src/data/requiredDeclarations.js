import { LEGAL_METROLOGY_RULES } from '../rules/complianceRules.js'

// Backwards compatibility layer for legacy components
const requiredDeclarations = LEGAL_METROLOGY_RULES.map((rule) => ({
  id: rule.id,
  label: rule.label,
  ruleNumber: rule.ruleNumber,
  category: rule.category,
  mandatory: rule.mandatory,
}))

export default requiredDeclarations
