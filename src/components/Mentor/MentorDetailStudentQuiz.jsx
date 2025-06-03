import Editor from "@monaco-editor/react"
import { useState } from "react"

export default function MentorDetailStudentQuiz({ quizzes, onFeedbackSubmit }) {
    const [feedback, setFeedback] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeQuiz, setActiveQuiz] = useState(0)

    const quiz = quizzes[activeQuiz] || {}

    const handleSubmitFeedback = async (e) => {
        e.preventDefault()
        if (!feedback.trim()) return

        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/quiz-submissions/${quiz.submissionId}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedback })
            })

            if (!res.ok) throw new Error('Failed to submit feedback')
            
            setFeedback("")
            // Call the callback to refresh parent data
            if (onFeedbackSubmit) onFeedbackSubmit()
            
        } catch (error) {
            console.error('Error submitting feedback:', error)
            alert('Failed to submit feedback')
        } finally {
            setIsSubmitting(false)
        }
    }

    const submissionStatus = (stat) => {
        switch (stat) {
            case 'GRADING':
                return statusGrading();
            case 'GRADED':
                return statusGraded();
            default:
                return statusOpen();
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
        return (
            <div className="mentor-pill-badge bg-green text-center col-1">
                GRADED                                      
            </div>
        )
    }

    return (
        <div>
            {/* Quiz Navigation */}
            <div className="mb-3">
                {quizzes.map((_, index) => (
                    <button
                        key={index}
                        className={`btn btn-md p-2 px-3  me-2 ${activeQuiz === index ? 'btn-dark' : 'btn-outline-dark'}`}
                        onClick={() => setActiveQuiz(index)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            {/* Quiz Content */}
            <div className="mentor-detail-student-quiz mb-4">
                <div className="exam-header d-flex align-items-center">
                    {submissionStatus(quiz.status)}
                </div>
                <div className="exam-content mt-0">
                    <div>
                        {quiz.instruction || "Tidak ada instruksi"}
                    </div>

                    
                    <Editor
                        height="400px"
                        language={quiz.language || "python"}
                        theme="vs-dark"
                        className="mb-3 mt-3"
                        value={quiz.answer || ""}
                        options={{ readOnly: true }}
                    />

                                    
                    <div className={`exam-content rounded-1 mt-0 ${
                        quiz?.isCorrect === undefined || quiz?.isCorrect === null
                            ? 'bg-transparent' 
                            : quiz?.isCorrect 
                                ? 'bg-green' 
                                : 'bg-red'
                    }`}>
                        <h6 className="p-0 m-0">AI Feedbacks:</h6>
                        <p>{quiz?.aiNote || <span className="text-muted">No Feedback Added Yet</span>}</p>
                        
                        {quiz?.submissionId && (
                            <>
                                <p className="m-0 p-0 text-body-secondary">Conclusion:</p>
                                <h6 className={quiz?.isCorrect ? "text-success" : "text-danger"}>
                                    {quiz?.isCorrect ? "Correct" : "Incorrect"}
                                    <i className={`bi ${quiz?.isCorrect ? "bi-check2" : "bi-x"}`}></i>
                                </h6>
                            </>
                        )}
                    </div>

                    {quiz.submissionId && (
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
                                        {isSubmitting ? '...' : 'Submit'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}