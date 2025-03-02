export type UserRole = "EDUCATOR" | "STUDENT"

export interface AuthUser {
    id: string
    email: string
    name: string | null
    role: UserRole
}

export interface SessionUser extends AuthUser {
    id: string
    role: UserRole
}