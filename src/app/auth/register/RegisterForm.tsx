'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/lib/validation/auth'
import { useRouter } from 'next/navigation'
import {register as registerUser } from "@/app/auth/register/actions";

export default function RegisterForm() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            name: '',
            password: '',
            role: 'STUDENT',
        }
    })

    const onSubmit = async (data: RegisterInput) => {
        try {
            setLoading(true)
            setError(null)

            const result = await registerUser(data)

            if (result.error) {
                setError(result.error)
                return
            }

            // Refresh the current route and fetch new data from the server
            router.refresh()

            // Redirect based on user role
            if (result.user?.role === 'EDUCATOR') {
                router.push('/dashboard/educator')
            } else {
                router.push('/dashboard/student')
            }
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
    )
}