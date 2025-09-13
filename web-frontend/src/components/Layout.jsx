import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Navigation } from './Navigation'
import { Sidebar } from './Sidebar'
import { useAppStore } from '../stores'

export function Layout({ children }) {
  const location = useLocation()
  const { sidebarOpen } = useAppStore()
  
  // Hide sidebar on public pages
  const isPublicPage = ['/', '/scan', '/login'].includes(location.pathname) || 
                      location.pathname.startsWith('/product/')
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex">
        {!isPublicPage && (
          <Sidebar isOpen={sidebarOpen} />
        )}
        
        <main className={`flex-1 ${!isPublicPage ? 'lg:ml-64' : ''}`}>
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}