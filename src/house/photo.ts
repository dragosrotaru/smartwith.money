import { generateObject, ImagePart } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { FILES, readFile, writeFile } from './repo'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const currency = 'Canadian dollars'
const LOCATION = 'Grimsby, Ontario'
const acreageUnit = 'acres'
const distanceUnit = 'feet'
const year = 2025

function photoPrompt<T extends z.ZodType>(text: string, photos: string[], schema: T) {
  return generateObject<z.infer<T>>({
    model: openai('gpt-4o'),
    schema: schema,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: text,
          },
          ...photos.map(
            (photo): ImagePart => ({
              type: 'image',
              image: new URL(photo),
            }),
          ),
        ],
      },
    ],
  })
}

const imageClassification = [
  'exterior',
  'kitchen',
  'bath',
  'bedroom',
  'living area',
  'garage/workshop',
  'unfinished basement',
  'other',
] as const
type ImageClassification = (typeof imageClassification)[number]

const featureSchema = z
  .object({
    sauna: z.boolean().describe('Whether the image includes a sauna'),
    jacuzzi: z.boolean().describe('Whether the image includes a jacuzzi'),
    pool: z.boolean().describe('Whether the image includes a pool'),
    river: z.boolean().describe('Whether the image includes a river'),
    pond: z.boolean().describe('Whether the image includes a pond'),
    gym: z.boolean().describe('Whether the image includes a gym'),
    terrain: z.boolean().describe('Whether the property appears to be on a hill or with some terrain features'),
  })
  .describe('The features included in the image')

type Features = z.infer<typeof featureSchema>

type Photo = {
  url: string
  classification: ImageClassification
  features: Features
}

async function classifyImages(photos: Omit<Photo, 'classification' | 'features'>[]): Promise<Photo[]> {
  const results: Photo[] = []
  for (const photo of photos) {
    console.log('Classifying', photo.url)
    await delay(500)
    const { classification, features } = (
      await photoPrompt(
        `
            Classify the image into one of the following categories:
            
            - exterior - any image of the outside of the property, including the frontyard, backyard, side, and any other exterior views
            - kitchen - any image of a kitchen
            - bath - any image of a bathroom
            - bedroom - any image of a bedroom
            - living area - any image of a living area such as a family room, den, party room,living room, dining room, game room, sun room or other common space
            - garage/workshop - any image of a garage or workshop, or a space that could be used as a garage or workshop such as a barn / shed, except basements
            - unfinished basement - any image of an unfinished basement. finished basements should be classified as what it is finished as
            - other - any image that does not fit into the other categories, such as an unfinished attic

            `,
        [photo.url],
        z.object({
          classification: z.enum(imageClassification).describe('The classification of the image'),
          features: featureSchema,
        }),
      )
    ).object
    results.push({
      ...photo,
      classification,
      features,
    })
  }
  return results
}

function extractFeatures(photos: Photo[]) {
  const features: Features = {
    sauna: false,
    jacuzzi: false,
    pool: false,
    river: false,
    pond: false,
    gym: false,
    terrain: false,
  }

  for (const photo of photos) {
    features.sauna = features.sauna || photo.features.sauna
    features.jacuzzi = features.jacuzzi || photo.features.jacuzzi
    features.pool = features.pool || photo.features.pool
    features.river = features.river || photo.features.river
    features.pond = features.pond || photo.features.pond
    features.gym = features.gym || photo.features.gym
    features.terrain = features.terrain || photo.features.terrain
  }

  return features
}

async function outsideScore(photos: Photo[], location: string = LOCATION) {
  const result = await photoPrompt(
    `
        You are an expert in real estate. Your task is to analyze the property based on the photos provided for a number of qualitative metrics.

        This property is located in ${location}.

        `,
    photos.map((photo) => photo.url),
    z.object({
      treeCoverage: z.number().describe('The percentage of the property that is covered by trees'),
      proximityToRoad: z.number().describe(`The distance to the nearest road in ${distanceUnit}`),
      proximityToNeighbors: z.number().describe(`The distance to the nearest neighbour or house in ${distanceUnit}`),
      cookieCutterScore: z
        .number()
        .describe(
          `The score of the property, from 0 to 100, where 0 is the least unique home and 100 is the most unique home for ${location} standards`,
        ),
      architecture: z.string().describe('The architecture style of the property'),
      numberofBuildings: z.number().describe('The number of buildings on the property'),
      overallCondition: z
        .string()
        .describe(
          'The overall condition of the property, from 0 to 100, where 0 is the worst condition and 100 is the best condition',
        ),
      tinyHousePotential: z.number().describe('The potential of the property to accommodate a tiny house'),
      hasRearAccess: z
        .boolean()
        .describe(
          'Whether the rear of the property can be accessed by vehicle from the public road over an existing or potential driveway',
        ),
      estimatedAge: z.number().describe('The estimated age of the property in years'),
      estimatedLotSize: z.number().describe(`The estimated lot size of the property in ${acreageUnit}`),
      hobbyFarmPotential: z.number().describe('The potential of the property to accommodate a hobby farm'),
    }),
  )
  return result.object
}

