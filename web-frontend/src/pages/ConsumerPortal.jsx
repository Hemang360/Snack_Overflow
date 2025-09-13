import { Link } from 'react-router-dom'
import { 
  QrCodeIcon, 
  DocumentMagnifyingGlassIcon, 
  ShieldCheckIcon,
  ChartBarIcon,
  CubeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'QR Code Verification',
    description: 'Instantly verify product authenticity by scanning QR codes with your mobile device.',
    icon: QrCodeIcon,
    href: '/scan',
    color: 'green'
  },
  {
    name: 'Complete Traceability',
    description: 'View detailed product journey from farm collection to final processing.',
    icon: DocumentMagnifyingGlassIcon,
    href: '/scan',
    color: 'blue'
  },
  {
    name: 'Quality Certificates',
    description: 'Access lab test results, DNA barcoding, and quality certifications.',
    icon: ShieldCheckIcon,
    href: '/scan',
    color: 'purple'
  },
  {
    name: 'Sustainability Info',
    description: 'Learn about conservation practices and fair trade compliance.',
    icon: ChartBarIcon,
    href: '/scan',
    color: 'indigo'
  },
  {
    name: 'Blockchain Security',
    description: 'All data is secured on blockchain ensuring tamper-proof records.',
    icon: CubeIcon,
    href: '/explorer',
    color: 'orange'
  },
  {
    name: 'Farmer Stories',
    description: 'Meet the farmers and communities behind your Ayurvedic products.',
    icon: UserGroupIcon,
    href: '/scan',
    color: 'pink'
  }
]

export function ConsumerPortal() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-primary-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg
              className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>

            <div className="relative pt-6 px-4 sm:px-6 lg:px-8"></div>

            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-bold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Verify Your</span>{' '}
                  <span className="block text-primary-600 xl:inline">Ayurvedic Products</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Discover the complete journey of your Ayurvedic herbs - from sustainable harvesting 
                  to quality testing. Every product is blockchain-verified for authenticity and purity.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/scan"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                    >
                      <QrCodeIcon className="h-5 w-5 mr-2" />
                      Scan QR Code
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="#features"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1544383835-bda2bc66a55d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2021&q=80"
            alt="Ayurvedic herbs and traditional medicine"
          />
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Consumer Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to verify authenticity
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our blockchain-powered platform provides complete transparency into the 
              journey of your Ayurvedic products.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="relative">
                  <dt>
                    <div className={`absolute flex items-center justify-center h-12 w-12 rounded-md bg-${feature.color}-500 text-white`}>
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      {feature.name}
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              How It Works
            </h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple Steps to Verify Your Product
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mx-auto mb-4">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Find QR Code</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Locate the QR code on your product packaging
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mx-auto mb-4">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Scan or Enter</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Use our scanner or manually enter the code
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mx-auto mb-4">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">View Journey</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Explore the complete traceability timeline
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mx-auto mb-4">
                  <span className="text-xl font-bold">4</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Verify Quality</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Review certificates and sustainability badges
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Trust & Security
            </h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why You Can Trust Our System
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto mb-4">
                <CubeIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Blockchain Security</h3>
              <p className="mt-2 text-sm text-gray-500">
                All records are stored on immutable blockchain, preventing tampering or fraud
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mx-auto mb-4">
                <ShieldCheckIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Lab Certified</h3>
              <p className="mt-2 text-sm text-gray-500">
                Products undergo rigorous testing by accredited laboratories
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mx-auto mb-4">
                <DocumentMagnifyingGlassIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Government Compliant</h3>
              <p className="mt-2 text-sm text-gray-500">
                Fully compliant with AYUSH and NMPB regulations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            <span className="block">Ready to verify your product?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-200">
            Start by scanning the QR code on your Ayurvedic product packaging.
          </p>
          <Link
            to="/scan"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 sm:w-auto"
          >
            <QrCodeIcon className="h-5 w-5 mr-2" />
            Scan QR Code Now
          </Link>
        </div>
      </div>
    </div>
  )
}