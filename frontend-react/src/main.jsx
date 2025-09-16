import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          style: {
            background: '#4CAF50',
            color: '#fff',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#f87171',
            color: '#fff',
          },
        },
      }}
    />
  </React.StrictMode>,
)
