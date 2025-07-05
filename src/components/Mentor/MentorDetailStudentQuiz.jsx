import Editor from "@monaco-editor/react"
import { useState } from "react"
import Markdown from 'react-markdown'


export default function MentorDetailStudentQuiz({ quizzes, onFeedbackSubmit }) {
    const [feedback, setFeedback] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeQuiz, setActiveQuiz] = useState(0)

    const quiz = quizzes[activeQuiz] || {}
    
    // Log the full quiz object to debug
    console.log("Current quiz:", quiz);

    const handleSubmitFeedback = async (e) => {
        e.preventDefault()
        if (!feedback.trim() || !quiz?.submission?.quiz_submission_id) return

        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/mentor-feedback/${quiz.submission.quiz_submission_id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedback })
            })

            if (!res.ok) throw new Error('Failed to submit feedback')
            
            setFeedback("")
            if (onFeedbackSubmit) onFeedbackSubmit()
            
        } catch (error) {
            console.error('Error submitting feedback:', error)
            alert('Failed to submit feedback')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Update status display to handle no submission
    const submissionStatus = (quiz) => {
        if (!quiz.submission) return statusOpen()
        
        switch (quiz.submission.status) {
            case 'GRADING':
                return statusGrading()
            case 'GRADED':
                return statusGraded()
            default:
                return statusOpen()
        }
    }

    const statusOpen = () => {
        return (
            <div className="mentor-pill-badge bg-body-secondary text-center col-1">
                OPEN                                      
            </div>
        )
    }

    const statusGrading = () => {
        return (
            <div className="mentor-pill-badge bg-yellow text-center col-1">
                GRADING                                      
            </div>
        )
    }

    const statusGraded = () => {
        if (!quiz.submission) return null;
        return (
            <div className={`${quiz.submission.isCorrect  ? `bg-green` : 'bg-red'} mentor-pill-badge text-center col-1`}>
                GRADED                                      
            </div>
        );
    }

    return (
        <div>
            {/* Quiz Navigation */}
            <div className="mb-3">
                {quizzes.map((_, index) => (
                    <button
                        key={index}
                        className={`btn btn-md px-4 p-2 tab-links me-2 ${activeQuiz === index ? 'btn-dark' : 'btn-outline-dark'}`}
                        onClick={() => setActiveQuiz(index)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>


            {/* Quiz Content */}
            <div className="mentor-detail-student-quiz mb-4">
                <div className="exam-header d-flex align-items-center">
                    {submissionStatus(quiz)}
                </div>
                <div className="exam-content mt-0">
                    <div className="mb-3">
                        <p className="mb-0 fw-bold">Instruction</p>
                        {(quiz.instruction || quiz.fileUrl) && (
                            <div className="">
                                {/* Teks Instruction jika ada */}
                                {quiz.instruction && (
                                    <Markdown>{quiz.instruction}</Markdown>
                                )}

                                {/* PDF jika ada */}
                                {quiz.fileUrl && typeof quiz.fileUrl === 'string' && quiz.fileUrl != 'undefined' && (
                                    <iframe
                                        src={`${quiz.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                        className="pdf-frame"
                                    />
                                )}

                            </div>
                        )}
                    </div>



                    <div>
                        <p className="mb-0 fw-bold">Answer:</p>
                        <Editor
                            height="400px"
                            language="python"
                            theme="vs-dark"
                            className="mb-3 mt-1"
                            value={quiz.submission?.answer || ""}
                            options={{ readOnly: true }}
                        />
                    </div>

                    {quiz.submission ? (
                        <>
                            <div className={`exam-content rounded-1 mt-0 ${
                                quiz.submission.isCorrect === null || quiz.submission.isCorrect != true ? 'bg-red' : 'bg-green' 
                            }`}>
                                <h6 className="p-0 mb-3">AI Feedbacks:</h6>
                                <Markdown>{quiz.submission.aiNote || <span className="text-muted">No Feedback Added Yet</span>}</Markdown>
                                
                                <p className="m-0 p-0 text-body-secondary">Conclusion:</p>
                                <h6 className={quiz.submission.isCorrect != true ?  "text-danger" : "text-success"}>
                                    {quiz.submission.isCorrect != true ? "Incorrect" : "Correct"}
                                    <i className={`bi ${quiz.submission.isCorrect ? "bi-check2" : "bi-x"}`}></i>
                                </h6>
                            </div>

                            
                            {typeof quiz.submission.score === 'number' && (
                                <h5 className={`fw-bold mt-2 w-100 p-2 justify-content-center d-flex rounded-1 ${quiz.submission.isCorrect ? "bg-green" : "bg-red"}`}>
                                    Score: {quiz.submission.score}/100
                                </h5>
                            )}
                            

                            {quiz.submission.feedback ? (
                                <div className="bg-body-secondary mt-2 rounded-1 p-3">
                                    <p className="fw-bold">Mentor Feedback:</p>
                                    <div style={{ whiteSpace: 'pre-line' }}>{quiz.submission?.feedback}</div>
                                </div>
                            ):(
                                <>
                                    <div className="mt-5">
                                        <h6 className="p-0 m-0">Add Mentor Feedback:</h6>
                                        <form onSubmit={handleSubmitFeedback} className="row mt-2 justify-content-center align-items-center w-100">
                                            <div className="col-11">
                                                <textarea 
                                                    className="w-100 p-2 bg-transparent rounded-1 text-black"
                                                    placeholder="Add Feedback Here (Optional)"
                                                    value={feedback}
                                                    onChange={(e) => setFeedback(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-1 d-flex justify-content-center align-items-center">
                                                <button 
                                                    className="btn btn-dark px-3" 
                                                    type="submit"
                                                    disabled={isSubmitting || !feedback.trim()}
                                                >
                                                    {isSubmitting ? (<div className="loader"></div>) : 'Submit'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </>
                            )}
                           
                        </>
                    ) : (
                        <div className="text-muted bg-body-secondary p-3 text-center rounded-1 m-0">
                            No submission available for this quiz yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}