// wood workshop
async function workshopScore(photos: Photo[]) {
  const result = await photoPrompt(
    `
        I am assessing houses based on the potential to run a hobby workshop on the property.
        I want to know how suitable the spaces shown in the photos are for a woodworking shop.

        Please be realistic and take time to consider the workshop idea.
        `,
    photos.map((photo) => photo.url),
    z.object({
      score: z
        .number()
        .describe('The overall workshop score, where 0 is the least suitable and 100 is already a great workshop'),
      reasoning: z.string().describe('The reasoning behind the workshop score'),
      recommendations: z.string().describe('The recommendations for the property to be a great workshop'),
      largestDoor: z
        .object({
          width: z.number().describe(`The width of the largest door in the photos in ${distanceUnit}`),
          height: z.number().describe(`The height of the largest door in the photos in ${distanceUnit}`),
        })
        .describe('The largest door in the photos, for example a garage door, a barn door, a workshop door, etc.'),
      hasHeating: z.boolean().describe('Whether the workshop has heating'),
      hasLighting: z.boolean().describe('Whether the workshop has lighting'),
      isInsulated: z.boolean().describe('Whether the workshop is insulated'),
      isAlreadyAWorkshop: z.boolean().describe('Whether one of the spaces shown in the photos is already a workshop'),
    }),
  )
  return result.object
}

const renovationSchema = z.object({
  materialCost: z.number().describe(`The material cost (no labor, no upcharge) of the renovation in ${currency}`),
  laborCost: z.number().describe(`The labor cost of the renovation if done by a professional in ${currency}`),
  totalCost: z.number().describe(`The total cost of the renovation if done by a professional in ${currency}`),
  diyTime: z.number().describe(`The time it would take to do the renovation if done by the homeowner in hours`),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty of the renovation'),
  roi: z.number().describe('The return on investment of the renovation in percentage'),
  priorityScore: z
    .number()
    .describe(
      'The priority score of the renovation, from 0 to 100, where 0 is the least important for property value and 100 is the most important for property value',
    ),
  title: z.string().describe('The title of the renovation'),
  description: z.string().describe('The description of the renovation'),
})

export type Renovation = z.infer<typeof renovationSchema>

async function detectRenovations(photos: Photo[]) {
  const photosByClassification = photos.reduce(
    (acc, photo) => {
      acc[photo.classification] = [...(acc[photo.classification] || []), photo]
      return acc
    },
    {} as Record<ImageClassification, Photo[]>,
  )

  const results: { classification: ImageClassification; renovations: Renovation[] }[] = []

  for (const [classification, photos] of Object.entries(photosByClassification)) {
    console.log('Detecting renovations', classification)
    await delay(500)
    const result = await photoPrompt(
      `
            You are an expert in real estate, construction and renovation.
            I want you to recommend a variety of rennovation ideas for this
            property. you are focusing on the ${classification} category of spaces.
    
            This property is located in ${LOCATION}. And it is the year ${year}.

            Please be realistic and take time to consider the rennovation idea.
            Dont recommend a rennovation that is not possible or not worth the cost.
            For example, if a kitchen looks like in decent condition, dont recommend a full kitchen renovation.
            We want to think about the potential to flip the property.
    
            `,
      photos.map((photo) => photo.url),
      z.object({
        renovations: z.array(renovationSchema).describe('The renovations included in the photos'),
      }),
    )
    results.push({
      classification: classification as ImageClassification,
      renovations: result.object.renovations,
    })
  }
  const accumulated = results.reduce(
    (acc, result) => {
      acc[result.classification] = result.renovations
      return acc
    },
    {} as Record<ImageClassification, Renovation[]>,
  )
  return accumulated
}

export async function analyzePhotos(photoUrls: string[]) {
  const photos = photoUrls.map((url) => ({ url }))
  const classifiedPhotos = await classifyImages(photos)
  const features = extractFeatures(classifiedPhotos)

  console.log(classifiedPhotos)
  console.log(features)

  const outsidePhotos = classifiedPhotos.filter((photo) => photo.classification === 'exterior')
  const outside = outsidePhotos.length > 0 ? await outsideScore(outsidePhotos) : null

  console.log(outside)

  const workshopPhotos = classifiedPhotos.filter((photo) => photo.classification === 'garage/workshop')
  const workshop = workshopPhotos.length > 0 ? await workshopScore(workshopPhotos) : null

  console.log(workshop)

  const renovations = await detectRenovations(classifiedPhotos)

  console.log(renovations)

  return {
    outside,
    workshop,
    features,
    renovations,
  }
}

export async function loadOrGenPhoto(
  propertyId: string,
  hasPhotoFile: boolean,
  photos: string[],
): ReturnType<typeof analyzePhotos> {
  if (!hasPhotoFile) {
    const photoAnalysis = await analyzePhotos(photos)
    writeFile(propertyId, FILES.photo, photoAnalysis)
    return photoAnalysis
  } else {
    return readFile(propertyId, FILES.photo)
  }
}
