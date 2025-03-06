import { put } from '@vercel/blob'
import { createReadStream } from 'fs'

export async function uploadExportsFile(filePath: string, key: string): Promise<string> {
  const stream = createReadStream(filePath)
  const blob = await put(key, stream, {
    access: 'public',
    addRandomSuffix: true,
    token: process.env.DATA_EXPORT_READ_WRITE_TOKEN,
  })

  return blob.url
}

export async function uploadProfilePicture(file: File, key: string): Promise<string> {
  const blob = await put(key, file, {
    access: 'public',
    addRandomSuffix: true,
    // todo use different blobs
    token: process.env.DATA_EXPORT_READ_WRITE_TOKEN,
  })

  return blob.url
}
