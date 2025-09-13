import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collectionAPI, qualityAPI, analyticsAPI } from '../services/api'
import { useAuthStore } from '../stores'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { 
  ChartBarIcon,
  MapIcon,
  DocumentChartBarIcon,
  ClockIcon,
  FolderIcon,
  BeakerIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

const dashboardStats = [
  {
    name: 'Total Collections',
    value: 0,
    change: 0,
    icon: FolderIcon,
    color: 'bg-blue-500',
  },
  {
    name: 'Quality Tests',
    value: 0,
    change: 0,
    icon: BeakerIcon,
    color: 'bg-green-500',
  },
  {
    name: 'Processing Batches',
    value: 0,
    change: 0,
    icon: TruckIcon,
    color: 'bg-purple-500',
  },
  {
    name: 'Compliance Rate',
    value: '0%',
    change: 0,
    icon: CheckCircleIcon,
    color: 'bg-yellow-500',
  },
]

const quickActions = [
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

export function StakeholderDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState(dashboardStats)
  const [recentActivity, setRecentActivity] = useState([])
  const { user } = useAuthStore()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch data from multiple APIs
      const [collectionsRes, testsRes, dashboardStatsRes] = await Promise.all([
        collectionAPI.getAll({ page: 1, pageSize: 5 }),
        qualityAPI.getAll({ page: 1, pageSize: 5 }),
        analyticsAPI.getDashboardStats()
      ])
      
      // Update stats with real data
      const updatedStats = [...dashboardStats]
      updatedStats[0].value = dashboardStatsRes.data.stats.totalCollections
      updatedStats[1].value = dashboardStatsRes.data.stats.totalQualityTests
      updatedStats[3].value = `${dashboardStatsRes.data.stats.complianceRate}%`
      
      setStats(updatedStats)
      
      // Combine recent activity from collections and tests
      const recentCollections = (collectionsRes.data.collectionEvents || []).map(event => ({
        id: event.id,
        type: 'collection',
        title: `Collection Event - ${event.commonName || event.species}`,
        description: `Collected ${event.quantity} ${event.unit} by ${event.collectorId}`,
        timestamp: event.timestamp,
        status: 'completed'
      }))
      
      const recentTests = (testsRes.data.qualityTests || []).map(test => ({
        id: test.id,
        type: 'quality',
        title: `Quality Test - Batch ${test.batchId}`,
        description: `Test ${test.overallPassed ? 'PASSED' : 'FAILED'} for ${test.species}`,
        timestamp: test.timestamp,
        status: test.overallPassed ? 'completed' : 'failed'
      }))
      
      // Combine and sort by timestamp
      const allActivity = [...recentCollections, ...recentTests]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10)
      
      setRecentActivity(allActivity)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'pending':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return <CheckCircleIcon className="h-5 w-5 text-gray-500" />
    }
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
          Welcome back, {user?.fullName || user?.username}
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your supply chain today.
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-4">
              {quickActions.map((action) => (
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

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getStatusIcon(activity.status)}
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Activity will appear here once events are recorded.
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