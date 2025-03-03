'use client'

import { useRouter } from 'next/navigation'
import { logout } from '@/app/auth/login/action'
import {signOut} from "next-auth/react";

export default function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        await signOut({ redirect: false });
        await logout();
        router.refresh();
        router.push('/auth/login');
    };

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