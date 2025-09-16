import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores'
import { LoadingSpinner } from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading } = useAuthStore()
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  
  const from = location.state?.from?.pathname || new URLSearchParams(location.search).get('returnUrl') || '/stakeholder'
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const result = await login(formData)
    
    if (result.success) {
      toast.success('Login successful!')
      navigate(from, { replace: true })
    } else {
      toast.error(result.error || 'Login failed')
    }
  }
  
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }
  
  // Demo credentials for quick testing
  const fillDemoCredentials = () => {
    setFormData({
      username: 'demo',
      password: 'demo123'
    })
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🌿</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to AyurTrace
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your traceability dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Access</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Quick Demo Login
              </h3>
              <p className="text-xs text-blue-700 mb-3">
                Use these credentials to explore the system with full admin access:
              </p>
              <div className="space-y-1 text-xs text-blue-800">
                <div><strong>Username:</strong> demo</div>
                <div><strong>Password:</strong> demo123</div>
              </div>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="mt-3 w-full text-xs bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition-colors"
              >
                Fill Demo Credentials
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-4 text-center space-y-2">
              <Link
                to="/scan"
                className="block text-sm text-primary-600 hover:text-primary-500"
              >
                Scan Product QR Code (No Login Required)
              </Link>
              <Link
                to="/"
                className="block text-sm text-gray-600 hover:text-gray-500"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Available Roles Info */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Available User Roles
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Super Admin</span>
                <span className="badge badge-info">Full Access</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Regulator</span>
                <span className="badge badge-success">Compliance</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lab Manager</span>
                <span className="badge badge-info">Quality Tests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Manufacturer</span>
                <span className="badge badge-warning">Production</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Farmer</span>
                <span className="badge badge-success">Collection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}