import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from 'react-leaflet'
import { Icon } from 'leaflet'
import { collectionAPI, analyticsAPI } from '../services/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { 
  MapPinIcon,
  FunnelIcon,
  EyeIcon,
  CalendarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

// Custom map icons
const createIcon = (color, symbol = '') => new Icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="8" fill="white"/>
      <text x="12.5" y="17" text-anchor="middle" font-family="Arial" font-size="12" fill="${color}">${symbol}</text>
    </svg>
  `)}`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
})

const icons = {
  collection: createIcon('#10b981', 'C'),
  processing: createIcon('#3b82f6', 'P'),
  manufacturer: createIcon('#ef4444', 'M'),
  quality: createIcon('#f59e0b', 'Q'),
  compliance: createIcon('#8b5cf6', '!'),
  default: createIcon('#6b7280', '?')
}

export function GeoAnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]) // India center
  const [mapZoom, setMapZoom] = useState(5)
  const [locations, setLocations] = useState([])
  const [filters, setFilters] = useState({
    dateRange: '30d',
    locationTypes: ['collection', 'processing', 'manufacturer'],
    species: 'all',
    complianceStatus: 'all'
  })
  const [viewMode, setViewMode] = useState('all') // all, heatmap, compliance, quality
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [geoStats, setGeoStats] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchGeoData()
  }, [filters])

  const fetchGeoData = async () => {
    try {
      setError(null)
      setIsLoading(true)
      
      // Calculate date range for API calls
      const endDate = new Date()
      let startDate = new Date()
      
      switch (filters.dateRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(startDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(startDate.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1)
          break
        default:
          startDate.setDate(startDate.getDate() - 30)
      }
      
      // Fetch real data from APIs
      const [collectionsRes, dashboardStats] = await Promise.all([
        collectionAPI.getAll({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          species: filters.species !== 'all' ? filters.species : undefined
        }),
        analyticsAPI.getDashboardStats()
      ])
      
      // Process the data for the map and stats
      const processedData = processGeoData(collectionsRes.data.collectionEvents, dashboardStats.data)
      setLocations(processedData.locations)
      setGeoStats(processedData.stats)
      
    } catch (error) {
      console.error('Error fetching geo data:', error)
      setError(error.message || 'Failed to load geo analytics data')
      toast.error('Failed to load geo analytics data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const processGeoData = (collections, dashboardStats) => {
    // Convert collection events to map locations
    const locations = collections.map(event => ({
      id: event.id,
      type: 'collection',
      name: event.commonName || event.species,
      species: event.species,
      coordinates: [event.gpsCoordinates.lat, event.gpsCoordinates.lng],
      timestamp: event.timestamp,
      collector: event.collectorId,
      quantity: event.quantity,
      complianceScore: Math.floor(Math.random() * 20) + 80, // Mock compliance score
      qualityScore: Math.floor(Math.random() * 20) + 80, // Mock quality score
      status: 'active'
    }))
    
    // Calculate stats
    const stats = {
      totalLocations: locations.length,
      compliantSites: locations.filter(loc => loc.complianceScore >= 90).length,
      issuesDetected: locations.filter(loc => loc.complianceScore < 80).length,
      avgQualityScore: Math.round(locations.reduce((sum, loc) => sum + loc.qualityScore, 0) / (locations.length || 1))
    }
    
    return { locations, stats }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const filteredLocations = locations.filter(location => {
    if (viewMode !== 'all' && location.type !== viewMode) return false
    if (filters.species !== 'all' && location.species !== filters.species) return false
    if (filters.complianceStatus !== 'all') {
      if (filters.complianceStatus === 'compliant' && location.complianceScore < 90) return false
      if (filters.complianceStatus === 'non-compliant' && location.complianceScore >= 90) return false
    }
    return filters.locationTypes.includes(location.type)
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <ExclamationCircleIcon className="mx-auto h-16 w-16 text-red-500" />
          <h3 className="mt-4 text-xl font-semibold text-gray-900">Error Loading Geo Analytics</h3>
          <p className="mt-2 text-gray-600">{error}</p>
          <div className="mt-6">
            <button
              onClick={fetchGeoData}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Geo Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Interactive geographical analysis of supply chain operations
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="input-field w-40"
          >
            <option value="all">All Locations</option>
            <option value="collection">Collection Sites</option>
            <option value="processing">Processing</option>
            <option value="manufacturer">Manufacturing</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <MapPinIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Locations</p>
              <p className="text-2xl font-bold text-gray-900">{geoStats.totalLocations}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Compliant Sites</p>
              <p className="text-2xl font-bold text-gray-900">{geoStats.compliantSites}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Issues Detected</p>
              <p className="text-2xl font-bold text-gray-900">{geoStats.issuesDetected}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Quality Score</p>
              <p className="text-2xl font-bold text-gray-900">{geoStats.avgQualityScore}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="input-field w-full"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 3 months</option>
                <option value="1y">Last year</option>
              </select>
            </div>

            {/* Location Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Types
              </label>
              <div className="space-y-2">
                {['collection', 'processing', 'manufacturer'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.locationTypes.includes(type)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...filters.locationTypes, type]
                          : filters.locationTypes.filter(t => t !== type)
                        handleFilterChange('locationTypes', newTypes)
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {type.replace('-', ' ')} sites
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Species Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Species
              </label>
              <select
                value={filters.species}
                onChange={(e) => handleFilterChange('species', e.target.value)}
                className="input-field w-full"
              >
                <option value="all">All Species</option>
                <option value="turmeric">Turmeric</option>
                <option value="ashwagandha">Ashwagandha</option>
                <option value="neem">Neem</option>
                <option value="tulsi">Tulsi</option>
                <option value="brahmi">Brahmi</option>
              </select>
            </div>

            {/* Compliance Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compliance Status
              </label>
              <select
                value={filters.complianceStatus}
                onChange={(e) => handleFilterChange('complianceStatus', e.target.value)}
                className="input-field w-full"
              >
                <option value="all">All Statuses</option>
                <option value="compliant">Compliant</option>
                <option value="warning">Warning</option>
                <option value="non-compliant">Non-Compliant</option>
              </select>
            </div>

            <button
              onClick={fetchGeoData}
              className="w-full btn-primary flex items-center justify-center"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-4 h-[600px]">
            <MapContainer 
              center={mapCenter} 
              zoom={mapZoom} 
              style={{ height: '100%', width: '100%' }}
              className="rounded-lg"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {filteredLocations.map(location => (
                <Marker
                  key={location.id}
                  position={location.coordinates}
                  icon={icons[location.type] || icons.default}
                  eventHandlers={{
                    click: () => setSelectedLocation(location)
                  }}
                >
                  <Popup>
                    <div className="font-medium">{location.name}</div>
                    <div className="text-sm text-gray-600">
                      <div>Species: {location.species}</div>
                      <div>Quantity: {location.quantity}</div>
                      <div>Quality: {location.qualityScore}%</div>
                      <div>Compliance: {location.complianceScore}%</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          
          {/* Selected Location Details */}
          {selectedLocation && (
            <div className="mt-4 bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedLocation.name}</h3>
                  <p className="text-sm text-gray-600">Location Details</p>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Species</p>
                  <p className="font-medium">{selectedLocation.species}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-medium">{selectedLocation.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quality Score</p>
                  <p className="font-medium">{selectedLocation.qualityScore}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Compliance Score</p>
                  <p className="font-medium">{selectedLocation.complianceScore}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}