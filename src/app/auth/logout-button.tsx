'use client'

import { signOut } from 'next-auth/react'
import { useState } from 'react'

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await signOut({
        callbackUrl: '/login',
        redirect: true
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <li>
        <button
          onClick={() => setShowConfirm(true)}
          className="dropdown-item"
          disabled={isLoading}>
          {isLoading ? 'Logging out...' : 'Logout'}
        </button>
      </li>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-semibold">Confirm Logout</h2>
            <p className="my-4">Are you sure you want to logout?</p>
            <div className="flex space-x-4">
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {isLoading ? 'Logging out...' : 'Yes, Logout'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}