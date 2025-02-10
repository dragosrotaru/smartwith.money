import fs from 'fs'

export const FILES = {
  housesigma: 'housesigma',
  basic: 'basic',
  photo: 'photo',
  scenario: 'scenario',
  output: 'output',
  stats: 'stats',
}

export function readFile(propertyId: string, file: string) {
  const fileContent = fs.readFileSync(`./data/${propertyId}_${file}.json`, 'utf8')
  return JSON.parse(fileContent)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function writeFile(propertyId: string, file: string, data: any) {
  fs.writeFileSync(`./data/${propertyId}_${file}.json`, JSON.stringify(data, null, 2))
}

export function hasFiles(propertyId: string) {
  const filesDir = fs.readdirSync('./data')
  const files = filesDir.filter((file) => file.includes(propertyId))

  if (files.length === 0) {
    throw new Error(`File not found for propertyId: ${propertyId}`)
  }

  const hasHSFile = Boolean(files.find((file) => file.includes(FILES.housesigma)))
  const hasBasicFile = Boolean(files.find((file) => file.includes(FILES.basic)))
  const hasPhotoFile = Boolean(files.find((file) => file.includes(FILES.photo)))

  console.log('Files Loaded:')
  console.log('hsFile', hasHSFile)
  console.log('basicFile', hasBasicFile)
  console.log('photoFile', hasPhotoFile)

  if (!hasHSFile) throw new Error(`File not found for propertyId: ${propertyId}`)

  return {
    hasHSFile,
    hasBasicFile,
    hasPhotoFile,
  }
}

export async function getAllIds() {
  const filesDir = fs.readdirSync('./data')
  const files = filesDir.filter((file) => file.includes(FILES.housesigma))
  return files.map((file) => file.split('_')[0])
}
