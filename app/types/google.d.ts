/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: Element, opts?: MapOptions)
        setCenter(latLng: LatLng | LatLngLiteral): void
        setZoom(zoom: number): void
        getBounds(): LatLngBounds
        fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void
        addListener(eventName: string, handler: (...args: any[]) => void): MapsEventListener
      }
  
      class Marker {
        constructor(opts?: MarkerOptions)
        setMap(map: Map | null): void
      }
  
      class LatLng {
        constructor(lat: number, lng: number)
        lat(): number
        lng(): number
      }
  
      class LatLngBounds {
        constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral)
        extend(point: LatLng | LatLngLiteral): LatLngBounds
        union(other: LatLngBounds | LatLngBoundsLiteral): LatLngBounds
      }
  
      interface MapOptions {
        center?: LatLng | LatLngLiteral
        zoom?: number
      }
  
      interface MarkerOptions {
        position: LatLng | LatLngLiteral
        map?: Map
        title?: string
      }
  
      interface LatLngLiteral {
        lat: number
        lng: number
      }
  
      interface LatLngBoundsLiteral {
        east: number
        north: number
        south: number
        west: number
      }
  
      interface MapsEventListener {
        remove(): void
      }
  
      namespace places {
        class SearchBox {
          constructor(inputField: HTMLInputElement, opts?: SearchBoxOptions)
          setBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void
          getPlaces(): PlaceResult[]
          addListener(eventName: string, handler: (...args: any[]) => void): MapsEventListener
        }
  
        interface SearchBoxOptions {
          bounds?: LatLngBounds | LatLngBoundsLiteral
        }
  
        interface PlaceResult {
          geometry?: {
            location?: LatLng
            viewport?: LatLngBounds
          }
          name?: string
        }
      }
    }
  }
  