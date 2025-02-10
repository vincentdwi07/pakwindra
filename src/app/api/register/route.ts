import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import {registerSchema} from "@/lib/validation/auth";

export async function POST(req: Request) {
    try {
        const json = await req.json()

        const result = registerSchema.safeParse(json)
        if (!result.success) {
            const { errors } = result.error
            return NextResponse.json(
                { error: "Invalid input", errors },
                { status: 400 }
            )
        }

        const { email, password, name, role } = result.data

        const exists = await db.user.findUnique({
            where: { email },
        })

        if (exists) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            )
        }

        const hashedPassword = await hash(password, 10)

        const user = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
            },
        })

        return NextResponse.json({
            user: {
                email: user.email,
                name: user.name,
                role: user.role,
            },
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}