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
    // Get the user session
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/login')
    }

    // Get user details
    const user = await db.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        redirect('/login')
    }

    // Safely parse the examId
    const { examId } = await params
    if (isNaN(examId)) {
        redirect('/')
    }
    // Get exam details
    const exam = await getExamById(parseInt(examId), user.id, user.role)

    console.log(exam)
    /*if (!exam) {
        redirect('/')
    }*/

    return (
        <div className="exam-detail">
            <UserNavbar/>
            <div className="exam-detail-content">
                <div className="nav-exam-detail-content">
                    <li className="nax-exam-detail-back">
                        <Link  className="text-black" href="/">Home</Link>
                    </li>
                    <li>/</li>
                    <li>{exam.title}</li>
                    {/*{exam.description && (
                        <p className="text-muted">{exam.description}</p>
                    )}*/}
                </div>
                <Quiz exam={exam} userId={user.id} />
            </div>
        </div>
    )
}