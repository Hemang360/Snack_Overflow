import { Link } from 'react-router-dom'
import { 
  QrCodeIcon, 
  ShieldCheckIcon, 
  GlobeAltIcon, 
  ChartBarIcon,
  CubeIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'QR Code Verification',
    description: 'Scan any product QR code to see complete traceability from farm to shelf.',
    icon: QrCodeIcon,
    href: '/scan'
  },
  {
    name: 'Blockchain Security',
    description: 'Immutable records ensure authenticity and prevent counterfeiting.',
    icon: CubeIcon,
    href: '/explorer'
  },
  {
    name: 'Quality Assurance',
    description: 'Lab-verified quality tests including DNA barcoding and purity checks.',
    icon: ShieldCheckIcon,
    href: '/consumer'
  },
  {
    name: 'Sustainability Tracking',
    description: 'Monitor conservation compliance and fair-trade practices.',
    icon: GlobeAltIcon,
    href: '/consumer'
  },
  {
    name: 'Real-time Analytics',
    description: 'Live dashboard for supply chain stakeholders and regulators.',
    icon: ChartBarIcon,
    href: '/regulator'
  },
  {
    name: 'Certified Compliance',
    description: 'AYUSH and NMPB compliant reporting and documentation.',
    icon: CheckBadgeIcon,
    href: '/regulator'
  },
]

const stats = [
  { name: 'Herbs Tracked', value: '1,200+' },
  { name: 'Quality Tests', value: '5,800+' },
  { name: 'Farmers Connected', value: '450+' },
  { name: 'Compliance Rate', value: '99.2%' },
]

export function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-primary-100/20">
        <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
                <div className="mt-24 sm:mt-32 lg:mt-16">
                  <span className="rounded-full bg-primary-600/10 px-3 py-1 text-sm font-semibold leading-6 text-primary-600 ring-1 ring-inset ring-primary-600/10">
                    Blockchain Powered
                  </span>
                </div>
                <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Ayurvedic Herbs Traceability System
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Ensuring authenticity, quality, and sustainability of Ayurvedic herbs through 
                  blockchain technology. From farm to consumer, every step is verified and traceable.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    to="/scan"
                    className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    Scan QR Code
                  </Link>
                  <Link
                    to="/consumer"
                    className="text-sm font-semibold leading-6 text-gray-900"
                  >
                    Learn more <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-20 sm:mt-24 md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 lg:w-screen">
            <div className="absolute inset-y-0 right-1/2 -z-10 -mr-10 w-[200%] skew-x-[-30deg] bg-white shadow-xl shadow-primary-600/10 ring-1 ring-primary-50 md:-mr-20 lg:-mr-36" />
            <div className="shadow-lg md:rounded-3xl">
              <div className="bg-primary-500 [clip-path:inset(0)] md:[clip-path:inset(0_round_theme(borderRadius.3xl))]">
                <div className="absolute -inset-y-px left-1/2 -z-10 ml-10 w-[200%] skew-x-[-30deg] bg-primary-100 opacity-20 ring-1 ring-inset ring-white md:ml-20 lg:ml-36" />
                <div className="relative px-6 pt-8 sm:pt-16 md:pl-16 md:pr-0">
                  <div className="mx-auto max-w-2xl md:mx-0 md:max-w-none">
                    <div className="w-screen overflow-hidden rounded-tl-xl bg-gray-900">
                      <div className="flex bg-gray-800/40 ring-1 ring-white/5">
                        <div className="-mb-px flex text-sm font-medium leading-6 text-gray-400">
                          <div className="border-b border-r border-b-white/20 border-r-white/10 bg-white/5 py-2 px-4 text-white">
                            QR Scanner
                          </div>
                          <div className="border-r border-gray-600/10 py-2 px-4">
                            Traceability
                          </div>
                        </div>
                      </div>
                      <div className="px-6 pb-14 pt-6">
                        <div className="text-center">
                          <QrCodeIcon className="mx-auto h-16 w-16 text-primary-400" />
                          <p className="mt-4 text-sm text-gray-300">
                            Scan product QR codes for instant verification
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.name} className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt className="text-base leading-7 text-gray-600">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      
      {/* Features section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">
              Complete Traceability
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to verify authenticity
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our blockchain-based system provides end-to-end traceability for Ayurvedic herbs,
              ensuring quality, authenticity, and sustainability at every step.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <feature.icon className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                    <p className="mt-6">
                      <Link
                        to={feature.href}
                        className="text-sm font-semibold leading-6 text-primary-600 hover:text-primary-500"
                      >
                        Learn more <span aria-hidden="true">→</span>
                      </Link>
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      
      {/* CTA section */}
      <div className="bg-primary-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Start verifying products today
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-200">
              Join thousands of consumers, farmers, and businesses who trust our 
              blockchain-verified Ayurvedic herb traceability system.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/scan"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Scan QR Code
              </Link>
              <Link
                to="/login"
                className="text-sm font-semibold leading-6 text-white"
              >
                Access Dashboard <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}