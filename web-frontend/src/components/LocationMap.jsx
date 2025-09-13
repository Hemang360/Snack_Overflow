import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { Icon } from 'leaflet'
import { useState, useEffect } from 'react'

// Fix for default markers in React Leaflet
const createIcon = (color) => new Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const icons = {
  collection: createIcon('green'),
  processing: createIcon('blue'),
  manufacturer: createIcon('red'),
  default: createIcon('grey')
}

export function LocationMap({ collectionEvents, batch }) {
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]) // Default to India
  const [mapZoom, setMapZoom] = useState(5)
  const [locations, setLocations] = useState([])
  
  useEffect(() => {
    const processedLocations = processLocations(collectionEvents, batch)
    setLocations(processedLocations)
    
    if (processedLocations.length > 0) {
      // Calculate map center based on locations
      const latSum = processedLocations.reduce((sum, loc) => sum + loc.lat, 0)
      const lngSum = processedLocations.reduce((sum, loc) => sum + loc.lng, 0)
      setMapCenter([latSum / processedLocations.length, lngSum / processedLocations.length])
      setMapZoom(processedLocations.length === 1 ? 12 : 8)
    }
  }, [collectionEvents, batch])
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Origin & Journey Map
        </h2>
        <p className="text-gray-600 mb-4">
          Explore the geographical journey of this product from collection sites to processing facilities.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Collection Sites</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Processing</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Manufacturing</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Other Locations</span>
          </div>
        </div>
      </div>
      
      {/* Map */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-96 w-full">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Collection locations */}
            {locations.map((location, index) => (
              <Marker
                key={index}
                position={[location.lat, location.lng]}
                icon={icons[location.type] || icons.default}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {location.title}
                    </h3>
                    <div className="space-y-1 text-sm">
                      {location.details.map((detail, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-gray-600">{detail.label}:</span>
                          <span className="font-medium">{detail.value}</span>
                        </div>
                      ))}
                    </div>
                    {location.date && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          {new Date(location.date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Journey path */}
            {locations.length > 1 && (
              <Polyline
                positions={locations.map(loc => [loc.lat, loc.lng])}
                color="#10b981"
                weight={3}
                opacity={0.7}
                dashArray="5, 10"
              />
            )}
          </MapContainer>
        </div>
      </div>
      
      {/* Location Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${getLocationColor(location.type)}`}></div>
              <h3 className="text-lg font-semibold text-gray-900">
                {location.title}
              </h3>
            </div>
            
            <div className="space-y-3">
              {location.details.map((detail, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">{detail.label}</span>
                  <span className="font-medium text-gray-900">{detail.value}</span>
                </div>
              ))}
            </div>
            
            {location.date && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  Date: {new Date(location.date).toLocaleDateString()}
                </span>
              </div>
            )}
            
            {location.coordinates && (
              <div className="mt-2">
                <span className="text-xs text-gray-400">
                  {location.coordinates.lat.toFixed(6)}, {location.coordinates.lng.toFixed(6)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {locations.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Location Data Available
          </h3>
          <p className="text-gray-600">
            Location information for this product's journey is not available.
          </p>
        </div>
      )}
    </div>
  )
}

function processLocations(collectionEvents, batch) {
  const locations = []
  
  // Add collection event locations
  if (collectionEvents) {
    collectionEvents.forEach((event, index) => {
      if (event.gpsCoordinates && event.gpsCoordinates.lat && event.gpsCoordinates.lng) {
        locations.push({
          type: 'collection',
          title: `Collection Site ${index + 1}`,
          lat: event.gpsCoordinates.lat,
          lng: event.gpsCoordinates.lng,
          date: event.collectionDate || event.timestamp,
          coordinates: event.gpsCoordinates,
          details: [
            { label: 'Species', value: event.species || 'Unknown' },
            { label: 'Collector', value: event.collectorId || 'Unknown' },
            { label: 'Quantity', value: `${event.quantity || 0} ${event.unit || 'units'}` },
            { label: 'Method', value: event.collectionMethod || 'Not specified' },
            { label: 'Elevation', value: event.elevation ? `${event.elevation}m` : 'Not recorded' }
          ]
        })
      }
    })
  }
  
  // Add manufacturer location (if available)
  // This would typically come from manufacturer data
  if (batch.manufacturerId) {
    // For demo purposes, add a sample manufacturer location
    locations.push({
      type: 'manufacturer',
      title: 'Manufacturing Facility',
      lat: 19.0760, // Mumbai coordinates as example
      lng: 72.8777,
      date: batch.creationDate || batch.timestamp,
      coordinates: { lat: 19.0760, lng: 72.8777 },
      details: [
        { label: 'Manufacturer', value: batch.manufacturerId },
        { label: 'Batch ID', value: batch.id },
        { label: 'Product', value: batch.productName },
        { label: 'Status', value: batch.status }
      ]
    })
  }
  
  return locations
}

function getLocationColor(type) {
  switch (type) {
    case 'collection':
      return 'bg-green-500'
    case 'processing':
      return 'bg-blue-500'
    case 'manufacturer':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}