import "./user.css";
import Link from "next/link";
import UserNavbar from "./Components/UserNavbar";
import ExamContent from "./Components/ExamContent";


export default function UserLogin() {
  return (  
    <>
      
      <div className="user-dashboard">
        <UserNavbar/>
        <div className="user-dashboard-content">
            <h3>Welcome, User!</h3>
            <ExamContent/>
            <ExamContent/>
        </div>
      </div>
    </>
  );
}
