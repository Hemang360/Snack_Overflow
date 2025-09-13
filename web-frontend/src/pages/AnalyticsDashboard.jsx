import { useState, useEffect } from 'react'
import { analyticsAPI } from '../services/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { 
  ChartBarIcon, 
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MapPinIcon,
  DocumentTextIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function AnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [analytics, setAnalytics] = useState({
    overview: {},
    collectionTrends: [],
    qualityMetrics: [],
    speciesDistribution: [],
    geographicalData: [],
    complianceMetrics: []
  })
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  const fetchAnalyticsData = async () => {
    try {
      setError(null)
      setIsLoading(true)
      
      // Calculate date range for API calls
      const endDate = new Date()
      let startDate = new Date()
      
      switch (dateRange) {
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
      
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]
      
      // Fetch real data from APIs
      const [dashboardStats, collectionSummary, qualityTestsRes] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        analyticsAPI.getCollectionSummary({ startDate: startDateStr, endDate: endDateStr }),
        analyticsAPI.getMetrics() // This will give us quality test data
      ])
      
      // Process the data for charts
      const processedData = processAnalyticsData(dashboardStats.data, collectionSummary.data, qualityTestsRes.data, dateRange)
      setAnalytics(processedData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError(error.message || 'Failed to load analytics data')
      toast.error('Failed to load analytics data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const processAnalyticsData = (dashboardStats, collectionSummary, qualityData, dateRange) => {
    // Overview stats
    const overview = {
      totalCollections: dashboardStats.stats.totalCollections,
      collectionsChange: 0, // Would need historical data to calculate change
      avgQualityScore: dashboardStats.stats.complianceRate,
      qualityChange: 0, // Would need historical data to calculate change
      complianceRate: dashboardStats.stats.complianceRate,
      complianceChange: 0, // Would need historical data to calculate change
      activeLocations: 0, // Would need to calculate from collection data
      locationsChange: 0 // Would need historical data to calculate change
    }
    
    // Collection trends (mock data for now, would need time-series data from API)
    const collectionTrends = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      collections: Math.floor(Math.random() * 50) + 10
    }))
    
    // Quality metrics
    const qualityMetrics = [
      { category: 'Purity', passed: 85, failed: 15 },
      { category: 'Moisture', passed: 92, failed: 8 },
      { category: 'Contamination', passed: 78, failed: 22 },
      { category: 'Potency', passed: 88, failed: 12 }
    ]
    
    // Species distribution from collection summary
    const speciesDistribution = Object.entries(collectionSummary.speciesBreakdown || {}).map(([species, quantity]) => ({
      name: species,
      value: quantity
    }))
    
    // Geographical data (mock for now)
    const geographicalData = [
      { name: 'Kerala Highlands', collections: 145, qualityScore: 94 },
      { name: 'Karnataka Hills', collections: 132, qualityScore: 91 },
      { name: 'Tamil Nadu Plains', collections: 98, qualityScore: 87 },
      { name: 'Andhra Pradesh', collections: 76, qualityScore: 89 },
      { name: 'Maharashtra', collections: 54, qualityScore: 85 }
    ]
    
    // Compliance metrics (mock data for now)
    const complianceMetrics = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i, 1).toLocaleDateString('en', { month: 'short' }),
      compliance: Math.floor(Math.random() * 15) + 85
    }))
    
    return {
      overview,
      collectionTrends,
      qualityMetrics,
      speciesDistribution,
      geographicalData,
      complianceMetrics
    }
  }

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
          <h3 className="mt-4 text-xl font-semibold text-gray-900">Error Loading Analytics</h3>
          <p className="mt-2 text-gray-600">{error}</p>
          <div className="mt-6">
            <button
              onClick={fetchAnalyticsData}
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive supply chain analytics and insights
          </p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex items-center space-x-4">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field w-32"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Collections"
          value={analytics.overview.totalCollections}
          change={analytics.overview.collectionsChange}
          icon={ChartBarIcon}
          color="blue"
        />
        <MetricCard
          title="Quality Score"
          value={`${analytics.overview.avgQualityScore}%`}
          change={analytics.overview.qualityChange}
          icon={CheckCircleIcon}
          color="green"
        />
        <MetricCard
          title="Compliance Rate"
          value={`${analytics.overview.complianceRate}%`}
          change={analytics.overview.complianceChange}
          icon={ExclamationTriangleIcon}
          color={analytics.overview.complianceRate >= 95 ? 'green' : 'orange'}
        />
        <MetricCard
          title="Active Locations"
          value={analytics.overview.activeLocations}
          change={analytics.overview.locationsChange}
          icon={MapPinIcon}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collection Trends */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.collectionTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="collections" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quality Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Test Results</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.qualityMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="passed" fill="#10b981" />
              <Bar dataKey="failed" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Species Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Species Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.speciesDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.speciesDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.complianceMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Compliance Rate']} />
              <Line 
                type="monotone" 
                dataKey="compliance" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Locations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Locations</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collections
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quality Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.geographicalData.slice(0, 5).map((location, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {location.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.collections}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        location.qualityScore >= 90 
                          ? 'bg-green-100 text-green-800' 
                          : location.qualityScore >= 80 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {location.qualityScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Issues */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Quality Issues</h3>
          <div className="space-y-4">
            {analytics.recentIssues?.slice(0, 5).map((issue, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">{issue?.title || 'Quality Issue'}</p>
                  <p className="text-xs text-red-700">{issue?.description || 'A quality test failed'}</p>
                  <p className="text-xs text-red-500 mt-1">{issue?.date || 'Recently'}</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500">
                <CheckCircleIcon className="h-8 w-8 mx-auto mb-2 text-green-500" />
                No recent quality issues
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Export Analytics Data</h3>
            <p className="text-sm text-gray-600">Download detailed reports and raw data</p>
          </div>
          <div className="flex space-x-3">
            <button className="btn-secondary flex items-center">
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button className="btn-secondary flex items-center">
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, change, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  }

  const isPositive = change >= 0
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center mt-2">
            {isPositive ? (
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(change)}% from last period
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )
}