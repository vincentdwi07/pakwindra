'use client';

import "../../../styles/user.css";
import Link from 'next/link';
import React from "react";
import LoginForm from "@/app/auth/login/LoginForm";
import { getServerSession } from "next-auth"
import {authOptions} from "@/lib/auth";
import {redirect} from "next/navigation";


export default function UserLogin() {
  /*const session = await getServerSession(authOptions)

  if (session) {
    //redirect(session.user.role === 'EDUCATOR' ? '/dashboard/educator' : '/dashboard/student')
    redirect('/')
  }*/

  return (
    <>
      <div className="user-login">
        <div className="user-login-left-side">
          {/* <img style={{ zIndex: "1" }} src="user-login-decor.svg" alt="" /> */}
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
          <img className="mb-3" src="user-login-logo.svg" alt=""/>
          <h2 className="fw-bold">Welcome Back!</h2>
          <p className="mb-5" style={{fontSize: "14px"}}>Please enter your Details</p>
          <LoginForm />
          <p className="mt-4">Doesn&#39;t have account?<span><Link href="/auth/register">Sign up</Link></span></p>
        </div>
      </div>
    </>
  );
}
