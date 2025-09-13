import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { TestPage } from './TestPage'

export function MinimalApp() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </div>
  )
}