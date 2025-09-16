import { useState, useEffect, Fragment } from 'react'
import toast from 'react-hot-toast'
import { Menu, Transition } from '@headlessui/react'
import { 
  ShieldCheckIcon, 
  BeakerIcon, 
  SparklesIcon, 
  BuildingOfficeIcon,
  QrCodeIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

function App() {
  const [currentSection, setCurrentSection] = useState('welcome')
  const [currentRole, setCurrentRole] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [currentToken, setCurrentToken] = useState(null)
  const [apiHealthy, setApiHealthy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifications] = useState([])

  const apiBase = 'http://localhost:5000'

  useEffect(() => {
    checkHealth()
  }, [])

  const checkHealth = async () => {
    try {
      const response = await fetch(`${apiBase}/health`)
      const data = await response.json()
      if (data.ok || data.status === 'healthy') {
        setApiHealthy(true)
        toast.success('API is healthy and running!')
      }
    } catch (error) {
      setApiHealthy(false)
      toast.error('API is not responding. Please check if the server is running.')
    }
  }

  const selectRole = (role) => {
    setCurrentRole(role)
    setCurrentSection('login')
  }

  const showRegister = () => {
    setCurrentSection('register')
  }

  const showLogin = () => {
    setCurrentSection('login')
  }

  const showQRScanner = () => {
    setCurrentSection('qrScanner')
  }

  const showDashboard = () => {
    setCurrentSection('dashboard')
  }

  const logout = () => {
    setCurrentUser(null)
    setCurrentToken(null)
    setCurrentRole(null)
    setCurrentSection('welcome')
    toast.success('Logged out successfully')
  }

  const login = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.target)
    const username = formData.get('username')
    const password = formData.get('password')

    try {
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        setCurrentUser(data.user)
        setCurrentToken(data.token)
        toast.success(`Welcome ${data.user?.fullName || username}!`)
        showDashboard()
      } else {
        toast.error(data.error || 'Login failed')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const register = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.target)
    const userData = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      fullName: formData.get('fullName'),
      organizationType: currentRole,
    }

    try {
      const response = await fetch(`${apiBase}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (data.success) {
        setCurrentUser(data.user || { username: userData.username, role: currentRole })
        setCurrentToken(data.token)
        toast.success('Registration successful!')
        showDashboard()
      } else {
        toast.error(data.error || 'Registration failed')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const createCollection = async (e) => {
    e.preventDefault()
    if (!currentToken) {
      toast.error('Please login first')
      return
    }

    setLoading(true)
    const formData = new FormData(e.target)
    const collectionData = {
      species: formData.get('species'),
      collectorId: currentUser?.username || 'unknown',
      gpsCoordinates: {
        latitude: parseFloat(formData.get('latitude')),
        longitude: parseFloat(formData.get('longitude')),
      },
      quantity: parseFloat(formData.get('quantity')),
      qualityNotes: formData.get('qualityNotes'),
    }

    try {
      const response = await fetch(`${apiBase}/api/protected/collection-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
        body: JSON.stringify(collectionData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Collection event created successfully!')
        e.target.reset()
      } else {
        toast.error(data.error || 'Failed to create collection event')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const createQualityTest = async (e) => {
    e.preventDefault()
    if (!currentToken) {
      toast.error('Please login first')
      return
    }

    setLoading(true)
    const formData = new FormData(e.target)
    const testData = {
      batchId: formData.get('batchId'),
      labId: currentUser?.username || 'unknown',
      testDate: new Date().toISOString(),
      moisture: parseFloat(formData.get('moisture')),
      dnaBarcode: formData.get('dnaBarcode'),
      pesticides: formData.get('pesticides'),
      heavyMetals: formData.get('heavyMetals'),
      microbiological: formData.get('microbiological'),
      notes: formData.get('notes'),
    }

    try {
      const response = await fetch(`${apiBase}/api/protected/quality-tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
        body: JSON.stringify(testData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Quality test created successfully!')
        e.target.reset()
      } else {
        toast.error(data.error || 'Failed to create quality test')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const createProductBatch = async (e) => {
    e.preventDefault()
    if (!currentToken) {
      toast.error('Please login first')
      return
    }

    setLoading(true)
    const formData = new FormData(e.target)
    const batchData = {
      productName: formData.get('productName'),
      species: formData.get('species'),
      quantity: parseFloat(formData.get('quantity')),
      manufacturerId: currentUser?.username || 'unknown',
      sourceCollectionEvents: [formData.get('sourceEvents')],
      estimatedShelfLife: formData.get('shelfLife'),
      batchNotes: formData.get('batchNotes'),
    }

    try {
      const response = await fetch(`${apiBase}/api/protected/product-batches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
        body: JSON.stringify(batchData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Product batch created successfully!')
        e.target.reset()
      } else {
        toast.error(data.error || 'Failed to create product batch')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const verifyQR = async () => {
    const qrCode = document.getElementById('qrCodeInput').value
    if (!qrCode) {
      toast.error('Please enter a QR code')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${apiBase}/api/public/qr/${qrCode}`)
      const data = await response.json()

      if (data.success) {
        toast.success('QR code verified successfully!')
        // Display the verification results
        console.log('Verification result:', data)
      } else {
        toast.error(data.error || 'QR code verification failed')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          document.getElementById('latitude').value = position.coords.latitude.toFixed(6)
          document.getElementById('longitude').value = position.coords.longitude.toFixed(6)
          toast.success('Location captured!')
        },
        (error) => {
          toast.error('Unable to get location: ' + error.message)
        }
      )
    } else {
      toast.error('Geolocation is not supported by this browser.')
    }
  }

  const roles = [
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Full system access',
      icon: ShieldCheckIcon,
      color: 'text-yellow-500',
    },
    {
      id: 'collector',
      title: 'Collector',
      description: 'Record herb collection',
      icon: SparklesIcon,
      color: 'text-green-500',
    },
    {
      id: 'lab',
      title: 'Laboratory',
      description: 'Quality testing',
      icon: BeakerIcon,
      color: 'text-blue-500',
    },
    {
      id: 'manufacturer',
      title: 'Manufacturer',
      description: 'Product creation',
      icon: BuildingOfficeIcon,
      color: 'text-purple-500',
    },
  ]

  const isPublicPage = ['welcome', 'qrScanner'].includes(currentSection)

  // Navigation Component
  const Navigation = () => (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={() => setCurrentSection('welcome')}
              className="flex items-center"
            >
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🌿</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">
                  AyurTrace
                </span>
              </div>
            </button>
          </div>
          
          {/* Center - Public Navigation */}
          {isPublicPage && (
            <div className="hidden md:flex space-x-8">
              <button 
                onClick={showQRScanner}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Scan Product
              </button>
            </div>
          )}
          
          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* API Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${apiHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-500">
                API {apiHealthy ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Notifications */}
            {currentUser && (
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full">
                  <BellIcon className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>
            )}
            
            {/* User Menu */}
            {currentUser ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 text-sm rounded-full bg-white text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <span className="hidden md:block">{currentUser?.fullName || currentUser?.username}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </Menu.Button>
                
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={showDashboard}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                          >
                            Dashboard
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                          >
                            <ArrowRightOnRectangleIcon className="inline h-4 w-4 mr-2" />
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentSection('welcome')}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign in
                </button>
                <button
                  onClick={showQRScanner}
                  className="btn-primary"
                >
                  Scan QR Code
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )

  // Welcome Section
  const WelcomeSection = () => (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-ayurvedic-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-primary-600 to-ayurvedic-600 rounded-full flex items-center justify-center mb-8">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-primary-600 to-ayurvedic-600 bg-clip-text text-transparent">
              AyurTrace
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Blockchain-powered traceability for Ayurvedic herbs. From farm to pharmacy, every step verified and transparent.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {roles.map((role) => {
              const IconComponent = role.icon
              return (
                <div
                  key={role.id}
                  onClick={() => selectRole(role.id)}
                  className="card role-card hover:shadow-lg cursor-pointer"
                >
                  <div className="text-center">
                    <IconComponent className={`h-12 w-12 mx-auto mb-4 ${role.color}`} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{role.title}</h3>
                    <p className="text-gray-600">{role.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-center space-x-4">
            <button onClick={showQRScanner} className="btn-primary">
              <QrCodeIcon className="h-5 w-5 mr-2 inline" />
              Scan QR Code
            </button>
            <button onClick={showRegister} className="btn-secondary">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Login Section
  const LoginSection = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">🌿</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in as {currentRole}
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <form onSubmit={login} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input-field mt-1"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field mt-1"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={showRegister}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Don't have an account? Register here
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Register Section
  const RegisterSection = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">🌿</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Register as {currentRole}
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <form onSubmit={register} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="input-field mt-1"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input-field mt-1"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field mt-1"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field mt-1"
                placeholder="Choose a password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={showLogin}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Already have an account? Sign in here
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Dashboard Section
  const DashboardSection = () => {
    const getDashboardContent = () => {
      switch (currentRole) {
        case 'admin':
          return (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Admin Dashboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                  <div className="flex items-center">
                    <UserIcon className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">156</p>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="flex items-center">
                    <SparklesIcon className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Collection Events</p>
                      <p className="text-2xl font-bold text-gray-900">89</p>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="flex items-center">
                    <BeakerIcon className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Quality Tests</p>
                      <p className="text-2xl font-bold text-gray-900">45</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )

        case 'collector':
          return (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Collector Dashboard</h3>
              <div className="card">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Create Collection Event</h4>
                <form onSubmit={createCollection} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Species</label>
                    <input
                      name="species"
                      type="text"
                      required
                      className="input-field mt-1"
                      placeholder="e.g., Ashwagandha, Turmeric"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Latitude</label>
                      <input
                        id="latitude"
                        name="latitude"
                        type="number"
                        step="any"
                        required
                        className="input-field mt-1"
                        placeholder="0.000000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Longitude</label>
                      <input
                        id="longitude"
                        name="longitude"
                        type="number"
                        step="any"
                        required
                        className="input-field mt-1"
                        placeholder="0.000000"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="btn-secondary"
                  >
                    <MapPinIcon className="h-4 w-4 mr-2 inline" />
                    Get Current Location
                  </button>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity (kg)</label>
                    <input
                      name="quantity"
                      type="number"
                      step="0.01"
                      required
                      className="input-field mt-1"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quality Notes</label>
                    <textarea
                      name="qualityNotes"
                      rows={3}
                      className="input-field mt-1"
                      placeholder="Add any quality observations..."
                    />
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Creating...' : 'Create Collection Event'}
                  </button>
                </form>
              </div>
            </div>
          )

        case 'lab':
          return (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Laboratory Dashboard</h3>
              <div className="card">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Create Quality Test</h4>
                <form onSubmit={createQualityTest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Batch ID</label>
                    <input
                      name="batchId"
                      type="text"
                      required
                      className="input-field mt-1"
                      placeholder="Enter batch ID to test"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Moisture (%)</label>
                      <input
                        name="moisture"
                        type="number"
                        step="0.01"
                        required
                        className="input-field mt-1"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">DNA Barcode</label>
                      <input
                        name="dnaBarcode"
                        type="text"
                        required
                        className="input-field mt-1"
                        placeholder="DNA sequence"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pesticides</label>
                    <input
                      name="pesticides"
                      type="text"
                      className="input-field mt-1"
                      placeholder="Not Detected / Detected levels"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Heavy Metals</label>
                    <input
                      name="heavyMetals"
                      type="text"
                      className="input-field mt-1"
                      placeholder="Within limits / Exceeded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Microbiological</label>
                    <input
                      name="microbiological"
                      type="text"
                      className="input-field mt-1"
                      placeholder="Pass / Fail"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Test Notes</label>
                    <textarea
                      name="notes"
                      rows={3}
                      className="input-field mt-1"
                      placeholder="Additional test observations..."
                    />
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Creating...' : 'Create Quality Test'}
                  </button>
                </form>
              </div>
            </div>
          )

        case 'manufacturer':
          return (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Manufacturer Dashboard</h3>
              <div className="card">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Create Product Batch</h4>
                <form onSubmit={createProductBatch} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                    <input
                      name="productName"
                      type="text"
                      required
                      className="input-field mt-1"
                      placeholder="e.g., Ashwagandha Tablets"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Species</label>
                    <input
                      name="species"
                      type="text"
                      required
                      className="input-field mt-1"
                      placeholder="Main herb species"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      name="quantity"
                      type="number"
                      step="0.01"
                      required
                      className="input-field mt-1"
                      placeholder="Final product quantity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Source Collection Events</label>
                    <input
                      name="sourceEvents"
                      type="text"
                      required
                      className="input-field mt-1"
                      placeholder="Collection event IDs (comma separated)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estimated Shelf Life</label>
                    <input
                      name="shelfLife"
                      type="text"
                      required
                      className="input-field mt-1"
                      placeholder="e.g., 24 months"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Batch Notes</label>
                    <textarea
                      name="batchNotes"
                      rows={3}
                      className="input-field mt-1"
                      placeholder="Manufacturing notes..."
                    />
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Creating...' : 'Create Product Batch'}
                  </button>
                </form>
              </div>
            </div>
          )

        default:
          return <div className="text-center py-8">Please select a role to continue.</div>
      }
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome, {currentUser?.fullName || currentUser?.username}
            </h2>
            <p className="text-gray-600">Role: {currentRole}</p>
          </div>
          {getDashboardContent()}
        </div>
      </div>
    )
  }

  // QR Scanner Section
  const QRScannerSection = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <QrCodeIcon className="h-16 w-16 mx-auto text-primary-600 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">QR Code Verification</h2>
          <p className="text-gray-600 mt-2">Enter a QR code to verify product authenticity</p>
        </div>

        <div className="card max-w-md mx-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">QR Code</label>
              <input
                id="qrCodeInput"
                type="text"
                className="input-field mt-1"
                placeholder="Enter QR code or scan"
              />
            </div>

            <button
              onClick={verifyQR}
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? 'Verifying...' : 'Verify QR Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {currentSection === 'welcome' && <WelcomeSection />}
      {currentSection === 'login' && <LoginSection />}
      {currentSection === 'register' && <RegisterSection />}
      {currentSection === 'dashboard' && <DashboardSection />}
      {currentSection === 'qrScanner' && <QRScannerSection />}
    </div>
  )
}

export default App