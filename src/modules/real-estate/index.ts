import { config } from 'dotenv'
import { loadOrGenHouseSigma } from './housesigma/repo'
import { loadOrGenPhoto } from './photo/repo'

import { constructRentVsBuy, initializeStats } from './domain/scenarios/rentVsBuy'
import { generateRennovations } from './renovation'
import { buyVsBuy } from './domain/scenarios/buyVsBuy'
import { FILES, readFile, writeFile, hasFiles } from './repo'
import {
  ANNUAL_PROPERTY_TAX_INCREASE_RATE,
  ANNUAL_UPKEEP_PERCENTAGE,
  COMBINATIONS,
  generateCombinations,
  MONTHLY_RENT_PLUS_UTILITIES,
  MONTHS,
  VACANCY_RATE,
} from './domain/constants'

config()

export async function compareRentVsBuy(propertyId: string) {
  const { hasBasicFile, hasPhotoFile } = hasFiles(propertyId)
  const hsFile = readFile(propertyId, FILES.housesigma)

  const houseSigma = loadOrGenHouseSigma(propertyId, hasBasicFile, hsFile)
  const photoAnalysis = loadOrGenPhoto(propertyId, hasPhotoFile, houseSigma.photos)

  // Generate Combinations
  console.log('Generating combinations')
  const combinations = generateCombinations(COMBINATIONS)

  // Initialize Stats
  const { avg, min, max, maxParams, minParams } = initializeStats()

  // Generate Rennovations
  const rennovationInvestments = combinations.map((combination) => combination.rennovationInvestment)
  const rennovations = await generateRennovations(photoAnalysis, rennovationInvestments)

  // Run Scenarios and tally stats
  for (let index = 0; index < combinations.length; index++) {
    const combination = combinations[index]
    console.log(`Processing combination ${index + 1} of ${combinations.length}`)
    const rennovation = rennovations[combination.rennovationInvestment]
    const scenario = constructRentVsBuy(
      {
        ...combination,
        rennovations: {
          cost: rennovation.cost,
          roi: rennovation.roi,
        },
      },
      houseSigma,
    )
    // sum up all the results for this month
    for (let month = 0; month < MONTHS; month++) {
      const instance = scenario.results[month]
      if (!instance) continue
      avg[month].cashFlow += instance.cashFlow
      avg[month].equity += instance.equity
      avg[month].rentOpCost += instance.rentOpCost
      avg[month].baselineOpCost += instance.baselineOpCost
      avg[month].rentDifference += instance.rentDifference
      avg[month].baselineDifference += instance.baselineDifference
      if (instance.cashFlow < min[month].cashFlow) {
        min[month].cashFlow = instance.cashFlow
        minParams[month].cashFlow = scenario.params
      }
      if (instance.equity < min[month].equity) {
        min[month].equity = instance.equity
        minParams[month].equity = scenario.params
      }
      if (instance.rentOpCost < min[month].rentOpCost) {
        min[month].rentOpCost = instance.rentOpCost
        minParams[month].rentOpCost = scenario.params
      }
      if (instance.baselineOpCost < min[month].baselineOpCost) {
        min[month].baselineOpCost = instance.baselineOpCost
        minParams[month].baselineOpCost = scenario.params
      }
      if (instance.rentDifference < min[month].rentDifference) {
        min[month].rentDifference = instance.rentDifference
        minParams[month].rentDifference = scenario.params
      }
      if (instance.baselineDifference < min[month].baselineDifference) {
        min[month].baselineDifference = instance.baselineDifference
        minParams[month].baselineDifference = scenario.params
      }
      if (instance.cashFlow > max[month].cashFlow) {
        max[month].cashFlow = instance.cashFlow
        maxParams[month].cashFlow = scenario.params
      }
      if (instance.equity > max[month].equity) {
        max[month].equity = instance.equity
        maxParams[month].equity = scenario.params
      }
      if (instance.rentOpCost > max[month].rentOpCost) {
        max[month].rentOpCost = instance.rentOpCost
        maxParams[month].rentOpCost = scenario.params
      }
      if (instance.baselineOpCost > max[month].baselineOpCost) {
        max[month].baselineOpCost = instance.baselineOpCost
        maxParams[month].baselineOpCost = scenario.params
      }
      if (instance.rentDifference > max[month].rentDifference) {
        max[month].rentDifference = instance.rentDifference
        maxParams[month].rentDifference = scenario.params
      }
      if (instance.baselineDifference > max[month].baselineDifference) {
        max[month].baselineDifference = instance.baselineDifference
        maxParams[month].baselineDifference = scenario.params
      }
    }
  }

  for (let month = 0; month < MONTHS; month++) {
    avg[month].cashFlow /= combinations.length
    avg[month].equity /= combinations.length
    avg[month].rentOpCost /= combinations.length
    avg[month].baselineOpCost /= combinations.length
    avg[month].rentDifference /= combinations.length
    avg[month].baselineDifference /= combinations.length
  }

  console.log('Min', min[60])
  console.log('Max', max[60])
  console.log('Avg', avg[60])
  console.log('Max Params', maxParams[60].rentDifference)
  console.log('Min Params', minParams[60].rentDifference)
  // writeFile(propertyId, FILES.scenario, scenarios)
  writeFile(propertyId, FILES.stats, { avg, min, max, maxParams, minParams })
}

