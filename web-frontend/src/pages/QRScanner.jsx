import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useQRStore } from '../stores'
import { batchAPI } from '../services/api'
import toast from 'react-hot-toast'
import { 
  QrCodeIcon, 
  CameraIcon, 
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export function QRScanner() {
  const navigate = useNavigate()
  const scannerRef = useRef(null)
  const [scanner, setScanner] = useState(null)
  const [manualInput, setManualInput] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanMode, setScanMode] = useState('camera') // 'camera' or 'manual'
  
  const { scanHistory, addToHistory, setScannedData } = useQRStore()
  
  useEffect(() => {
    if (scanMode === 'camera' && !scanner) {
      initializeScanner()
    }
    
    return () => {
      if (scanner) {
        scanner.clear()
      }
    }
  }, [scanMode])
  
  const initializeScanner = () => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    }
    
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-scanner-container",
      config,
      false
    )
    
    html5QrcodeScanner.render(onScanSuccess, onScanFailure)
    setScanner(html5QrcodeScanner)
  }
  
  const onScanSuccess = (decodedText, decodedResult) => {
    handleScanResult(decodedText)
    if (scanner) {
      scanner.clear()
      setScanner(null)
    }
  }
  
  const onScanFailure = (error) => {
    // Handle scan failure, usually better to ignore
    console.log(`QR scan error: ${error}`)
  }
  
  const handleScanResult = async (qrData) => {
    setIsScanning(true)
    
    try {
      // Extract batch ID from QR data
      // QR might contain just batch ID or a full URL
      const batchId = extractBatchId(qrData)
      
      if (!batchId) {
        toast.error('Invalid QR code format')
        return
      }
      
      // Add to scan history
      const scanData = {
        qrData,
        batchId,
        timestamp: new Date().toISOString(),
      }
      
      addToHistory(scanData)
      setScannedData(scanData)
      
      // Navigate to public product view (no login required)
      navigate(`/public/product/${batchId}`)
      
    } catch (error) {
      console.error('Scan error:', error)
      toast.error('Failed to process QR code')
    } finally {
      setIsScanning(false)
    }
  }
  
  const extractBatchId = (qrData) => {
    // Handle different QR formats
    if (qrData.startsWith('BATCH_')) {
      return qrData
    }
    
    // If it's a URL, extract batch ID from path
    try {
      const url = new URL(qrData)
      const pathParts = url.pathname.split('/')
      const batchIndex = pathParts.findIndex(part => part === 'product')
      if (batchIndex !== -1 && pathParts[batchIndex + 1]) {
        return pathParts[batchIndex + 1]
      }
    } catch (e) {
      // Not a valid URL, try as direct batch ID
    }
    
    // Handle QR codes that start with "QR"
    if (qrData.startsWith('QR')) {
      // This might be a QR code hash, we'd need to resolve it
      // For now, return as is and let the API handle it
      return qrData
    }
    
    return qrData
  }
  
  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualInput.trim()) {
      handleScanResult(manualInput.trim())
      setManualInput('')
    }
  }
  
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <QrCodeIcon className="mx-auto h-16 w-16 text-primary-600" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Product QR Scanner
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Scan or enter a product QR code to view complete traceability information
          </p>
        </div>
        
        {/* Scanner Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={() => setScanMode('camera')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                scanMode === 'camera'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CameraIcon className="h-4 w-4 inline mr-2" />
              Camera Scan
            </button>
            <button
              onClick={() => setScanMode('manual')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                scanMode === 'manual'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Manual Entry
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scanner Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {scanMode === 'camera' ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Camera Scanner
                  </h3>
                  <div 
                    id="qr-scanner-container" 
                    className="w-full max-w-md mx-auto"
                  />
                  {isScanning && (
                    <div className="text-center mt-4">
                      <div className="inline-flex items-center">
                        <div className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </div>
                        Processing scan...
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Manual Entry
                  </h3>
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="qr-input" className="block text-sm font-medium text-gray-700">
                        QR Code or Batch ID
                      </label>
                      <input
                        type="text"
                        id="qr-input"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        placeholder="Enter QR code data or batch ID..."
                        className="mt-1 input-field"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!manualInput.trim() || isScanning}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isScanning ? 'Processing...' : 'Verify Product'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
          
          {/* Scan History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
              Recent Scans
            </h3>
            
            {scanHistory.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No recent scans
              </p>
            ) : (
              <div className="space-y-3">
                {scanHistory.map((scan, index) => (
                  <div
                    key={index}
                    onClick={() => navigate(`/product/${scan.batchId}`)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {scan.productData?.productName || scan.batchId}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(scan.timestamp)}
                        </p>
                      </div>
                      <CheckCircleIcon className="h-4 w-4 text-green-500 ml-2 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            How to Use the QR Scanner
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Camera Scanning:</h4>
              <ul className="space-y-1">
                <li>• Allow camera access when prompted</li>
                <li>• Hold the QR code within the scanning frame</li>
                <li>• Ensure good lighting for best results</li>
                <li>• Keep the camera steady until scan completes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Manual Entry:</h4>
              <ul className="space-y-1">
                <li>• Enter the batch ID or QR code data</li>
                <li>• Batch IDs typically start with "BATCH_"</li>
                <li>• QR codes may start with "QR" followed by numbers</li>
                <li>• Copy-paste is supported for convenience</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}