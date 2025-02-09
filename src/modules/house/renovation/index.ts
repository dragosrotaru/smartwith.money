import { RENOVATION_HOURS } from '../domain/constants'
import { analyzePhotos, Renovation } from '../photo'

export function maximizeROI(maxTime: number, maxCost: number, photoData: { [key: string]: Renovation[] }) {
  if (maxCost === 0 || maxTime === 0) {
    return {
      selected: [],
      roi: 0,
      cost: 0,
      time: 0,
    }
  }

  const renovations = Object.values(photoData).flat()

  // Scale down the dimensions to reduce memory usage
  const costScale = 100 // Work in units of $100
  const timeScale = 1 // Keep hours as is, adjust if needed
  const scaledMaxCost = Math.ceil(maxCost / costScale)
  const scaledMaxTime = Math.ceil(maxTime / timeScale)

  // Initialize dp array with scaled dimensions
  const dp = Array.from({ length: scaledMaxCost + 1 }, () =>
    Array.from({ length: scaledMaxTime + 1 }, () => ({ roi: 0, selected: [] as Renovation[] })),
  )

  for (const reno of renovations) {
    const scaledCost = Math.ceil(reno.materialCost / costScale)
    const scaledTime = Math.ceil(reno.diyTime / timeScale)

    for (let cost = scaledMaxCost; cost >= scaledCost; cost--) {
      for (let time = scaledMaxTime; time >= scaledTime; time--) {
        const prev = dp[cost - scaledCost][time - scaledTime]
        const newROI = prev.roi + reno.roi
        const current = dp[cost][time]
        if (newROI > current.roi) {
          current.roi = newROI
          current.selected = [...prev.selected, reno]
        }
      }
    }
  }

  const final = dp[scaledMaxCost][scaledMaxTime]
  return {
    selected: final.selected,
    roi: final.roi / (100 * final.selected.length),
    cost: final.selected.reduce((acc, reno) => acc + reno.materialCost, 0),
    time: final.selected.reduce((acc, reno) => acc + reno.diyTime, 0),
  }
}

export async function generateRennovations(
  photoAnalysis: ReturnType<typeof analyzePhotos>,
  rennovationInvestments: number[],
) {
  const uniqueRennovationInvestments = [...new Set(rennovationInvestments)]
  const rennovations: { [key: number]: ReturnType<typeof maximizeROI> } = {}
  for (const rennovationInvestment of uniqueRennovationInvestments) {
    const renovation = maximizeROI(RENOVATION_HOURS, rennovationInvestment, (await photoAnalysis).renovations)
    rennovations[rennovationInvestment] = renovation
  }
  return rennovations
}
