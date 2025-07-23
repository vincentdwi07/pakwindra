import { getExamById } from '@/lib/actions/exams'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import Quiz from "@/components/Quiz"
import UserNavbar from "@/components/UserNavbar"
import Link from "next/link"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ExamDetail({ params }) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/login')
    }

    const user = await db.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        redirect('/login')
    }

    const examId = params.examId

    if (isNaN(examId)) {
        redirect('/')
    }

    const exam = await getExamById(parseInt(examId), user.user_id, user.role)
    
    if (!exam) {
        redirect('/')
    }

    // Add timestamp untuk force re-render
    const timestamp = Date.now()

    return (
        <div className="exam-detail">
            <UserNavbar/>
            <div className="exam-detail-content">
                <div className="nav-exam-detail-content">
                    <li className="nax-exam-detail-back">
                        <Link className="text-black" href="/">Home</Link>
                    </li>
                    <li>/</li>
                    <li>{exam.title}</li>
                </div>
                <Quiz 
                    exam={exam} 
                    userId={user.user_id}
                    key={timestamp}
                    // minScore={exam.minScore}
                />
            </div>
        </div>
    )
}