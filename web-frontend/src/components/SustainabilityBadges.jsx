import { 
  CheckCircleIcon as LeafIcon, 
  ShieldCheckIcon, 
  GlobeAltIcon,
  HeartIcon,
  StarIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'

const sustainabilityBadges = [
  {
    id: 'organic',
    name: 'Organic Certified',
    description: 'Grown without synthetic pesticides or fertilizers',
    icon: LeafIcon,
    color: 'green',
    criteria: (traceability) => {
      // Check if pesticide tests show no residues
      const qualityTests = traceability?.qualityTests || []
      return qualityTests.some(test => 
        test.testResults?.pesticideResidues?.passed === true ||
        (test.testResults?.pesticideResidues?.detected || []).length === 0
      )
    }
  },
  {
    id: 'sustainable_harvest',
    name: 'Sustainable Harvest',
    description: 'Harvested following conservation guidelines and seasonal restrictions',
    icon: GlobeAltIcon,
    color: 'blue',
    criteria: (traceability) => {
      // Check if collection events passed validation
      const collectionEvents = traceability?.collectionEvents || []
      return collectionEvents.every(event => 
        event.validationsPassed?.geofencing && 
        event.validationsPassed?.seasonal && 
        event.validationsPassed?.dailyLimits
      )
    }
  },
  {
    id: 'quality_assured',
    name: 'Quality Assured',
    description: 'Passed all quality tests including DNA authentication',
    icon: ShieldCheckIcon,
    color: 'indigo',
    criteria: (traceability) => {
      const qualityTests = traceability?.qualityTests || []
      return qualityTests.length > 0 && qualityTests.every(test => test.overallPassed)
    }
  },
  {
    id: 'fair_trade',
    name: 'Fair Trade',
    description: 'Ensures fair compensation for farmers and collectors',
    icon: HeartIcon,
    color: 'pink',
    criteria: (traceability) => {
      // For demo purposes, assume fair trade if we have farmer/collector info
      const collectionEvents = traceability?.collectionEvents || []
      return collectionEvents.some(event => 
        event.collectorType === 'farmer' || event.collectorType === 'wild_collector'
      )
    }
  },
  {
    id: 'traceability_verified',
    name: 'Traceability Verified',
    description: 'Complete blockchain-verified supply chain transparency',
    icon: CheckBadgeIcon,
    color: 'purple',
    criteria: (traceability) => {
      const hasCollection = (traceability?.collectionEvents || []).length > 0
      const hasQuality = (traceability?.qualityTests || []).length > 0
      return hasCollection && hasQuality
    }
  },
  {
    id: 'premium_grade',
    name: 'Premium Grade',
    description: 'Highest quality standards with superior test results',
    icon: StarIcon,
    color: 'yellow',
    criteria: (traceability) => {
      const qualityTests = traceability?.qualityTests || []
      return qualityTests.some(test => 
        test.certificationLevel === 'PREMIUM' || test.certificationLevel === 'ORGANIC'
      )
    }
  }
]

export function SustainabilityBadges({ batch, traceability }) {
  const earnedBadges = sustainabilityBadges.filter(badge => 
    badge.criteria(traceability)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Sustainability & Compliance Badges
        </h2>
        <p className="text-gray-600">
          This product has earned the following sustainability and quality certifications 
          based on verified supply chain data.
        </p>
      </div>

      {/* Earned Badges */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Earned Certifications ({earnedBadges.length})
        </h3>
        
        {earnedBadges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {earnedBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} earned={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <ShieldCheckIcon className="mx-auto h-16 w-16" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Badges Earned
            </h3>
            <p className="text-gray-600">
              This product has not yet earned any sustainability or quality badges.
            </p>
          </div>
        )}
      </div>

      {/* All Available Badges */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          All Available Certifications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sustainabilityBadges.map((badge) => (
            <BadgeCard 
              key={badge.id} 
              badge={badge} 
              earned={earnedBadges.some(earned => earned.id === badge.id)} 
            />
          ))}
        </div>
      </div>

      {/* Sustainability Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Sustainability Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            label="Conservation Compliance"
            value={getConservationCompliance(traceability)}
            unit="%"
            color="green"
          />
          <MetricCard
            label="Quality Score"
            value={getQualityScore(traceability)}
            unit="/100"
            color="blue"
          />
          <MetricCard
            label="Traceability Score"
            value={getTraceabilityScore(traceability)}
            unit="/100"
            color="purple"
          />
          <MetricCard
            label="Sustainability Grade"
            value={getSustainabilityGrade(earnedBadges.length)}
            unit=""
            color="indigo"
          />
        </div>
      </div>

      {/* Impact Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Environmental & Social Impact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <LeafIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-900">Environmental Protection</div>
              <div className="text-gray-600">
                Harvested following sustainable practices and conservation guidelines
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <HeartIcon className="h-5 w-5 text-pink-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-900">Community Support</div>
              <div className="text-gray-600">
                Fair compensation and support for local farming communities
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-900">Quality Assurance</div>
              <div className="text-gray-600">
                Rigorous testing ensures product safety and authenticity
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BadgeCard({ badge, earned }) {
  const Icon = badge.icon
  const colorClasses = {
    green: earned ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200',
    blue: earned ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-400 border-gray-200',
    indigo: earned ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-gray-100 text-gray-400 border-gray-200',
    purple: earned ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-gray-100 text-gray-400 border-gray-200',
    pink: earned ? 'bg-pink-100 text-pink-800 border-pink-200' : 'bg-gray-100 text-gray-400 border-gray-200',
    yellow: earned ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-gray-100 text-gray-400 border-gray-200',
  }

  return (
    <div className={`border rounded-lg p-4 transition-all ${colorClasses[badge.color]} ${earned ? 'shadow-md' : 'opacity-60'}`}>
      <div className="flex items-center space-x-3 mb-3">
        <Icon className="h-6 w-6" />
        <h4 className="font-semibold">{badge.name}</h4>
        {earned && <CheckBadgeIcon className="h-5 w-5 text-green-600" />}
      </div>
      <p className="text-sm">{badge.description}</p>
    </div>
  )
}

function MetricCard({ label, value, unit, color }) {
  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600',
  }

  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${colorClasses[color]}`}>
        {value}{unit}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

function getConservationCompliance(traceability) {
  const collectionEvents = traceability?.collectionEvents || []
  if (collectionEvents.length === 0) return 0
  
  const compliantEvents = collectionEvents.filter(event => 
    event.validationsPassed?.geofencing && 
    event.validationsPassed?.seasonal && 
    event.validationsPassed?.dailyLimits
  )
  
  return Math.round((compliantEvents.length / collectionEvents.length) * 100)
}

function getQualityScore(traceability) {
  const qualityTests = traceability?.qualityTests || []
  if (qualityTests.length === 0) return 0
  
  const passedTests = qualityTests.filter(test => test.overallPassed)
  return Math.round((passedTests.length / qualityTests.length) * 100)
}

function getTraceabilityScore(traceability) {
  let score = 0
  const maxScore = 100
  
  // Collection events (40 points)
  if ((traceability?.collectionEvents || []).length > 0) score += 40
  
  // Quality tests (30 points)
  if ((traceability?.qualityTests || []).length > 0) score += 30
  
  // Processing steps (20 points)
  if ((traceability?.processingSteps || []).length > 0) score += 20
  
  // Batch creation (10 points)
  if (traceability?.batch) score += 10
  
  return score
}

function getSustainabilityGrade(badgeCount) {
  if (badgeCount >= 5) return 'A+'
  if (badgeCount >= 4) return 'A'
  if (badgeCount >= 3) return 'B+'
  if (badgeCount >= 2) return 'B'
  if (badgeCount >= 1) return 'C'
  return 'D'
}