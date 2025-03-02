'use client';

import "../../../styles/user.css";
import Link from 'next/link';
import {redirect} from "next/navigation";
import React from "react";
import Image from "next/image";
import RegisterForm from "@/app/auth/register/RegisterForm";
  

export default function UserRegister() {

  return (

    <>
      <div className="user-login">
        <div className="user-register-left-side">
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
        <div className="user-register-right-side">
          <Image className="mb-3" width={40} height={40} src="../user-login-logo.svg" alt=""/>
          <h2 className="fw-bold">Create Your Account</h2>
          <p className="mb-4" style={{fontSize: "14px"}}>Please enter your Details</p>
          <RegisterForm />
          <p className="mt-4">Already have account?<span><Link href="/auth/login">Login</Link></span></p>
        </div>
      </div>
    </>
  );
}
