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
        <li 
            style={{ listStyleType: "none", cursor:"pointer" }}  
            className='d-flex justify-content-center bg-danger py-2 border-top'
            onClick={handleLogout}
        >
            <button
                className=" bg-transparent text-white  shadow-none border-0 py-2"
                style={{ outline: "none" }}
            >
                <i className="bi bi-power"></i>
            </button>
        </li>
    )
}