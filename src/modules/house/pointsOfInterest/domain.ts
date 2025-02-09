import { randomUUID } from 'crypto'
import { PointsOfInterest } from './model'

export type POIProps = {
  name: string
  address: string
  type: string
  latitude: string
  longitude: string
  placeId: string
}

export class POI implements PointsOfInterest {
  public id: string
  public accountId: string
  public name: string
  public address: string
  public type: string
  public placeId: string
  public latitude: string
  public longitude: string
  public createdAt: Date
  public updatedAt: Date

  private constructor(props: PointsOfInterest) {
    this.id = props.id
    this.accountId = props.accountId
    this.name = props.name
    this.address = props.address
    this.type = props.type
    this.placeId = props.placeId
    this.latitude = props.latitude
    this.longitude = props.longitude
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static createFromGooglePlace(accountId: string, place: POIProps) {
    const date = new Date()
    return new POI({
      id: randomUUID(),
      accountId,
      ...place,
      createdAt: date,
      updatedAt: date,
    })
  }

  static fromDb(props: PointsOfInterest) {
    return new POI(props)
  }
}
