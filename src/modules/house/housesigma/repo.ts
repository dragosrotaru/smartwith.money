import { FILES, getAllIds, readFile, writeFile } from '../repo'
import { fromHouseSigma } from '.'
import { HouseSigma } from './schema'

export function loadOrGenHouseSigma(propertyId: string, hasBasicFile: boolean, hsFile: any): HouseSigma {
  if (!hasBasicFile) {
    const houseSigma = fromHouseSigma(hsFile)
    writeFile(propertyId, FILES.basic, houseSigma)
    return houseSigma
  } else {
    return readFile(propertyId, FILES.basic)
  }
}

export class HouseSigmaRepo {
  async getAll(): Promise<HouseSigma[]> {
    const files = await getAllIds()
    console.log(files)
    return files.map((file) => readFile(file, FILES.housesigma)).map(fromHouseSigma)
  }

  async getById(id: string): Promise<HouseSigma> {
    return fromHouseSigma(readFile(id, FILES.housesigma))
  }
}
