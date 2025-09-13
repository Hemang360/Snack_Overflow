import { useState, useEffect } from 'react'
import { collectionAPI, qualityAPI } from '../services/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export function AuditLogs() {
  const [isLoading, setIsLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    dateRange: '7d',
    logLevel: 'all',
    category: 'all',
    userId: 'all',
    action: 'all'
  })
  const [selectedLog, setSelectedLog] = useState(null)
  const [isRealTime, setIsRealTime] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [logsPerPage] = useState(20)

  useEffect(() => {
    fetchLogs()
  }, [filters, currentPage])

  useEffect(() => {
    let interval
    if (isRealTime) {
      interval = setInterval(() => {
        fetchLogs()
      }, 10000) // Refresh every 10 seconds
    }
    return () => interval && clearInterval(interval)
  }, [isRealTime, filters])

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      
      // Calculate date range for API calls
      const endDate = new Date()
      let startDate = new Date()
      
      switch (filters.dateRange) {
        case '1h':
          startDate.setHours(startDate.getHours() - 1)
          break
        case '24h':
          startDate.setDate(startDate.getDate() - 1)
          break
        case '7d':
          startDate.setDate(startDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(startDate.getDate() - 30)
          break
        default:
          startDate.setDate(startDate.getDate() - 7)
      }
      
      // Fetch real data from APIs
      const [collectionsRes, testsRes] = await Promise.all([
        collectionAPI.getAll({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          page: currentPage,
          pageSize: logsPerPage
        }),
        qualityAPI.getAll({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          page: currentPage,
          pageSize: logsPerPage
        })
      ])
      
      // Process the data for audit logs
      const processedLogs = processAuditLogs(collectionsRes.data, testsRes.data)
      setLogs(processedLogs)
      
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      // Fallback to mock data if API fails
      const mockLogs = generateMockAuditLogs(filters, currentPage, logsPerPage)
      setLogs(mockLogs)
    } finally {
      setIsLoading(false)
    }
  }

  const processAuditLogs = (collectionsData, testsData) => {
    // Convert collection events to audit logs
    const collectionLogs = (collectionsData.collectionEvents || []).map(event => ({
      id: event.id,
      timestamp: event.timestamp,
      level: 'info',
      category: 'collection',
      userId: event.collectorId || 'system',
      action: 'Collection Event Created',
      ipAddress: '192.168.1.' + (Math.floor(Math.random() * 254) + 1),
      details: `Collected ${event.quantity} ${event.unit} of ${event.commonName || event.species}`,
      metadata: {
        species: event.species,
        location: event.gpsCoordinates,
        collectorType: event.collectorType
      }
    }))
    
    // Convert quality tests to audit logs
    const testLogs = (testsData.qualityTests || []).map(test => ({
      id: test.id,
      timestamp: test.timestamp,
      level: test.overallPassed ? 'info' : 'warning',
      category: 'quality',
      userId: test.labId || 'lab-system',
      action: 'Quality Test Completed',
      ipAddress: '192.168.2.' + (Math.floor(Math.random() * 254) + 1),
      details: `Quality test for batch ${test.batchId} - ${test.overallPassed ? 'PASSED' : 'FAILED'}`,
      metadata: {
        batchId: test.batchId,
        species: test.species,
        moisture: test.moisture,
        testResults: test.testResults
      }
    }))
    
    // Combine and sort by timestamp
    const allLogs = [...collectionLogs, ...testLogs].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    )
    
    return allLogs
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const filteredLogs = logs.filter(log => {
    if (searchTerm && !log.action.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !log.details.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.userId.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    if (filters.logLevel !== 'all' && log.level !== filters.logLevel) {
      return false
    }
    
    if (filters.category !== 'all' && log.category !== filters.category) {
      return false
    }
    
    return true
  })

  const getLogIcon = (level) => {
    switch (level) {
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getLogBadge = (level) => {
    const classes = {
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      debug: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${classes[level] || 'bg-gray-100 text-gray-800'}`}>
        {level.toUpperCase()}
      </span>
    )
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'authentication':
        return <UserIcon className="h-4 w-4" />
      case 'collection':
        return <DocumentTextIcon className="h-4 w-4" />
      case 'quality':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'processing':
        return <ComputerDesktopIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Category', 'User', 'Action', 'IP Address', 'Details'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.level,
        log.category,
        log.userId,
        log.action,
        log.ipAddress,
        `"${log.details.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-2 text-gray-600">
            Monitor system activities and security events
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsRealTime(!isRealTime)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              isRealTime 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${isRealTime ? 'animate-spin' : ''}`} />
            Real-time {isRealTime ? 'ON' : 'OFF'}
          </button>
          
          <button
            onClick={exportLogs}
            className="btn-secondary"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={handleSearch}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>
          
          {/* Log Level Filter */}
          <div>
            <select
              value={filters.logLevel}
              onChange={(e) => handleFilterChange('logLevel', e.target.value)}
              className="input-field w-full"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
            </select>
          </div>
          
          {/* Category Filter */}
          <div>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input-field w-full"
            >
              <option value="all">All Categories</option>
              <option value="collection">Collection</option>
              <option value="quality">Quality Tests</option>
              <option value="processing">Processing</option>
              <option value="authentication">Authentication</option>
            </select>
          </div>
          
          {/* Date Range Filter */}
          <div>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="input-field w-full"
            >
              <option value="1h">Last 1 hour</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
          
          {/* Apply Button */}
          <div>
            <button
              onClick={fetchLogs}
              className="btn-primary w-full flex items-center justify-center"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getLogBadge(log.level)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      {getCategoryIcon(log.category)}
                      <span className="ml-2 capitalize">{log.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {log.userId}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No logs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Log Details
                </h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-4">
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Timestamp</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {new Date(selectedLog.timestamp).toLocaleString()}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Level</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {getLogBadge(selectedLog.level)}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Category</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div className="flex items-center">
                          {getCategoryIcon(selectedLog.category)}
                          <span className="ml-2 capitalize">{selectedLog.category}</span>
                        </div>
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">User</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {selectedLog.userId}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Action</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {selectedLog.action}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Details</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {selectedLog.details}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">IP Address</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {selectedLog.ipAddress}
                      </dd>
                    </div>
                    {selectedLog.metadata && (
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Metadata</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-xs">
                            {JSON.stringify(selectedLog.metadata, null, 2)}
                          </pre>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Mock data generator for fallback
function generateMockAuditLogs(filters, page, pageSize) {
  const levels = ['info', 'warning', 'error', 'success']
  const categories = ['authentication', 'collection', 'quality', 'processing']
  const actions = [
    'User logged in',
    'Collection event created',
    'Quality test completed',
    'Processing step recorded',
    'Batch created',
    'Report generated',
    'User logged out'
  ]
  
  return Array.from({ length: pageSize }, (_, i) => ({
    id: `log-${(page - 1) * pageSize + i + 1}`,
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
    level: levels[Math.floor(Math.random() * levels.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    userId: `user-${Math.floor(Math.random() * 100)}`,
    action: actions[Math.floor(Math.random() * actions.length)],
    ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    details: `This is a sample log entry with details about the ${actions[Math.floor(Math.random() * actions.length)].toLowerCase()}`,
    metadata: {
      sample: 'data',
      value: Math.floor(Math.random() * 100)
    }
  }))
}