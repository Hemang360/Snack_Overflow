import { useState, useEffect } from 'react'

export function TestPage() {
  const [message, setMessage] = useState('Hello World!')
  
  useEffect(() => {
    console.log('Test page loaded successfully')
  }, [])
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Page</h1>
        <p className="text-lg text-gray-600 mb-6">{message}</p>
        <button 
          onClick={() => setMessage('React is working correctly!')}
          className="btn-primary"
        >
          Click Me
        </button>
      </div>
    </div>
  )
}