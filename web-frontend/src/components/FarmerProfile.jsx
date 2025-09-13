import { 
  UserGroupIcon, 
  MapPinIcon, 
  CalendarIcon,
  BuildingOffice2Icon as BuildingOfficeIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline'

export function FarmerProfile({ collectionEvents, batch }) {
  // Extract unique collectors from collection events
  const collectors = extractCollectors(collectionEvents)
  
  if (collectors.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <UserGroupIcon className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">
          No Farmer Information Available
        </h3>
        <p className="text-gray-600">
          Farmer and collector profiles for this product are not available.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Farmers & Collectors Profile
        </h2>
        <p className="text-gray-600">
          Meet the dedicated farmers and collectors who carefully harvested the herbs used in this product.
        </p>
      </div>

      {/* Collector Profiles */}
      {collectors.map((collector, index) => (
        <CollectorCard key={index} collector={collector} />
      ))}

      {/* Community Impact */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <HeartIcon className="h-5 w-5 text-red-500 mr-2" />
          Community Impact
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {collectors.length}
            </div>
            <div className="text-sm text-gray-600">
              Farmers & Collectors Supported
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {getTotalQuantity(collectionEvents)} kg
            </div>
            <div className="text-sm text-gray-600">
              Total Herbs Collected
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {getUniqueRegions(collectionEvents)}
            </div>
            <div className="text-sm text-gray-600">
              Regions Represented
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
          <p className="text-sm text-gray-700">
            <strong>Fair Trade Commitment:</strong> All farmers and collectors receive fair 
            compensation for their sustainable harvesting practices. By purchasing this product, 
            you're supporting local communities and traditional farming methods.
          </p>
        </div>
      </div>

      {/* Sustainable Practices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Sustainable Practices
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Conservation Methods</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Seasonal harvesting following traditional calendars</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Sustainable collection quantities to preserve plant populations</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>GPS monitoring to avoid protected conservation areas</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Traditional knowledge preservation and documentation</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Quality Assurance</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Proper harvesting techniques to maintain herb potency</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Immediate post-harvest processing to preserve quality</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Weather-dependent collection for optimal herb characteristics</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Blockchain verification of all collection activities</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function CollectorCard({ collector }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="h-16 w-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {collector.id.slice(-2).toUpperCase()}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {collector.displayName}
              </h3>
              <span className={`badge ${getCollectorTypeBadge(collector.type)}`}>
                {collector.type.replace('_', ' ')}
              </span>
            </div>
            
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4 mr-2" />
                <span>{collector.region}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>Active since {collector.firstCollection}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                <span>{collector.totalCollections} collection events</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Collection Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Collection Summary for This Product</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {collector.collections.map((collection, idx) => (
              <div key={idx} className="text-center">
                <div className="font-semibold text-gray-900">
                  {collection.quantity} {collection.unit}
                </div>
                <div className="text-gray-600">{collection.species}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(collection.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Achievements */}
        {collector.achievements && collector.achievements.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
              Achievements
            </h4>
            <div className="flex flex-wrap gap-2">
              {collector.achievements.map((achievement, idx) => (
                <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  {achievement}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function extractCollectors(collectionEvents) {
  if (!collectionEvents || collectionEvents.length === 0) return []
  
  const collectorMap = new Map()
  
  collectionEvents.forEach(event => {
    const collectorId = event.collectorId
    
    if (!collectorMap.has(collectorId)) {
      collectorMap.set(collectorId, {
        id: collectorId,
        displayName: `${event.collectorType === 'farmer' ? 'Farmer' : 'Collector'} ${collectorId.slice(-4)}`,
        type: event.collectorType || 'unknown',
        region: getRegionFromCoordinates(event.gpsCoordinates),
        firstCollection: new Date(event.collectionDate || event.timestamp).toLocaleDateString(),
        totalCollections: 0,
        collections: [],
        achievements: generateAchievements(event)
      })
    }
    
    const collector = collectorMap.get(collectorId)
    collector.totalCollections += 1
    collector.collections.push({
      species: event.species,
      quantity: event.quantity,
      unit: event.unit,
      date: event.collectionDate || event.timestamp
    })
  })
  
  return Array.from(collectorMap.values())
}

function getCollectorTypeBadge(type) {
  switch (type) {
    case 'farmer':
      return 'badge-success'
    case 'wild_collector':
      return 'badge-info'
    default:
      return 'badge-secondary'
  }
}

function getRegionFromCoordinates(coordinates) {
  if (!coordinates || !coordinates.lat || !coordinates.lng) {
    return 'Unknown Region'
  }
  
  // This is a simplified region mapping
  // In a real app, you'd use reverse geocoding
  const lat = coordinates.lat
  const lng = coordinates.lng
  
  if (lat >= 8 && lat <= 12 && lng >= 75 && lng <= 77) {
    return 'Western Ghats, Kerala'
  } else if (lat >= 15 && lat <= 20 && lng >= 73 && lng <= 78) {
    return 'Maharashtra Plateau'
  } else if (lat >= 20 && lat <= 30 && lng >= 75 && lng <= 85) {
    return 'Northern Plains'
  } else if (lat >= 11 && lat <= 15 && lng >= 78 && lng <= 82) {
    return 'Tamil Nadu Hills'
  }
  
  return `Region ${lat.toFixed(1)}°N, ${lng.toFixed(1)}°E`
}

function getTotalQuantity(collectionEvents) {
  if (!collectionEvents) return 0
  return collectionEvents.reduce((total, event) => total + (event.quantity || 0), 0)
}

function getUniqueRegions(collectionEvents) {
  if (!collectionEvents) return 0
  const regions = new Set()
  collectionEvents.forEach(event => {
    regions.add(getRegionFromCoordinates(event.gpsCoordinates))
  })
  return regions.size
}

function generateAchievements(event) {
  const achievements = []
  
  if (event.validationsPassed?.geofencing) {
    achievements.push('Conservation Compliant')
  }
  
  if (event.validationsPassed?.seasonal) {
    achievements.push('Seasonal Expert')
  }
  
  if (event.quantity > 50) {
    achievements.push('High Volume Collector')
  }
  
  if (event.collectionMethod === 'sustainable') {
    achievements.push('Sustainable Practices')
  }
  
  return achievements
}