import "@/styles/user.css";
import MentorNavbar from "@/components/Mentor/MentorNavbar";
import MentorStudentList from "@/components/Mentor/MentorStudentList"
import { getExamById } from '@/lib/actions/exams'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function MentorExamDetail({ params }) {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'EDUCATOR') {
        redirect('/auth/login')
    }

    const exam = await getExamById(parseInt(params.examId), parseInt(session.user.id), session.user.role)
    
    if (!exam) {
        return <div>Exam not found</div>
    }

    return (
        <div className="user-dashboard position-relative">
            <MentorNavbar/>

            <div className="user-dashboard-content w-100">
                <div className="d-flex justify-content-between">
                    <h3 className="mb-3">{exam.title}</h3>
                </div>
                <MentorStudentList 
                    exam={exam}
                    examId={exam.id}
                    students={exam.students}
                    examSubmissions={exam.examSubmissions}
                />
            </div>
        </div>
    )
}