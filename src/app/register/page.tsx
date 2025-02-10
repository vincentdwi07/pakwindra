'use client';

import "../user.css";
import Link from 'next/link';
import {useRouter} from "next/navigation";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {RegisterInput, registerSchema} from "@/lib/validation/auth";
import {zodResolver} from "@hookform/resolvers/zod";
import Image from "next/image";
  

export default function UserRegister() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterInput) {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || 'Something went wrong')
      }

      router.push('/login')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

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
          <Image className="mb-3" width={40} height={40} src="user-login-logo.svg" alt=""/>
          <h2 className="fw-bold">Create Your Account</h2>
          <p className="mb-4" style={{fontSize: "14px"}}>Please enter your Details</p>
          <form className="user-login-form" style={{width: "80%"}} onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="d-flex flex-column mb-3 text-danger">
                {error}
              </div>
            )}

            <div className="register-grid">
              <div className="d-flex flex-column mb-3">
                <label htmlFor="email" className="pb-1">Name</label>
                <input type="text" className="name-input-user" id="name" placeholder="Input your full name"
                      {...register('name')}
                      name="name"/>
                {errors.name && (
                  <p className="text-danger error-message mb-0 p-0">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="d-flex flex-column mb-3">
                <label htmlFor="role" className="pb-1">Role</label>
                <select 
                  className="role-input-user" 
                  id="role"
                  {...register('role')}
                >
                  <option value="EDUCATOR">Educator</option>
                  <option value="STUDENT">Student</option>
                </select>
                {errors.role && (
                  <p className="text-danger error-message mb-0 p-0">
                    {errors.role.message}
                  </p>
                )}
              </div>

              <div className="d-flex flex-column mb-3">
                <label htmlFor="email" className="pb-1">Email</label>
                <input type="text" className="email-input-user" id="email" placeholder="Input your e-mail"
                      {...register('email')}
                      name="email"/>
                {errors.email && (
                  <p className="text-danger error-message mb-0 p-0">
                    {errors.email.message}
                  </p>
                )}
              </div>


              <div className="d-flex flex-column mb-3">
                <label htmlFor="" className="pb-1 ">Password</label>
                <input type="password" className="password-input-user" placeholder="Input your password"
                      {...register('password')}
                      id="password" name="password"/>
                {errors.password && (
                  <p className="text-danger error-message mb-0 p-0">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <button type="submit"
                    disabled={loading}
                    className="w-100 outline-0 border-0 p-2 mt-3 d-flex justify-content-center align-items-center rounded-2 bg-dark text-light fw-bold shadow">
                                {loading ? (
              <div className="loading-bar"></div>
            ) : 'Register'}
            </button>

          </form>
          <p className="mt-4">Already have account?<span><Link href="/login">Login</Link></span></p>
        </div>
      </div>
    </>
  );
}
