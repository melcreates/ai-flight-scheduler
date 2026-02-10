import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InstructorDashboard from './pages/InstructorDashboard';
import InstructorAvailabilities from './pages/InstructorAvailabilities';
import AvailabilityRequests from './pages/AvailabilityRequests';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { AuthProvider } from './context/AuthContext';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={
              <div>
                <div>
                  <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                  </a>
                  <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                  </a>
                </div>
                <h1>Vite + React</h1>
                <div className="card">
                  <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                  </button>
                  <p>
                    Edit <code>src/App.jsx</code> and save to test HMR
                  </p>
                </div>
                <p className="read-the-docs">
                  Click on the Vite and React logos to learn more
                </p>
              </div>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/instructor" element={<InstructorDashboard />} />
            <Route path="/availability"
              element={
                <ProtectedRoute>
                  <AvailabilityRequests />
                </ProtectedRoute>} />
            <Route path="/instructor/availability"
              element={
                <ProtectedRoute>
                  <InstructorAvailabilities />
                </ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>

    </>
  )
}

export default App
