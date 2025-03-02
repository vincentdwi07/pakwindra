'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validation/auth'
import { useRouter } from 'next/navigation'
import {mockProviders} from "next-auth/client/__tests__/helpers/mocks";
import callbackUrl = mockProviders.github.callbackUrl;

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

            const result = await signIn('credentials', {
                redirect: false,
                email: data.email,
                password: data.password,
            })


            if (result?.error) {
                setError('Invalid email or password')
                return
            }

            router.refresh()
            router.push('/') // Or your default redirect path

        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className="user-login-form" style={{width: "80%"}} onSubmit={handleSubmit(onSubmit)}>
            {error && (
                <div className="d-flex flex-column mb-3 text-danger">
                    {error}
                </div>
            )}
            <div className="d-flex flex-column mb-3 ">
                <label htmlFor="email" className="pb-1">Email</label>
                <input {...register('email')}
                    type="text" className="email-input-user" id="email" name="email" placeholder="Input your e-mail"/>
                {errors.email && (
                    <p className="mt-1 text-sm text-danger">{errors.email.message}</p>
                )}
            </div>
            <div className="d-flex w-100 flex-column mb-3">
                <div className="d-flex w-100 justify-content-between">
                    <label htmlFor="">Password</label>
                </div>
                <input {...register('password')}
                    type="password" className="password-input-user" placeholder="Input your password" id="password" name="password"/>
                {errors.password && (
                    <p className="mt-1 text-sm text-danger">{errors.password.message}</p>
                )}
            </div>

            <div className="d-flex w-100 justify-content-between">
            </div>

            <div className="d-flex mb-5 gap-1">
                <input type="checkbox"/>
                <label htmlFor="">Remember Me</label>
            </div>
            <button type="submit"
                    disabled={loading}
                    className="w-100 outline-0 border-0 fw-bold p-2 rounded-2 bg-dark text-light shadow">
                {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
        </form>
    )
}