import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export function RecallAlert({ recall }) {
  const [isVisible, setIsVisible] = useState(true)
  
  if (!isVisible || !recall) return null
  
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Product Recall Notice
          </h3>
          <p className="mt-1 text-sm text-red-700">
            This product has been recalled. Reason: {recall.reason}
          </p>
          <div className="mt-2">
            <div className="text-sm">
              <p className="text-red-600">
                <strong>What to do:</strong> Stop using this product immediately and contact the manufacturer 
                or return to place of purchase. Do not consume or use this product.
              </p>
            </div>
          </div>
          {recall.createdAt && (
            <p className="mt-2 text-xs text-red-600">
              Recall issued: {new Date(recall.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}