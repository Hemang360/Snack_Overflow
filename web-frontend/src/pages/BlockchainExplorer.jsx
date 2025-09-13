import { Link } from 'react-router-dom'
import { 
  CubeIcon,
  ClockIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

export function BlockchainExplorer() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blockchain Explorer</h1>
        <p className="mt-2 text-gray-600">
          Explore blockchain transactions and verify the integrity of supply chain records
        </p>
      </div>
      
      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search by batch ID, transaction hash, or block number..."
              />
            </div>
          </div>
          <button className="btn-primary">
            Search
          </button>
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <ExplorerCard
          title="Recent Transactions"
          description="View the latest blockchain transactions"
          icon={ClockIcon}
          color="blue"
        />
        
        <ExplorerCard
          title="Block Explorer"
          description="Browse blocks and their transactions"
          icon={CubeIcon}
          color="green"
        />
        
        <ExplorerCard
          title="Transaction Details"
          description="Deep dive into transaction details"
          icon={DocumentTextIcon}
          color="purple"
        />
      </div>
      
      {/* Coming Soon */}
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <CubeIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Blockchain Explorer Coming Soon
        </h2>
        <p className="text-gray-600 mb-6">
          We're building a comprehensive blockchain explorer to provide full transparency 
          into all supply chain transactions.
        </p>
        <Link to="/scan" className="btn-primary">
          Try Product Scanner Instead
        </Link>
      </div>
    </div>
  )
}

function ExplorerCard({ title, description, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}