import Quiz from "../Components/Quiz";
import UserNavbar from "../Components/UserNavbar";
import "../user.css";
import Link from "next/link";

export default function ExamDetail(){
    return(
        <>
            <div className="exam-detail">
                <UserNavbar/>
                <div className="exam-detail-content">
                    <div className="nav-exam-detail-content">
                        <li className="nax-exam-detail-back">
                            <Link  className="text-black" href="/">Home</Link>
                        </li>
                        <li>/</li>
                        <li>Lesson 1: Belajar Bebek</li>
                    </div>
                    <Quiz/>
                </div>
            </div>
        </>
    )
}