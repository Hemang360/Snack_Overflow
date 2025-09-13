import { useState } from 'react'
import { 
  CheckCircleIcon, 
  TruckIcon, 
  BeakerIcon, 
  CogIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

export function TraceabilityTimeline({ batch, traceability }) {
  const [expandedEvent, setExpandedEvent] = useState(null)
  
  // Create timeline events from traceability data
  const timelineEvents = createTimelineEvents(batch, traceability)
  
  const getEventIcon = (type) => {
    switch (type) {
      case 'collection':
        return CheckCircleIcon
      case 'quality':
        return BeakerIcon
      case 'processing':
        return CogIcon
      case 'batch_created':
        return BuildingStorefrontIcon
      case 'transport':
        return TruckIcon
      default:
        return CheckCircleIcon
    }
  }
  
  const getEventColor = (type, status) => {
    if (status === 'failed') return 'red'
    
    switch (type) {
      case 'collection':
        return 'green'
      case 'quality':
        return 'blue'
      case 'processing':
        return 'purple'
      case 'batch_created':
        return 'indigo'
      case 'transport':
        return 'orange'
      default:
        return 'gray'
    }
  }
  
  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Product Journey Timeline
        </h2>
        <p className="text-gray-600 mb-6">
          Follow the complete journey of this product from collection to final batch creation. 
          Each step is verified and recorded on the blockchain for transparency.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {traceability?.collectionEvents?.length || 0}
            </div>
            <div className="text-sm text-gray-500">Collection Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {traceability?.qualityTests?.length || 0}
            </div>
            <div className="text-sm text-gray-500">Quality Tests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {traceability?.processingSteps?.length || 0}
            </div>
            <div className="text-sm text-gray-500">Processing Steps</div>
          </div>
        </div>
      </div>
      
      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {timelineEvents.map((event, eventIdx) => {
              const Icon = getEventIcon(event.type)
              const color = getEventColor(event.type, event.status)
              const isExpanded = expandedEvent === eventIdx
              
              return (
                <li key={eventIdx}>
                  <div className="relative pb-8">
                    {eventIdx !== timelineEvents.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={`h-8 w-8 rounded-full bg-${color}-500 flex items-center justify-center ring-8 ring-white`}
                        >
                          <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div 
                          className="cursor-pointer"
                          onClick={() => setExpandedEvent(isExpanded ? null : eventIdx)}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {event.title}
                            </p>
                            <div className="flex items-center space-x-2">
                              {event.status && (
                                <span className={`badge badge-${event.status === 'passed' ? 'success' : 'error'}`}>
                                  {event.status}
                                </span>
                              )}
                              <time className="text-sm text-gray-500">
                                {new Date(event.timestamp).toLocaleDateString()}
                              </time>
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {event.description}
                          </p>
                        </div>
                        
                        {/* Expanded Details */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 bg-gray-50 rounded-lg p-4"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {event.details.map((detail, idx) => (
                                <div key={idx} className="flex items-start space-x-2">
                                  <detail.icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {detail.label}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {detail.value}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {event.extraData && (
                              <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                  Additional Information
                                </h4>
                                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                                  {JSON.stringify(event.extraData, null, 2)}
                                </pre>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

function createTimelineEvents(batch, traceability) {
  const events = []
  
  // Collection Events
  if (traceability?.collectionEvents) {
    traceability.collectionEvents.forEach(event => {
      events.push({
        type: 'collection',
        title: 'Herb Collection',
        description: `${event.species} collected by ${event.collectorType}`,
        timestamp: event.collectionDate || event.timestamp,
        status: 'passed',
        details: [
          { icon: UserIcon, label: 'Collector', value: event.collectorId },
          { icon: MapPinIcon, label: 'Location', value: `${event.gpsCoordinates?.lat}, ${event.gpsCoordinates?.lng}` },
          { icon: CheckCircleIcon, label: 'Quantity', value: `${event.quantity} ${event.unit}` },
          { icon: CalendarIcon, label: 'Collection Method', value: event.collectionMethod },
        ],
        extraData: {
          elevation: event.elevation,
          weatherConditions: event.weatherConditions,
          plantPart: event.plantPart,
          maturityStage: event.maturityStage,
          validationsPassed: event.validationsPassed
        }
      })
    })
  }
  
  // Quality Tests
  if (traceability?.qualityTests) {
    traceability.qualityTests.forEach(test => {
      events.push({
        type: 'quality',
        title: 'Quality Testing',
        description: `Lab testing performed by ${test.labId}`,
        timestamp: test.testDate || test.timestamp,
        status: test.overallPassed ? 'passed' : 'failed',
        details: [
          { icon: BeakerIcon, label: 'Lab ID', value: test.labId },
          { icon: CheckCircleIcon, label: 'Overall Result', value: test.overallPassed ? 'PASSED' : 'FAILED' },
          { icon: CalendarIcon, label: 'Test Date', value: new Date(test.testDate).toLocaleDateString() },
          { icon: UserIcon, label: 'Certification', value: test.certificationLevel },
        ],
        extraData: {
          moisture: test.testResults?.moisture,
          pesticideResidues: test.testResults?.pesticideResidues,
          heavyMetals: test.testResults?.heavyMetals,
          microbiology: test.testResults?.microbiology,
          dnaBarcode: test.testResults?.dnaBarcode
        }
      })
    })
  }
  
  // Processing Steps
  if (traceability?.processingSteps) {
    traceability.processingSteps.forEach(step => {
      events.push({
        type: 'processing',
        title: 'Processing Step',
        description: `${step.processType} performed by ${step.processorId}`,
        timestamp: step.processDate || step.timestamp,
        status: 'passed',
        details: [
          { icon: CogIcon, label: 'Process Type', value: step.processType },
          { icon: UserIcon, label: 'Processor', value: step.processorId },
          { icon: CheckCircleIcon, label: 'Input Quantity', value: `${step.inputQuantity} units` },
          { icon: CheckCircleIcon, label: 'Output Quantity', value: `${step.outputQuantity} units` },
        ],
        extraData: {
          processParameters: step.processParameters,
          equipment: step.equipment,
          operatorId: step.operatorId,
          qualityChecks: step.qualityChecks
        }
      })
    })
  }
  
  // Batch Creation
  events.push({
    type: 'batch_created',
    title: 'Product Batch Created',
    description: `Final product batch created by ${batch.manufacturerId}`,
    timestamp: batch.creationDate || batch.timestamp,
    status: 'passed',
    details: [
      { icon: BuildingStorefrontIcon, label: 'Manufacturer', value: batch.manufacturerId },
      { icon: CheckCircleIcon, label: 'Batch ID', value: batch.id },
      { icon: CheckCircleIcon, label: 'Quantity', value: `${batch.quantity} ${batch.unit}` },
      { icon: CalendarIcon, label: 'Expiry Date', value: batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : 'Not specified' },
    ],
    extraData: {
      certifications: batch.certifications,
      qrCode: batch.qrCode,
      status: batch.status
    }
  })
  
  // Sort by timestamp
  return events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
}