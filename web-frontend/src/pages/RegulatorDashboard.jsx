import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collectionAPI, qualityAPI, reportsAPI } from '../services/api'
import { useAuthStore } from '../stores'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { 
  ChartBarIcon,
  MapIcon,
  DocumentChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

const complianceStats = [
  {
    name: 'Overall Compliance',
    value: '0%',
    change: 0,
    icon: CheckCircleIcon,
    color: 'bg-green-500',
  },
  {
    name: 'Pending Reviews',
    value: 0,
    change: 0,
    icon: ExclamationTriangleIcon,
    color: 'bg-yellow-500',
  },
  {
    name: 'Violations',
    value: 0,
    change: 0,
    icon: XCircleIcon,
    color: 'bg-red-500',
  },
]

const regulatorActions = [
  {
    name: 'Analytics Dashboard',
    description: 'View comprehensive supply chain analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    name: 'Geo Analytics',
    description: 'Interactive geographical analysis',
    href: '/geo-analytics',
    icon: MapIcon,
    color: 'bg-green-100 text-green-600',
  },
  {
    name: 'Compliance Reports',
    description: 'Generate and manage compliance reports',
    href: '/compliance',
    icon: DocumentChartBarIcon,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    name: 'Audit Logs',
    description: 'Monitor system activities and security events',
    href: '/audit',
    icon: ClockIcon,
    color: 'bg-yellow-100 text-yellow-600',
  },
]

export function RegulatorDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState(complianceStats)
  const [recentReports, setRecentReports] = useState([])
  const { user } = useAuthStore()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch data from multiple APIs
      const [testsRes, reportsRes] = await Promise.all([
        qualityAPI.getAll({ page: 1, pageSize: 20 }),
        reportsAPI.getCompliance({ reportType: 'summary' })
      ])
      
      // Calculate compliance stats
      const qualityTests = testsRes.data.qualityTests || []
      const totalTests = qualityTests.length
      const passedTests = qualityTests.filter(test => test.overallPassed).length
      const complianceRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
      
      // Update stats with real data
      const updatedStats = [...complianceStats]
      updatedStats[0].value = `${complianceRate}%`
      updatedStats[1].value = qualityTests.filter(test => test.status === 'pending').length
      updatedStats[2].value = totalTests - passedTests
      
      setStats(updatedStats)
      
      // Process recent reports
      const recentReportsData = [
        {
          id: 'report-1',
          title: 'Weekly Compliance Report',
          date: new Date().toISOString(),
          status: complianceRate >= 90 ? 'compliant' : 'warning',
          summary: {
            totalEvents: totalTests,
            compliantEvents: passedTests,
            violations: totalTests - passedTests
          }
        },
        {
          id: 'report-2',
          title: 'Monthly Quality Audit',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          summary: {
            totalEvents: 0,
            compliantEvents: 0,
            violations: 0
          }
        }
      ]
      
      setRecentReports(recentReportsData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const classes = {
      compliant: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
      nonCompliant: 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${classes[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
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
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Regulatory Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Monitor compliance and generate regulatory reports.
        </p>
      </div>

      {/* Compliance Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden rounded-lg shadow-md">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Regulatory Tools</h2>
            <div className="space-y-4">
              {regulatorActions.map((action) => (
                <Link
                  key={action.name}
                  to={action.href}
                  className="block hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center p-3">
                    <div className={`rounded-lg p-2 ${action.color}`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">{action.name}</h3>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Reports</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentReports.length > 0 ? (
                recentReports.map((report) => (
                  <div key={report.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {report.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Generated on {new Date(report.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(report.status)}
                        <div className="text-sm text-gray-500">
                          {report.summary.compliantEvents}/{report.summary.totalEvents} compliant
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <DocumentChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reports generated</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Reports will appear here once they are generated.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}