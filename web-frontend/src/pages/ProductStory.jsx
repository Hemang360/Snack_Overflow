import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { batchAPI, recallsAPI } from '../services/api'
import { useProductStore } from '../stores'
import { TraceabilityTimeline } from '../components/TraceabilityTimeline'
import { LocationMap } from '../components/LocationMap'
import { QualityCertificates } from '../components/QualityCertificates'
import { SustainabilityBadges } from '../components/SustainabilityBadges'
import { FarmerProfile } from '../components/FarmerProfile'
import { RecallAlert } from '../components/RecallAlert'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { 
  ShieldCheckIcon, 
  MapPinIcon, 
  ClockIcon, 
  UserGroupIcon,
  BeakerIcon,
  CheckCircleIcon as LeafIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export function ProductStory() {
  const { batchId } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [productData, setProductData] = useState(null)
  const [traceabilityData, setTraceabilityData] = useState(null)
  const [recallData, setRecallData] = useState(null)
  const [activeTab, setActiveTab] = useState('timeline')
  
  useEffect(() => {
    if (batchId) {
      fetchProductData()
      checkRecallStatus()
    }
  }, [batchId])
  
  const fetchProductData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch product batch and traceability data
      const [batchResponse, traceabilityResponse] = await Promise.all([
        batchAPI.get(batchId),
        batchAPI.getTraceability(batchId)
      ])
      
      setProductData(batchResponse.data.productBatch)
      setTraceabilityData(traceabilityResponse.data.traceability)
      
    } catch (error) {
      console.error('Error fetching product data:', error)
      toast.error('Failed to load product information')
    } finally {
      setIsLoading(false)
    }
  }
  
  const checkRecallStatus = async () => {
    try {
      const response = await recallsAPI.get(batchId)
      setRecallData(response.data.recall)
    } catch (error) {
      // No recall found, which is good
      if (error.response?.status !== 404) {
        console.error('Error checking recall status:', error)
      }
    }
  }
  
  const tabs = [
    { id: 'timeline', name: 'Journey Timeline', icon: ClockIcon },
    { id: 'location', name: 'Origin Map', icon: MapPinIcon },
    { id: 'quality', name: 'Lab Certificates', icon: BeakerIcon },
    { id: 'sustainability', name: 'Sustainability', icon: LeafIcon },
    { id: 'farmer', name: 'Farmer Profile', icon: UserGroupIcon },
  ]
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Product Not Found</h2>
          <p className="mt-2 text-gray-600">
            The product with ID "{batchId}" could not be found.
          </p>
          <Link
            to="/scan"
            className="mt-4 inline-block btn-primary"
          >
            Scan Another Product
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Recall Alert */}
      {recallData && <RecallAlert recall={recallData} />}
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-primary-100 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {productData.productName}
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  Batch ID: {productData.id}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`badge ${getStatusBadgeClass(productData.status)}`}>
                    {productData.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-500">
                    Created: {new Date(productData.creationDate).toLocaleDateString()}
                  </span>
                  {productData.expiryDate && (
                    <span className="text-sm text-gray-500">
                      Expires: {new Date(productData.expiryDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">QR Code</div>
                <div className="text-lg font-mono font-medium text-gray-900">
                  {productData.qrCode}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'timeline' && (
          <TraceabilityTimeline 
            batch={productData} 
            traceability={traceabilityData}
          />
        )}
        
        {activeTab === 'location' && (
          <LocationMap 
            collectionEvents={traceabilityData?.collectionEvents || []}
            batch={productData}
          />
        )}
        
        {activeTab === 'quality' && (
          <QualityCertificates 
            qualityTests={traceabilityData?.qualityTests || []}
            batch={productData}
          />
        )}
        
        {activeTab === 'sustainability' && (
          <SustainabilityBadges 
            batch={productData}
            traceability={traceabilityData}
          />
        )}
        
        {activeTab === 'farmer' && (
          <FarmerProfile 
            collectionEvents={traceabilityData?.collectionEvents || []}
            batch={productData}
          />
        )}
      </div>
      
      {/* Footer CTA */}
      <div className="bg-primary-50 border-t border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Want to verify another product?
          </h3>
          <Link
            to="/scan"
            className="btn-primary"
          >
            Scan Another QR Code
          </Link>
        </div>
      </div>
    </div>
  )
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'QUALITY_PASSED':
      return 'badge-success'
    case 'QUALITY_FAILED':
      return 'badge-error'
    case 'CREATED':
      return 'badge-info'
    case 'PROCESSING_UPDATED':
      return 'badge-warning'
    default:
      return 'badge-info'
  }
}