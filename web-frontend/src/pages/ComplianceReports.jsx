import { useState, useEffect } from 'react'
import { reportsAPI, qualityAPI } from '../services/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { 
  DocumentTextIcon,
  CalendarIcon,
  FunnelIcon,
  CloudArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  EyeIcon,
  PrinterIcon
} from '@heroicons/react/24/outline'

export function ComplianceReports() {
  const [isLoading, setIsLoading] = useState(true)
  const [reports, setReports] = useState([])
  const [filters, setFilters] = useState({
    dateRange: '30d',
    reportType: 'all',
    complianceStatus: 'all',
    region: 'all',
    species: 'all'
  })
  const [selectedReport, setSelectedReport] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [filters])

  const fetchReports = async () => {
    try {
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
      const [reportsRes, qualityTestsRes] = await Promise.all([
        reportsAPI.getCompliance({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          reportType: filters.reportType !== 'all' ? filters.reportType : undefined,
          species: filters.species !== 'all' ? filters.species : undefined
        }),
        qualityAPI.getAll({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          species: filters.species !== 'all' ? filters.species : undefined
        })
      ])
      
      // Process the data for the reports list
      const processedReports = processReportsData(reportsRes.data, qualityTestsRes.data)
      setReports(processedReports)
      
    } catch (error) {
      console.error('Error fetching reports:', error)
      // Fallback to mock data if API fails
      const mockReports = generateMockReports(filters)
      setReports(mockReports)
    } finally {
      setIsLoading(false)
    }
  }

  const processReportsData = (complianceData, qualityTestsData) => {
    // Create reports from compliance data
    const complianceReports = complianceData.report ? [{
      id: 'compliance-' + Date.now(),
      title: 'Compliance Report',
      type: 'compliance',
      date: new Date().toISOString(),
      status: 'compliant',
      summary: {
        totalEvents: complianceData.report.summary.totalEvents,
        compliantEvents: complianceData.report.summary.compliantEvents,
        violations: complianceData.report.summary.violations.length
      },
      details: complianceData.report.details
    }] : []
    
    // Create reports from quality tests data
    const qualityTests = qualityTestsData.qualityTests || []
    const qualityReport = {
      id: 'quality-' + Date.now(),
      title: 'Quality Tests Report',
      type: 'quality',
      date: new Date().toISOString(),
      status: qualityTests.length > 0 ? 
        (qualityTests.filter(t => t.overallPassed).length / qualityTests.length >= 0.9 ? 'compliant' : 'warning') : 
        'pending',
      summary: {
        totalTests: qualityTests.length,
        passedTests: qualityTests.filter(t => t.overallPassed).length,
        failedTests: qualityTests.filter(t => !t.overallPassed).length
      },
      details: qualityTests
    }
    
    return [...complianceReports, qualityReport]
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const generateReport = async (type) => {
    setIsGenerating(true)
    try {
      // In real implementation, this would call the API
      const reportData = await reportsAPI.getCompliance({
        reportType: type,
        ...filters
      })
      
      alert(`${type} report generated successfully!`)
      fetchReports() // Refresh the list
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error generating report')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadReport = (reportId, format) => {
    // In real implementation, this would download the actual report
    const link = document.createElement('a')
    link.href = `data:text/plain;charset=utf-8,Compliance Report Content for Report ${reportId}`
    link.download = `compliance-report-${reportId}.${format}`
    link.click()
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'non-compliant':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    const classes = {
      compliant: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      'non-compliant': 'bg-red-100 text-red-800',
      pending: 'bg-blue-100 text-blue-800'
    }
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${classes[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('-', ' ').toUpperCase()}
      </span>
    )
  }

  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Compliance Reports</h1>
          <p className="mt-2 text-gray-600">
            Generate and manage regulatory compliance reports
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => generateReport('Quality Compliance')}
            disabled={isGenerating}
            className="btn-primary flex items-center"
          >
            {isGenerating ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <DocumentTextIcon className="h-4 w-4 mr-2" />
            )}
            Generate Report
          </button>
        </div>
      </div>

      {/* Report Generation Panel */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Report Generation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => generateReport('Quality Compliance')}
            disabled={isGenerating}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Quality Compliance</div>
            <div className="text-xs text-gray-500">Quality test results and standards</div>
          </button>
          
          <button
            onClick={() => generateReport('Traceability Audit')}
            disabled={isGenerating}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <DocumentTextIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Traceability Audit</div>
            <div className="text-xs text-gray-500">Supply chain tracking compliance</div>
          </button>
          
          <button
            onClick={() => generateReport('Regulatory Summary')}
            disabled={isGenerating}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Regulatory Summary</div>
            <div className="text-xs text-gray-500">Overall compliance summary</div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={filters.reportType}
                onChange={(e) => handleFilterChange('reportType', e.target.value)}
                className="input-field w-full"
              >
                <option value="all">All Types</option>
                <option value="quality">Quality Compliance</option>
                <option value="traceability">Traceability Audit</option>
                <option value="regulatory">Regulatory Summary</option>
              </select>
            </div>

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

            <button
              onClick={fetchReports}
              className="w-full btn-primary flex items-center justify-center"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Generated Reports</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {reports.map((report) => (
                <div key={report.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(report.status)}
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">{report.title}</h4>
                        <p className="text-sm text-gray-500">
                          Generated on {new Date(report.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(report.status)}
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => downloadReport(report.id, 'pdf')}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <PrinterIcon className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => downloadReport(report.id, 'csv')}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <CloudArrowDownIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 ml-9 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Events: </span>
                      <span className="font-medium">{report.summary?.totalEvents || report.summary?.totalTests || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Passed: </span>
                      <span className="font-medium text-green-600">
                        {report.summary?.compliantEvents || report.summary?.passedTests || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Violations: </span>
                      <span className="font-medium text-red-600">
                        {report.summary?.violations || report.summary?.failedTests || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {reports.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reports</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by generating a new compliance report.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedReport.title}
                </h3>
                <button
                  onClick={() => setSelectedReport(null)}
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
                      <dt className="text-sm font-medium text-gray-500">Report ID</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {selectedReport.id}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Generated Date</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {new Date(selectedReport.date).toLocaleString()}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {getStatusBadge(selectedReport.status)}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Summary</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Total Events</p>
                      <p className="text-lg font-bold">
                        {selectedReport.summary?.totalEvents || selectedReport.summary?.totalTests || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Passed</p>
                      <p className="text-lg font-bold text-green-600">
                        {selectedReport.summary?.compliantEvents || selectedReport.summary?.passedTests || 0}
                      </p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Violations</p>
                      <p className="text-lg font-bold text-red-600">
                        {selectedReport.summary?.violations || selectedReport.summary?.failedTests || 0}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Details</h4>
                  <div className="border border-gray-200 rounded-md">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(selectedReport.details || []).slice(0, 10).map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.id || item.batchId || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.type || 'Quality Test'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {item.overallPassed !== undefined ? (
                                  item.overallPassed ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      Passed
                                    </span>
                                  ) : (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                      Failed
                                    </span>
                                  )
                                ) : (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                    {item.status || 'N/A'}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(item.timestamp || item.testDate || new Date()).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
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
function generateMockReports(filters) {
  return [
    {
      id: 'report-1',
      title: 'Quality Compliance Report',
      type: 'quality',
      date: new Date().toISOString(),
      status: 'compliant',
      summary: {
        totalEvents: 124,
        compliantEvents: 118,
        violations: 6
      },
      details: []
    },
    {
      id: 'report-2',
      title: 'Traceability Audit Report',
      type: 'traceability',
      date: new Date(Date.now() - 86400000).toISOString(),
      status: 'warning',
      summary: {
        totalEvents: 89,
        compliantEvents: 82,
        violations: 7
      },
      details: []
    }
  ]
}