export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

export function getSpoilageColor(level: 'Low' | 'Medium' | 'High') {
  return { Low: '#4CAF50', Medium: '#FFC107', High: '#DC3545' }[level]
}

export function getSpoilageEmoji(level: 'Low' | 'Medium' | 'High') {
  return { Low: '🟢', Medium: '🟡', High: '🔴' }[level]
}

export function calculateNetProfit(price: number, distanceKm: number, transportRatePerKm: number) {
  const transportCost = (distanceKm * transportRatePerKm) / 100
  return price - transportCost
}

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function calculateSpoilageRisk(humidity: number, tempC: number, daysInStorage: number, hasRefrigeration: boolean): 'Low' | 'Medium' | 'High' {
  let score = 0
  if (humidity > 80) score += 2
  else if (humidity > 65) score += 1
  if (tempC > 35) score += 2
  else if (tempC > 28) score += 1
  if (daysInStorage > 7) score += 2
  else if (daysInStorage > 3) score += 1
  if (hasRefrigeration) score -= 2
  if (score >= 4) return 'High'
  if (score >= 2) return 'Medium'
  return 'Low'
}

export function predictPrice(historicalPrices: number[], daysAhead: number) {
  if (historicalPrices.length < 3) {
    const defaultPrice = historicalPrices.length > 0 ? historicalPrices[historicalPrices.length - 1] : 0
    return { price: defaultPrice, confidence: 0.5, trend: 'stable' }
  }
  const recent = historicalPrices.slice(-7)
  const slope = (recent[recent.length - 1] - recent[0]) / recent.length
  const lastPrice = recent[recent.length - 1]
  const predicted = lastPrice + slope * daysAhead
  const confidence = Math.max(0.5, 0.95 - Math.abs(slope) * 0.05)
  return { price: Math.round(predicted * 100) / 100, confidence, trend: slope > 0.5 ? 'rising' : slope < -0.5 ? 'falling' : 'stable' }
}
