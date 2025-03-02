'use client'
import { useState } from "react"
import { useRouter } from 'next/navigation'

export default function Quiz({ exam, userId }) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState(exam.quizzes[0]?.id.toString())
    const [selectedFile, setSelectedFile] = useState(null)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Convert quizzes array to an object for easier access
    const quizzesData = exam.quizzes.reduce((acc, quiz) => {
        const submission = quiz.submissions.find(sub => sub.studentId === userId)

        acc[quiz.id] = {
            key: quiz.id,
            title: quiz.title,
            instruction: quiz.instruction,
            status: quiz.status,
            submission: submission,
            educator_note: submission?.feedback,
            ai_note: submission?.aiNote,
            educator_is_correct: submission?.isCorrect
        }
        return acc
    }, {})

    const handleFileChange = (event) => {
        const file = event.target.files[0]

        if (file) {
            if (file.name.endsWith('.py')) {
                setSelectedFile(file)
                setError('')
            } else {
                setSelectedFile(null)
                setError('Only Python (.py) files are allowed!')
            }
        }
    }

    const handleSubmit = async (event, quizId) => {
        event.preventDefault()
        if (!selectedFile) {
            setError('Please select a file first')
            return
        }

        setSubmitting(true)
        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('quizId', quizId)
            formData.append('examId', exam.id)

            const response = await fetch('/api/submissions', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                throw new Error('Failed to submit')
            }

            // Refresh the page to show updated data
            router.refresh()
            setSelectedFile(null)
        } catch (error) {
            setError('Failed to submit file. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="user-task">

            {/* Quiz Navigation */}
            <div className="tab">
                {Object.entries(quizzesData).map(([quizId, quiz]) => (
                <button
                    key={quizId}
                    className={`tablinks ${
                        activeTab === quizId ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab(quizId)}
                >
                    {quiz.key}
                    {quiz.submission && (
                        <span className={`badge ${
                            quiz.status === 'GRADED'
                                ? quiz.educator_is_correct
                                    ? 'bg-success'
                                    : 'bg-danger'
                                : 'bg-secondary'
                        }`}>
                                            {quiz.status === 'GRADED'
                                                ? quiz.educator_is_correct
                                                    ? '✓'
                                                    : '×'
                                                : '•'
                                            }
                                        </span>
                    )}
                </button>
                ))}
            </div>


            {/* Quiz Content */}
            <div className="task-content">
                <div>
                    {Object.entries(quizzesData).map(([quizId, quiz]) => (
                        <div key={quizId} className={`instruction ${activeTab === quizId ? 'show' : ''}`}>
                            <p>{quiz.instruction}</p>
                            <form onSubmit={(e) => handleSubmit(e, quizId)}>
                                <div className="mb-2 text-body-secondary">
                                    <label htmlFor="file-input"><i className="bi bi-filetype-py me-1"></i>Upload your python file here:</label>
                                </div>
                                <input
                                    type="file"
                                    accept=".py"
                                    onChange={handleFileChange}
                                    id="file-input"
                                    className="form-control"
                                    disabled={quiz.status !== 'OPEN'}
                                />
                                {error && (
                                    <div className="text-danger mt-2">{error}</div>
                                )}

                                {quizzesData[quizId].status === 'submitted' || quizzesData[quizId].status === "grading" || quizzesData[quizId].status === "graded" ? (
                                    <span className="bg-secondary task-submitted">Submitted</span>
                                ):(
                                    <button type="submit" className="btn-submit-file-user"
                                            disabled={submitting || !selectedFile}>
                                        {submitting ? 'Submitting...' : 'Submit'}
                                    </button>
                                )}

                            </form>
                            {quiz.submission && quiz.status === 'GRADED' ?
                                <div className={`user-exam-feedback ${quiz.educator_is_correct ? 'correct' : 'false'}`}>
                                    <div>
                                        <p style={{ fontSize: '1rem' }} className="text-body-secondary">Feedbacks:</p>
                                        <h6 className="p-0 m-0">AI Feedbacks:</h6>
                                        <p>{quiz.ai_note ?? 'No Feedback Added'}</p>
                                        <h6 className="p-0 m-0">Educator Feedbaks:</h6>
                                        <p>{quiz.educator_note ?? 'No Feedback Added'}</p>
                                        <p className="m-0 p-0 text-body-secondary">Conclusion:</p>
                                        {quiz.educator_is_correct ? (
                                            <h6 className="text-success m-0 p-0">Correct <span><i className="bi bi-check2"></i></span></h6>
                                        ) : (
                                            <h6 className="text-danger">False <span><i className="bi bi-x-lg"></i></span></h6>
                                        )}
                                    </div>
                                </div>
                                : ''}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}