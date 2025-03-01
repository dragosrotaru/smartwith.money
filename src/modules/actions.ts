'use server'

export interface BankRate {
  date: number
  primeRate: number | null
  bankRate: number | null
  overnightTarget: number | null
}

interface BankRateResponse {
  observations: Array<{
    d: string
    V39079?: { v: string } // Target for the overnight rate
    V39078?: { v: string } // Bank rate
    V121796?: { v: string } // Prime rate (all chartered banks)
  }>
}

export async function getBankRates(): Promise<BankRate[]> {
  try {
    // Get data for the last 5 years
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Get multiple series: overnight rate, bank rate, and prime rate
    const response = await fetch(
      `https://www.bankofcanada.ca/valet/observations/V39079,V39078,V121796/json?start_date=${startDate}&end_date=${endDate}&order_dir=asc`,
      { next: { revalidate: 24 * 60 * 60 } }, // Cache for 24 hours
    )

    if (!response.ok) {
      throw new Error('Failed to fetch Bank of Canada rates')
    }

    const data: BankRateResponse = await response.json()

    // Create a map of dates to their rates
    const ratesByDate = new Map<string, BankRate>()

    // Process all observations
    data.observations.forEach((obs) => {
      const date = obs.d
      const existingRate = ratesByDate.get(date) || {
        date: new Date(date).getTime(),
        primeRate: null,
        bankRate: null,
        overnightTarget: null,
      }

      // Update rates if they exist in this observation
      if (obs.V121796?.v) {
        existingRate.primeRate = parseFloat(obs.V121796.v)
      }
      if (obs.V39078?.v) {
        existingRate.bankRate = parseFloat(obs.V39078.v)
      }
      if (obs.V39079?.v) {
        existingRate.overnightTarget = parseFloat(obs.V39079.v)
      }

      ratesByDate.set(date, existingRate)
    })

    // Convert map to array and sort by date
    const rates = Array.from(ratesByDate.values()).sort((a, b) => a.date - b.date)

    // Forward fill missing values
    let lastPrimeRate: number | null = null
    let lastBankRate: number | null = null
    let lastOvernightTarget: number | null = null

    const processedRates = rates
      .map((rate) => {
        const newRate = {
          date: rate.date,
          primeRate: (lastPrimeRate = rate.primeRate ?? lastPrimeRate),
          bankRate: (lastBankRate = rate.bankRate ?? lastBankRate),
          overnightTarget: (lastOvernightTarget = rate.overnightTarget ?? lastOvernightTarget),
        }
        return newRate
      })
      .filter((rate) => rate.primeRate !== null || rate.bankRate !== null || rate.overnightTarget !== null)

    return processedRates
  } catch (error) {
    console.error('Error fetching bank rates:', error)
    throw new Error('Failed to fetch Bank of Canada rates')
  }
}
