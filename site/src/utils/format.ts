export function formatScientific(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  if (value === 0) return '0'

  const absolute = Math.abs(value)
  if (absolute >= 0.001 && absolute < 1000) {
    return value.toLocaleString('es-CL', { maximumSignificantDigits: digits + 1 })
  }

  const [mantissa, exponent] = value.toExponential(digits).split('e')
  return `${mantissa} × 10^${Number(exponent)}`
}

export function formatDecimal(value: number | null | undefined, digits = 3) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return value.toLocaleString('es-CL', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}
