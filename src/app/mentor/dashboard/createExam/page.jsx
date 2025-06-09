'use client';
import MentorNavbar from "@/components/Mentor/MentorNavbar";
import "@/styles/user.css";
import { useState } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";


export default function CreateExamPage() {
    const [date, setDate] = useState();
    const [quizComponents, setQuizComponents] = useState([{ id: 1 }]); // Initialize with one component

    const addQuizComponent = (e) => {
        e.preventDefault(); // Prevent form submission
        setQuizComponents([...quizComponents, { id: quizComponents.length + 1 }]);
    };

    const deleteQuizComponent = (e, idToDelete) => {
        e.preventDefault();
        if (quizComponents.length > 1) { // Keep at least one component
            setQuizComponents(quizComponents.filter(comp => comp.id !== idToDelete));
        }
    };

    return (
        <div className="user-dashboard position-relative">
            <MentorNavbar />
            <div className="user-dashboard-content w-100">
                <h3 className="mb-3">Create New Exam</h3>
                <div className="container m-0">
                    <form action="">
                        <div className="row">
                            <div className="col-8 p-0">
                                <div className="d-flex flex-column mb-3 pe-4">
                                    <label htmlFor="exam-title">Title</label>
                                    <input id="exam-title" type="text" className="mentor-add-exam-input" placeholder="Enter exam title" />
                                </div>
                                <div className="d-flex flex-column mb-3 pe-4">
                                    <label htmlFor="course-name">Course Name</label>
                                    <input id="course-name" type="text" className="mentor-add-exam-input" placeholder="Enter course name, ex: Algoritma" />
                                </div>
                                <div className="d-flex flex-column mb-3 pe-4">
                                    <label htmlFor="exam-desc">Exam Description</label>
                                    <textarea rows="4" id="exam-desc" type="text" className="mentor-add-exam-input" placeholder="Enter exam description" />
                                </div>
                            </div>
                            <div className="col-4 p-0">
                                <div className="d-flex flex-column mb-3 w-100">
                                    <label htmlFor="due-date">Due Date</label>
                                    <Flatpickr
                                        className="mentor-add-exam-input"
                                        value={date}
                                        options={{ dateFormat: "Y-m-d" }}
                                        onChange={([selectedDate]) => setDate(selectedDate)}
                                        placeholder="Select due date"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-12 p-0">
                                <p>Add Quiz</p>
                                {quizComponents.map((component) => (
                                    <div key={component.id} className="mentor-add-quiz-component mb-3">
                                        <p className="fw-normal mb-2">Quiz {component.id}</p>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <input 
                                                className="form-control" 
                                                type="file" 
                                                id={`formFile-${component.id}`} 
                                            />
                                            {quizComponents.length > 1 && (
                                                <button 
                                                    onClick={(e) => deleteQuizComponent(e, component.id)}
                                                    className="btn btn-danger mt-2"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button 
                                    onClick={addQuizComponent}
                                    className="btn-mentor-add-quiz-component bg-dark"
                                >
                                    <i className="bi bi-plus"></i>Tambah Quiz
                                </button>
                            </div>
                            <div className="d-flex gap-2 mt-5 justify-content-end m-0 p-0">
                                <button type="submit" className="btn btn-success">Publish</button>
                                <button type="submit" className="btn btn-danger">Cancel</button>
                            </div>
                        </div>
                    
                    </form>
                </div>
            </div>
        </div>
    )
}