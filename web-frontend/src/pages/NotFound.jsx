import { Link } from 'react-router-dom'
import { ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline'

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <ExclamationTriangleIcon className="mx-auto h-24 w-24 text-gray-400" />
        <h1 className="mt-4 text-4xl font-bold text-gray-900">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-gray-700">Page Not Found</h2>
        <p className="mt-4 text-gray-600 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <HomeIcon className="h-4 w-4 mr-2" />
            Go Home
          </Link>
          <Link
            to="/scan"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Scan QR Code
          </Link>
        </div>
      </div>
    </div>
  )
}