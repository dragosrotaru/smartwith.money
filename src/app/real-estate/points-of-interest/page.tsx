'use client'

import type React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api'
import { useDebouncedCallback } from 'use-debounce'
import { addPOI, removePOI, getPOIs } from '@/modules/real-estate/pointsOfInterest/service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { POI, POIProps } from '@/modules/real-estate/pointsOfInterest/domain'
import { toast } from 'sonner'

export default function PointsOfInterestPage() {
  const [pointsOfInterest, setPointsOfInterest] = useState<POI[]>([])
  const [newPOI, setNewPOI] = useState<POIProps>({
    name: '',
    address: '',
    type: '',
    latitude: '',
    longitude: '',
    placeId: '',
  })
  const [mapCenter, setMapCenter] = useState({ lat: 43.6532, lng: -79.3832 }) // todo use user location

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  })

  useEffect(() => {
    fetchPointsOfInterest()
  }, [])

  const fetchPointsOfInterest = async () => {
    const pois = await getPOIs()
    if (pois instanceof Error) {
      toast.error(pois.message)
      return
    }
    setPointsOfInterest(pois)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPOI({ ...newPOI, [e.target.name]: e.target.value })
  }

  const handleTypeChange = (value: string) => {
    setNewPOI({ ...newPOI, type: value })
  }

  const handleAddPOI = async (e: React.FormEvent) => {
    e.preventDefault()
    await addPOI(newPOI)
    setNewPOI({ name: '', address: '', type: '', latitude: '', longitude: '', placeId: '' })
    fetchPointsOfInterest()
  }

  const handleRemovePOI = async (id: string) => {
    await removePOI(id)
    fetchPointsOfInterest()
  }

  const handlePlaceSelect = useCallback(
    (place: google.maps.places.PlaceResult) => {
      if (place.geometry && place.geometry.location) {
        setNewPOI({
          ...newPOI,
          name: place.name || '',
          address: place.formatted_address || '',
          latitude: place.geometry.location.lat().toString(),
          longitude: place.geometry.location.lng().toString(),
          placeId: place.place_id || '',
        })
        setMapCenter({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() })
      }
    },
    [newPOI],
  )

  const debouncedHandlePlaceSelect = useDebouncedCallback(handlePlaceSelect, 300)

  useEffect(() => {
    if (isLoaded) {
      const autocomplete = new google.maps.places.Autocomplete(document.getElementById('address') as HTMLInputElement, {
        fields: ['name', 'formatted_address', 'geometry', 'place_id'],
      })
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        debouncedHandlePlaceSelect(place)
      })
    }
  }, [isLoaded, debouncedHandlePlaceSelect])

  if (loadError) return <div>Error loading maps</div>
  if (!isLoaded) return <div>Loading maps</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Points of Interest</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Point of Interest</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddPOI} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={newPOI.name} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={newPOI.address} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newPOI.type} onValueChange={handleTypeChange}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="gym">Gym</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    {/* // todo allow user to add any type */}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Add Point of Interest</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '400px', width: '100%' }}>
              <GoogleMap mapContainerStyle={{ height: '100%', width: '100%' }} center={mapCenter} zoom={10}>
                {pointsOfInterest.map((poi) => (
                  <Marker
                    key={poi.id}
                    position={{ lat: Number.parseFloat(poi.latitude), lng: Number.parseFloat(poi.longitude) }}
                    title={poi.name}
                  />
                ))}
              </GoogleMap>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Your Points of Interest</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {pointsOfInterest.map((poi) => (
              <li key={poi.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="font-semibold">{poi.name}</h3>
                  <p className="text-sm text-gray-600">{poi.address}</p>
                  <p className="text-sm text-gray-600">Type: {poi.type}</p>
                </div>
                <Button variant="destructive" onClick={() => handleRemovePOI(poi.id)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
