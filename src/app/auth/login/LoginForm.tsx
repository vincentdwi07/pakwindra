'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validation/auth'
import { useRouter } from 'next/navigation'
import "@/styles/user.css";
// Remove mockProviders import as it's for testing

export default function LoginForm() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    })

    const onSubmit = async (data: LoginInput) => {
        try {
            setLoading(true)
            setError(null)

            console.log('Login attempt started...')

            const result = await signIn('credentials', {
                redirect: false,
                email: data.email,
                password: data.password,
            })

            console.log('Sign in result:', result)

            if (result?.error) {
                setError('Invalid email or password')
                return
            }

            // Get fresh session to check role
            const response = await fetch('/api/auth/session')
            const session = await response.json()

            console.log('Session after login:', session)

            // Role-based redirect
            if (session?.user?.role === 'EDUCATOR') {
                console.log('Redirecting to educator dashboard...')
                router.push('/mentor/dashboard')
            } else {
                console.log('Redirecting to home...')
                router.push('/')
            }

        } catch (err) {
            console.error('Login error:', err)
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form 
            className="user-login-form" 
            style={{width: "80%"}} 
            onSubmit={handleSubmit(onSubmit)}
        >
            {error && (
                <div className="d-flex flex-column mb-3 text-danger">
                    {error}
                </div>
            )}
            <div className="d-flex flex-column mb-3 ">
                <label htmlFor="email" className="pb-1">Email</label>
                <input 
                    {...register('email')}
                    type="text" 
                    className="email-input-user text-black bg-transparent" 
                    id="email" 
                    placeholder="Input your e-mail"
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-danger">
                        {errors.email.message}
                    </p>
                )}
            </div>
            <div className="d-flex w-100 flex-column mb-3">
                <div className="d-flex w-100 justify-content-between">
                    <label htmlFor="password">Password</label>
                </div>
                <input 
                    {...register('password')}
                    type="password" 
                    className="password-input-user text-black" 
                    placeholder="Input your password" 
                    id="password"
                />
                {errors.password && (
                    <p className="mt-1 text-sm text-danger">
                        {errors.password.message}
                    </p>
                )}
            </div>

            {/* <div className="d-flex mb-5 gap-1">
                <input 
                    type="checkbox" 
                    id="remember-me"
                    className='remember-me-check'
                />
                <label htmlFor="remember-me">Remember Me</label>
            </div> */}

            <button 
                type="submit"
                disabled={loading}
                className="w-100 outline-0 border-0 fw-bold p-2 rounded-2 bg-dark text-light shadow"
            >
                {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
        </form>
    )
}