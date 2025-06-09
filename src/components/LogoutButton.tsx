'use client'

import { useRouter } from 'next/navigation'
import { logout } from '@/app/auth/login/action'
import { signOut } from "next-auth/react"
import { useState } from 'react'

export default function LogoutButton() {
    const router = useRouter()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await signOut({ redirect: false })
            await logout()
            router.refresh()
            router.push('/auth/login')
        } catch (error) {
            console.error('Logout failed:', error)
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <li 
            style={{ listStyleType: "none", cursor: isLoggingOut ? "default" : "pointer" }}  
            className='d-flex justify-content-center bg-danger py-2 border-top'
            onClick={!isLoggingOut ? handleLogout : undefined}
        >
            <button
                className="bg-transparent text-white shadow-none border-0 py-2"
                style={{ outline: "none" }}
                disabled={isLoggingOut}
            >
                {isLoggingOut ? (
                    <div className="loader"></div>
                ) : (
                    <i className="bi bi-power"></i>
                )}
            </button>
        </li>
    )
}