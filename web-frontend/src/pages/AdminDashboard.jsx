import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ChartBarIcon,
  MapIcon,
  DocumentChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const adminActions = [
  {
    name: 'User Management',
    description: 'Manage users and permissions',
    href: '/admin/users',
    icon: UserGroupIcon,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    name: 'System Configuration',
    description: 'Configure system settings',
    href: '/admin/config',
    icon: CogIcon,
    color: 'bg-green-100 text-green-600',
  },
  {
    name: 'Security Settings',
    description: 'Manage security policies',
    href: '/admin/security',
    icon: ShieldCheckIcon,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    name: 'Analytics Dashboard',
    description: 'View comprehensive supply chain analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    name: 'Geo Analytics',
    description: 'Interactive geographical analysis',
    href: '/geo-analytics',
    icon: MapIcon,
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    name: 'Compliance Reports',
    description: 'Generate and manage compliance reports',
    href: '/compliance',
    icon: DocumentChartBarIcon,
    color: 'bg-pink-100 text-pink-600',
  },
  {
    name: 'Audit Logs',
    description: 'Monitor system activities and security events',
    href: '/audit',
    icon: ClockIcon,
    color: 'bg-red-100 text-red-600',
  },
]

export function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Administration Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Manage system configuration and user access.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search administration tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Admin Tools Grid */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Administration Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminActions
            .filter(action => 
              action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              action.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="block group hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
              >
                <div className="p-6">
                  <div className={`rounded-lg p-3 inline-flex ${action.color}`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
                      {action.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}