async function compareAandB(idA: string, idB: string) {
  const filesA = hasFiles(idA)
  const filesB = hasFiles(idB)
  const hsFileA = readFile(idA, FILES.housesigma)
  const hsFileB = readFile(idB, FILES.housesigma)

  const houseSigmaA = loadOrGenHouseSigma(idA, filesA.hasBasicFile, hsFileA)
  const photoAnalysisA = loadOrGenPhoto(idA, filesA.hasPhotoFile, houseSigmaA.photos)

  const houseSigmaB = loadOrGenHouseSigma(idB, filesB.hasBasicFile, hsFileB)
  const photoAnalysisB = loadOrGenPhoto(idB, filesB.hasPhotoFile, houseSigmaB.photos)

  // Generate Combinations
  console.log('Generating combinations')
  const combinations = generateCombinations(COMBINATIONS)

  // Generate Rennovations
  const rennovationInvestments = combinations.map((combination) => combination.rennovationInvestment)
  const rennovationsA = await generateRennovations(photoAnalysisA, rennovationInvestments)
  const rennovationsB = await generateRennovations(photoAnalysisB, rennovationInvestments)

  const combo = combinations[0]

  const ECONOMIC = {
    annualIndexFundReturn: combo.annualIndexFundReturn,
    inflationRate: combo.inflationRate,
    monthlyRentPlusUtilities: MONTHLY_RENT_PLUS_UTILITIES,
  }

  return buyVsBuy(
    {
      mortgage: {
        interestRate: combo.interestRate,
        amortizationYears: combo.amortizationYear,
        paymentFrequency: combo.paymentFrequency,
      },
      house: {
        purchasePrice: houseSigmaA.basicInfo.askingPrice * combo.purchasePriceMultiplier,
        annualPropertyTax: houseSigmaA.basicInfo.propertyTax,
        squareFootage: houseSigmaA.basicInfo.squareFootage,
        annualAppreciationRate: houseSigmaA.basicInfo.communityValue.growth10YearAverage / 10,
        annualPropertyTaxIncreaseRate: ANNUAL_PROPERTY_TAX_INCREASE_RATE,
        annualUpkeepPercentage: ANNUAL_UPKEEP_PERCENTAGE,
      },
      rental: {
        monthlyIncome: houseSigmaA.basicInfo.estimateRent * combo.ratioRented,
        rentedSquareFootage: houseSigmaA.basicInfo.squareFootage * combo.ratioRented,
        vacancyRate: VACANCY_RATE,
      },
      economic: ECONOMIC,
      rennovation: {
        cost: rennovationsA[combo.rennovationInvestment].cost,
        roi: rennovationsA[combo.rennovationInvestment].roi,
      },
    },
    {
      mortgage: {
        interestRate: combo.interestRate,
        amortizationYears: combo.amortizationYear,
        paymentFrequency: combo.paymentFrequency,
      },
      house: {
        purchasePrice: houseSigmaB.basicInfo.askingPrice * combo.purchasePriceMultiplier,
        annualPropertyTax: houseSigmaB.basicInfo.propertyTax,
        squareFootage: houseSigmaB.basicInfo.squareFootage,
        annualAppreciationRate: houseSigmaB.basicInfo.communityValue.growth10YearAverage / 10,
        annualPropertyTaxIncreaseRate: ANNUAL_PROPERTY_TAX_INCREASE_RATE,
        annualUpkeepPercentage: ANNUAL_UPKEEP_PERCENTAGE,
      },
      rental: {
        monthlyIncome: houseSigmaB.basicInfo.estimateRent * combo.ratioRented,
        rentedSquareFootage: houseSigmaB.basicInfo.squareFootage * combo.ratioRented,
        vacancyRate: VACANCY_RATE,
      },
      economic: ECONOMIC,
      rennovation: {
        cost: rennovationsB[combo.rennovationInvestment].cost,
        roi: rennovationsB[combo.rennovationInvestment].roi,
      },
    },
    MONTHS,
    true,
  )
}

// bEDRYaGP1oQ71VaB = cheapest
// MWBVyZEq1ZpYKemj = average
// nM697kVgazQybmwe = nicest

compareAandB('MWBVyZEq1ZpYKemj', 'nM697kVgazQybmwe')
