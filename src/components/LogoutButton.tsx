'use client'

import { useRouter } from 'next/navigation'
import { logout } from '@/app/auth/login/action'
import {signOut} from "next-auth/react";

export default function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        const isLoggedOut = await signOut();
        let result = await logout();
        if (isLoggedOut) {
            router.refresh()
            router.push('/auth/login')
        }
        /*if (result.success) {
            router.refresh()
            router.push('/auth/login')
        }else {
            throw new Error("Invalid credentials")
        }*/
    }

    return (
        <li>
            <button
                type={ 'button'}
                className="dropdown-item"
                onClick={handleLogout}>
                Sign out
            </button>
        </li>
    )
}