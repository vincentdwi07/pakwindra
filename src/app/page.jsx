import "../styles/user.css";
import UserNavbar from "@/components/UserNavbar";
import ExamContent from "@/components/ExamContent";
import { getExams } from '@/lib/actions/exams'
import { Role } from '@prisma/client'
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {redirect} from "next/navigation";


export default async function Home() {

  //const { data: session } = useSession()
  // Get the user session
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/auth/login')
  }

  console.log(session)
  const studentId = parseInt(session.user.id)
  const userRole = session.user.role;

  const exams = await getExams(studentId, userRole)

  //const { exams, error } = await getExams()

  /*if (error) {
    return (
        <div className="user-dashboard">
          <UserNavbar />
          <div className="user-dashboard-content">
            <h3>Error: {error}</h3>
          </div>
        </div>
    )
  }*/

  const tabsData = {
    1: {
      key : 1,
      subject : "Algoritma",
      due_date : "2 Januari 2025, 11.59 PM",
      title : "Lesson 1: Belajar Bebek",
      description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laboriosam, recusandae obcaecati nesciunt quis commodi dignissimos nostrum pariatur ullam, atque explicabo, in consequuntur porro. Rerum, ea perferendis adipisci qui iste placeat!",
      status: "graded",
      min_score: 75,
      score: 100,
      user_id: "Pak Windra",
    }
  }
  return (  
    <>
      
      <div className="user-dashboard">
        <UserNavbar/>
        <div className="user-dashboard-content">
            <h3>Welcome, {session.user.name}!</h3>
            {/*{Object.keys(tabsData).map((tabKey) =>(
              <ExamContent
                key={tabsData[tabKey].key}
                subject={tabsData[tabKey].subject}
                due_date={tabsData[tabKey].due_date}
                title={tabsData[tabKey].title}
                description={tabsData[tabKey].description}
                status={tabsData[tabKey].status}
                min_score={tabsData[tabKey].min_score}
                score={tabsData[tabKey].score}
                user_id={tabsData[tabKey].user_id}
              />
            ))}*/}

          {exams.map(exam => (
              <ExamContent
                  key={exam.id}
                  id={exam.id}
                  subject={exam.title.split(':')[0] || 'General'} // Assuming title format "Subject: Title"
                  title={exam.title}
                  description={exam.description}
                  status={exam.status}
                  score={exam.quizzes[0]?.submissions[0]?.score || null} // Simplified, you might want to calculate average
                  userId={exam.creatorId}
                  minScore={exam.minScore}
                  startDate={exam.startDate}
                  endDate={exam.endDate}
                  quizCount={exam.quizzes.length}
                  studentId={studentId}
              />
          ))}

          {exams.length === 0 && (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-inbox-fill fs-1 d-block mb-3"></i>
                <h5>No exams available</h5>
                <p>You don't have any exams assigned yet.</p>
              </div>
          )}

        </div>
      </div>
    </>
  );
}
