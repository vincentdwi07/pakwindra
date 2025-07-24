import Editor from "@monaco-editor/react"
import { useState } from "react"
import Markdown from 'react-markdown'

export default function MentorDetailStudentQuiz({ quizzes, onFeedbackSubmit, exam }) {
    const [feedback, setFeedback] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeQuiz, setActiveQuiz] = useState(0)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const quiz = quizzes[activeQuiz] || {}

    const isPass = (quiz) => quiz?.submission?.score >= exam?.minScore

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

    const statusOpen = () => (
        <div className="mentor-pill-badge bg-body-secondary text-center col-1">
            OPEN
        </div>
    )

    const statusGrading = () => (
        <div className="mentor-pill-badge bg-yellow text-center col-1">
            GRADING
        </div>
    )

    const statusGraded = () => {
        if (!quiz.submission) return null
        return (
            <div className={`${isPass(quiz) ? 'bg-green' : 'bg-red'} mentor-pill-badge text-center col-1`}>
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
                            <>
                                {quiz.instruction && (
                                    <Markdown>{quiz.instruction}</Markdown>
                                )}
                                {quiz.fileUrl && typeof quiz.fileUrl === 'string' && quiz.fileUrl !== 'undefined' && (
                                    <iframe
                                        src={`${quiz.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                        className="pdf-frame"
                                    />
                                )}
                            </>
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
                            <div className={`exam-content rounded-1 mt-0 ${isPass(quiz) ? 'bg-green' : 'bg-red'}`}>
                                <h6 className="p-0 mb-3">AI Feedbacks:</h6>
                                <Markdown>{quiz.submission.aiNote || <span className="text-muted">No Feedback Added Yet</span>}</Markdown>
                            </div>

                            <h5 className={`fw-bold mt-2 mb-0 w-100 d-flex justify-content-center rounded-1 p-3  ${isPass(quiz) ? "bg-green" : "bg-red"}`}>
                                Score: {Number(quiz.submission.score)} / 100
                            </h5>

                            <p className="mt-5 fw-bold mb-0 p-0">Token Usage Information for This Quiz Submission:</p>
                            <div className="d-flex justify-content-between gap-2 mt-2">
                                <div className="token-content border-secondary-subtle border rounded-1 w-100">
                                    <div className="border-secondary-subtle border-bottom p-2 fw-bold">
                                        Total Input Token
                                    </div>
                                    <div className="p-2 d-flex flex-column">
                                        <span>
                                            Total Token Usage: {quiz.submission.token?.promptTokens ?? '-'}
                                        </span>
                                        <span className="fw-bold">
                                            Price: ${quiz.submission.token?.promptTokens * 0.00000055} 
                                        </span>
                                    </div>
                                </div>
                                <div className="token-content border-secondary-subtle border rounded-1 w-100">
                                    <div className="border-secondary-subtle border-bottom p-2 fw-bold">
                                        Total Output Token
                                    </div>
                                    <div className="p-2 d-flex flex-column">
                                        <span>
                                           Total Token Usage: {quiz.submission.token?.completionTokens ?? '-'}
                                        </span>
                                        <span className="fw-bold">
                                            Price: ${quiz.submission.token?.completionTokens * 0.00000219}
                                        </span>
                                    </div>
                                </div>
                                <div className="token-content border-secondary-subtle border rounded-1 w-100">
                                    <div className="border-secondary-subtle border-bottom p-2 fw-bold">
                                        Total Token (Token Input + Token Output)
                                    </div>
                                    <div className="p-2 d-flex flex-column">
                                        <span>
                                            Total Token Usage: {quiz.submission.token?.totalTokens ?? '-'}
                                        </span>
                                        <span className="fw-bold">
                                            Price: ${(quiz.submission.token?.promptTokens * 0.00000055) + 
                                                    (quiz.submission.token?.completionTokens * 0.00000219)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {typeof quiz.submission.score === 'number' && (
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault()
                                    setLoading(true)

                                    const newScore = parseInt(e.target.score.value)
                                    if (isNaN(newScore)){
                                        setError("Invalid score")
                                    }

                                    try {
                                        const res = await fetch(`/api/quiz-submission/${quiz.submission.quiz_submission_id}`, {
                                            method: "PATCH",
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ score: newScore }),
                                        })
                                        if (!res.ok) {
                                            const data = await res.json().catch(() => ({}))
                                            const message = data?.error || data?.message || "Failed to update score"
                                            setError(message)
                                            return
                                        }
                                        setError("")
                                        if (onFeedbackSubmit) onFeedbackSubmit()
                                    } catch (err) {
                                        console.error(err)
                                        setError(err)
                                    } finally{
                                        setLoading(false)
                                    }
                                }}
                                className="d-flex gap-2 align-items-center mt-5"
                            >
                                <div className="d-flex flex-column">
                                    <label htmlFor="score" className="fw-bold">Score:</label>
                                    <div className="d-flex gap-2 align-items-center mt-1">
                                        <input
                                            name="score"
                                            type="number"
                                            min="0"
                                            max="100"
                                            defaultValue={quiz.submission.score}
                                            className="mentor-add-exam-input w-auto p-2 mt-0"
                                            placeholder="Edit student's score"
                                            style={{ minWidth: "200px" }}
                                        />
                                        <button type="submit" className="btn btn-dark h-100">{loading ? (
                                            <>
                                                <div className="loader"></div>
                                            </>
                                        ): "Update"}</button>
                                    </div>
                                    <span className="text-danger">{error}</span>
                                </div>


                            </form>
                        )}

                            {quiz.submission.feedback ? (
                                <div className="bg-body-secondary rounded-1 p-3 mt-2">
                                    <p className="fw-bold">Mentor Feedback:</p>
                                    <div style={{ whiteSpace: 'pre-line' }}>{quiz.submission?.feedback}</div>
                                </div>
                            ) : (
                                <>
                                    <h6 className="p-0 mt-3">Add Mentor Feedback:</h6>
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
                                                style={{ backgroundColor: '#212529', color: '#fff' }}
                                                type="submit"
                                                disabled={isSubmitting || !feedback.trim()}
                                            >
                                                {isSubmitting ? (<div className="loader"></div>) : 'Submit'}
                                            </button>
                                        </div>
                                    </form>
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
