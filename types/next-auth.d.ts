import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "EDUCATOR" | "STUDENT"
    } & DefaultSession["user"]
  }

  interface User {
    role: "EDUCATOR" | "STUDENT"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "EDUCATOR" | "STUDENT"
  }
}