'use server'
import { FILES, readFile, writeFile } from '../repo'
import { analyzePhotos } from '.'

export async function loadOrGenPhoto(
  propertyId: string,
  hasPhotoFile: boolean,
  photos: string[],
): ReturnType<typeof analyzePhotos> {
  'use server'
  if (!hasPhotoFile) {
    const photoAnalysis = await analyzePhotos(photos)
    writeFile(propertyId, FILES.photo, photoAnalysis)
    return photoAnalysis
  } else {
    return readFile(propertyId, FILES.photo)
  }
}
