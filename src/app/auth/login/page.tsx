import "../../../styles/user.css";
import Link from 'next/link';
import React from "react";
import LoginForm from "@/app/auth/login/LoginForm";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth";

// Remove 'use client' since we'll handle client components in LoginForm
export default async function UserLogin() {
    // Check session server-side
    const session = await getServerSession(authOptions)

    if (session) {
        // Redirect based on role
        redirect(session.user.role === 'EDUCATOR' ? '/mentor/dashboard' : '/')
    }

    return (
        <div className="user-login">
            <div className="user-login-left-side">
                <h1 style={{fontSize: "3rem"}}>CODE MENTOR</h1>
                <div className="box">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
            <div className="user-login-right-side">
                <img className="mb-3" src="https://i.imgur.com/7GDicHy.png" alt=""/>
                <h2 className="fw-bold">Welcome Back!</h2>
                <p className="mb-5" style={{fontSize: "14px"}}>Please enter your Details</p>
                <LoginForm />
                <p className="mt-4">
                    Doesn&#39;t have account?
                    <span>
                        <Link href="/auth/register">Sign up</Link>
                    </span>
                </p>
            </div>
        </div>
    );
}