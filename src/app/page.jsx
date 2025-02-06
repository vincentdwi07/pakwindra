import "./user.css";
import Link from "next/link";
import UserNavbar from "./Components/UserNavbar";
import ExamContent from "./Components/ExamContent";


export default function Home() {
  const tabsData = {
    1: {
      key : 1,
      subject : "Algoritma",
      due_date : "2 Januari 2025, 11.59 PM",
      title : "Lesson 1: Belajar Bebek",
      description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laboriosam, recusandae obcaecati nesciunt quis commodi dignissimos nostrum pariatur ullam, atque explicabo, in consequuntur porro. Rerum, ea perferendis adipisci qui iste placeat!",
      status: "open",
      score: 0,
      user_id: "Pak Windra",
    }
  }
  return (  
    <>
      
      <div className="user-dashboard">
        <UserNavbar/>
        <div className="user-dashboard-content">
            <h3>Welcome, User!</h3>
            {Object.keys(tabsData).map((tabKey) =>(
              <ExamContent
                key={tabsData[tabKey].key}
                subject
              />
            ))}

        </div>
      </div>
    </>
  );
}
