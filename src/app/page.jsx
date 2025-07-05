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
        <div className="user-dashboard-content w-100">
            <h3>Welcome Student, {session.user.name}!</h3>


            {exams.map(exam => (
              <ExamContent
                  key={exam.exam_id} 
                  id={exam.exam_id}   
                  title={exam.title}
                  description={exam.description}
                  courseName={exam.courseName}
                  creatorName={exam.creator.name}
                  creator={exam.creator}
                  quizzes={exam.quizzes}
                  endDate={exam.endDate}
                  userRole={userRole}
                  studentId={studentId}
                  score={exam.examSubmissions?.[0]?.score ?? null}
                  status={exam.examSubmissions?.[0]?.status ?? 'OPEN'}
                  timing={exam.timing} 
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