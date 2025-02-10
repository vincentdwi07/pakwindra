'use client';

import "../user.css";
import Link from 'next/link';
import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {signIn} from "next-auth/react";


export default function UserLogin() {
  const router = useRouter()
  const [error, setError] = useState<String | null> (null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      router.push('/') // Redirect to dashboard after successful login
      router.refresh()
    } catch (error) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

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
          <form className="user-login-form" style={{width: "80%"}} onSubmit={onSubmit}>
            {error && (
              <div className="d-flex flex-column mb-3 text-danger">
                {error}
              </div>
            )}
            <div className="d-flex flex-column mb-3 ">
              <label htmlFor="email" className="pb-1">Email</label>
              <input type="text" className="email-input-user" id="email" name="email" placeholder="Input your e-mail"/>
            </div>
            <div className="d-flex w-100 flex-column mb-3">
              <div className="d-flex w-100 justify-content-between">
                <label htmlFor="">Password</label>
              </div>
              <input type="password" className="password-input-user" placeholder="Input your password" id="password" name="password"/>
            </div>

            <div className="d-flex w-100 justify-content-between">
            </div>

            <div className="d-flex mb-5 gap-1">
              <input type="checkbox"/>
              <label htmlFor="">Remember Me</label>
            </div>
            <button type="submit"
                    className="w-100 outline-0 border-0 fw-bold p-2 rounded-2 bg-dark text-light shadow">LOGIN
            </button>
          </form>
          <p className="mt-4">Doesn&#39;t have account?<span><Link href="/register">Sign up</Link></span></p>
        </div>
      </div>
    </>
  );
}
