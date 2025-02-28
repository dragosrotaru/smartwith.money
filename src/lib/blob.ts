import { put } from '@vercel/blob'
import { createReadStream } from 'fs'

export async function uploadExportsFile(filePath: string, key: string): Promise<string> {
  const stream = createReadStream(filePath)
  const blob = await put(key, stream, {
    access: 'public',
    addRandomSuffix: true,
    token: process.env.DATA_EXPORTS_READ_WRITE_TOKEN,
  })

  return blob.url
}
