import "../styles/user.css";
import UserNavbar from "@/components/UserNavbar";
import ExamContent from "@/components/ExamContent";
import { getExams } from '@/lib/actions/exams'
import { Role } from '@prisma/client'
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {redirect} from "next/navigation";


export default async function Home() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/auth/login')
  }

  const studentId = parseInt(session.user.id)
  const userRole = session.user.role;

  const exams = await getExams(studentId, userRole)

  return (  
    <>
      <div className="user-dashboard position-relative">
        <UserNavbar/>
        <div className="user-dashboard-content">
            <h3>Welcome, {session.user.name}!</h3>

          {exams.map(exam => (
              <ExamContent
                  key={exam.exam_id}  // Changed from id to exam_id
                  id={exam.exam_id}   // Changed from id to exam_id
                  subject={exam.title.split(':')[0] || 'General'}
                  title={exam.title}
                  description={exam.description}
                  status={"OPEN"}
                  score={exam.quizzes[0]?.submissions[0]?.score || null}
                  userId={exam.creatorId}
                  startDate={exam.startDate}
                  endDate={exam.endDate}
                  quizCount={exam.quizzes.length}
                  studentId={studentId}
              />
          ))}

          {exams.length === 0 && (
              <div className="no-exam text-muted">
                <i className="bi bi-inbox-fill fs-1 d-block mb-3"></i>
                <h5>No exams available</h5>
                <p>No exams have been created yet.</p>
              </div>
          )}
        </div>
      </div>
    </>
  );
}