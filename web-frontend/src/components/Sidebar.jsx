import { Link, useLocation } from 'react-router-dom'
import { useAuthStore, useAppStore } from '../stores'
import { 
  HomeIcon,
  QrCodeIcon,
  ChartBarIcon,
  CubeIcon,
  ShieldCheckIcon,
  UsersIcon,
  DocumentChartBarIcon,
  CogIcon,
  XMarkIcon,
  MapIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/stakeholder', 
    icon: HomeIcon,
    roles: ['FARMER', 'MANUFACTURER', 'PROCESSOR', 'LAB_MANAGER', 'LAB_TECHNICIAN']
  },
  { 
    name: 'QR Scanner', 
    href: '/scan', 
    icon: QrCodeIcon,
    roles: ['*'] // Available to all
  },
  { 
    name: 'Analytics Dashboard', 
    href: '/analytics', 
    icon: ChartBarIcon,
    roles: ['FARMER', 'MANUFACTURER', 'PROCESSOR', 'LAB_MANAGER', 'LAB_TECHNICIAN', 'REGULATOR', 'AUDITOR', 'SUPER_ADMIN']
  },
  { 
    name: 'Geo Analytics', 
    href: '/geo-analytics', 
    icon: MapIcon,
    roles: ['FARMER', 'MANUFACTURER', 'PROCESSOR', 'LAB_MANAGER', 'LAB_TECHNICIAN', 'REGULATOR', 'AUDITOR', 'SUPER_ADMIN']
  },
  { 
    name: 'Compliance Reports', 
    href: '/compliance', 
    icon: DocumentChartBarIcon,
    roles: ['REGULATOR', 'AUDITOR', 'SUPER_ADMIN']
  },
  { 
    name: 'Audit Logs', 
    href: '/audit', 
    icon: ClockIcon,
    roles: ['REGULATOR', 'AUDITOR', 'SUPER_ADMIN']
  },
  { 
    name: 'Regulator Dashboard', 
    href: '/regulator', 
    icon: ShieldCheckIcon,
    roles: ['REGULATOR', 'SUPER_ADMIN']
  },
  { 
    name: 'Blockchain Explorer', 
    href: '/explorer', 
    icon: CubeIcon,
    roles: ['REGULATOR', 'AUDITOR', 'SUPER_ADMIN']
  },
  { 
    name: 'User Management', 
    href: '/admin', 
    icon: UsersIcon,
    roles: ['SUPER_ADMIN']
  },
]

export function Sidebar({ isOpen }) {
  const location = useLocation()
  const { user } = useAuthStore()
  const { setSidebarOpen } = useAppStore()
  
  const userRole = user?.role?.id || user?.role
  
  const filteredNavigation = navigation.filter(item => {
    if (item.roles.includes('*')) return true
    return item.roles.includes(userRole)
  })
  
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <span className="text-lg font-semibold text-gray-900">Menu</span>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href ||
                          (item.href !== '/' && location.pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-md
                ${isActive
                  ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <item.icon
                className={`
                  mr-3 h-5 w-5
                  ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}
                `}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      {/* User Info */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.fullName?.[0] || user?.username?.[0] || 'U'}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">
              {user?.fullName || user?.username}
            </p>
            <p className="text-xs text-gray-500">
              {user?.role?.name || user?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
  
  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>
          
          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white">
                  <SidebarContent />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white">
          <SidebarContent />
        </div>
      </div>
    </>
  )
}