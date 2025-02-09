import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

type TownshipInfo = {
  township: string
  url: string
  economy: {
    value: number
    change: number
    change5YearAverage: number
    change10YearAverage: number
  }
  jobs: {
    value: number
    unemploymentRate: number
    change: number
    change5YearAverage: number
    change10YearAverage: number
  }
  population: {
    value: number
    change: number
    change5YearAverage: number
    change10YearAverage: number
  }
  census: {
    age: {
      median: number
      change: number
    }
    income: {
      median: number
      change: number
    }
  }
}

const zoningSchema = z.object({
  zoning: z.string(),
  zoningDescription: z.string(),
  linkToOfficialZoningWebsite: z.string(),
  shortTermRentalRules: z.string(),
  needsLicenseForShortTermRental: z.boolean(),
})

type ZoningInfoProps = {
  municipality: string
  address: string
  zoning: string | null
}

export async function getZoningInfo({ address, municipality, zoning }: ZoningInfoProps) {
  return (
    await generateObject({
      model: openai('gpt-4o'),
      schema: zoningSchema,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Please provide the zoning information for the following home
                
                Address: ${address}
                
                Municipality: ${municipality}

                Zoning: ${zoning ? zoning : 'Unknown'}
                
                
                `,
            },
          ],
        },
      ],
    })
  ).object
}

export async function getTownshipInfo(): Promise<TownshipInfo> {
  throw new Error('Not implemented')
}
