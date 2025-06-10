'use client'
import { useState, useEffect, useCallback } from "react"
import { useRouter } from 'next/navigation'
import Editor from "@monaco-editor/react"
import '../styles/user.css'
import Markdown from 'react-markdown'

export default function Quiz({ exam, userId }) {
    const router = useRouter()

    // Initialize states    
    const [activeTab, setActiveTab] = useState(() => {
        const firstQuiz = exam?.quizzes?.[0]
        return firstQuiz?.quiz_id?.toString() || ''
    })
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState({})
    
    // Pisahkan state untuk codes
    const [codes, setCodes] = useState(() => {
        const initialCodes = {}
        exam?.quizzes?.forEach(quiz => {
            initialCodes[quiz.quiz_id] = quiz.submissions?.[0]?.answer || '# Drop your code here'
        })
        return initialCodes
    })

    // State untuk quiz data
    const [quizzesData, setQuizzesData] = useState(() => {
        if (!exam?.quizzes) return {}

        return exam.quizzes.reduce((acc, quiz) => {
            const submission = quiz.submissions?.[0]
            acc[quiz.quiz_id] = {
                key: quiz.quiz_id,
                instruction: quiz.instruction,
                submissionStatus: submission?.status || 'OPEN',
                educator_note: submission?.feedback || null,
                ai_note: submission?.aiNote || null,
                educator_is_correct: submission?.isCorrect || false,
                filePath: quiz.filePath || null,
                submissionUpdatedAt: submission?.updatedAt 
                    ? new Date(submission.updatedAt).toLocaleString()
                    : null,
            }
            return acc
        }, {})
    })

    // Memoize handleCodeChange
    const handleCodeChange = useCallback((value, quizId) => {
        setCodes(prev => ({
            ...prev,
            [quizId]: value || ""
        }))
    }, [])

    // Polling effect dengan pengecekan status saja
    useEffect(() => {
        const hasGradingSubmissions = Object.values(quizzesData)
            .some(quiz => quiz.submissionStatus === 'GRADING')

        if (!hasGradingSubmissions) return

        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/submissions?examId=${exam.exam_id}&studentId=${userId}`)
                const data = await response.json()
                
                if (response.ok) {
                    setQuizzesData(prev => {
                        const newData = { ...prev }
                        let hasUpdates = false

                        data.quizzes.forEach(quiz => {
                            if (newData[quiz.quiz_id] && prev[quiz.quiz_id].submissionStatus === 'GRADING') {
                                hasUpdates = true
                                newData[quiz.quiz_id] = {
                                    ...prev[quiz.quiz_id],
                                    submissionStatus: quiz.status,
                                    ai_note: quiz.ai_note,
                                    educator_is_correct: quiz.is_correct,
                                    educator_note: quiz.educator_note,
                                    submissionUpdatedAt: quiz.updatedAt 
                                        ? new Date(quiz.updatedAt).toLocaleString()
                                        : null
                                }
                            }
                        })

                        return hasUpdates ? newData : prev
                    })

                    if (data.quizzes.every(quiz => quiz.status !== 'GRADING')) {
                        clearInterval(pollInterval)
                    }
                }
            } catch (error) {
                console.error('Polling error:', error)
            }
        }, 2000)

        return () => clearInterval(pollInterval)
    }, [exam.exam_id, userId, quizzesData])

    // Handle submission dengan mempertahankan code
    const handleSubmit = async (event, quizId) => {
        event.preventDefault()
        
        const currentCode = codes[quizId]
        if (!currentCode?.trim()) {
            setError('Please enter your code before submitting')
            return
        }

        setSubmitting(prev => ({ ...prev, [quizId]: true }))
        setError('')

        try {
            const payload = {
                answer: currentCode,
                quizId: parseInt(quizId),
                examId: parseInt(exam.exam_id),
                studentId: parseInt(userId)
            }

            const response = await fetch('/api/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (!response.ok || data.error) {
                throw new Error(data.error || data.details || 'Server error')
            }

            // Update hanya status, bukan code
            setQuizzesData(prev => ({
                ...prev,
                [quizId]: {
                    ...prev[quizId],
                    submissionStatus: 'GRADING',
                    educator_is_correct: false,
                    ai_note: "AI evaluation in progress..."
                }
            }))
            
        } catch (error) {
            console.error('Submission error:', error)
            setError(error.message || 'Failed to submit code')
        } finally {
            setSubmitting(prev => ({ ...prev, [quizId]: false }))
        }
    }

    return (
        <div className="user-task">
            {/* Quiz Tabs */}
            <div className="tab">
                {Object.entries(quizzesData).map(([quizId, quiz], index) => (
                    <button
                        key={quizId}
                        className={`tablinks ${
                            activeTab === quizId 
                                ? 'active'
                                : quiz.submissionStatus === 'GRADED'
                                    ? quiz.educator_is_correct
                                        ? 'bg-success text-light'
                                        : 'bg-danger text-light'
                                    : 'bg-transparent text-dark'
                        }`}
                        onClick={() => setActiveTab(quizId)}
                    >
                        {`${index + 1}`} 
                    </button>
                ))}
            </div>

            {/* Quiz Content */}
            <div className="task-content">
                {Object.entries(quizzesData).map(([quizId, quiz]) => (
                    <div key={quizId} className={`instruction ${activeTab === quizId ? 'show' : ''}`}>
                        <p>Read the instruction below: </p>
                        <iframe
                            src={`${quiz.filePath}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="pdf-frame"
                        ></iframe>
                        
                        <p>
                            {(quiz.submissionStatus === "GRADING" || quiz.submissionStatus === "GRADED")
                                ? "Your answer review:"
                                : "Input your answer here:"}
                        </p>

                        <Editor
                            key={`editor-${quizId}`}  // Add key untuk memastikan value tetap
                            height="400px"
                            language="python"
                            value={codes[quizId] || ''}
                            onChange={(value) => handleCodeChange(value, activeTab)}
                            theme="vs-dark"
                            className="mb-3"
                            options={{
                                readOnly: quizzesData[activeTab]?.submissionStatus === "GRADING" || 
                                        (quizzesData[activeTab]?.submissionStatus === "GRADED" && 
                                        quizzesData[activeTab]?.educator_is_correct),
                                minimap: { enabled: false },
                                lineNumbers: "on",
                                wordWrap: "on",
                                automaticLayout: true,
                            }}
                        />

                        {quiz?.submissionStatus === "GRADED" && (
                            <p className="text-muted">Submitted at: {quiz?.submissionUpdatedAt || 'No update time'}</p>
                        )}

                        {/* Submit Button */}
                        {quiz.submissionStatus === "GRADING" ? (
                            <p className="text-muted bg-body-secondary p-3 text-center rounded-1 m-0">
                                Your answer is being reviewed by AI. This process usually takes 2-5 mins
                            </p>
                        ) : (
                            !(quiz.submissionStatus === "GRADED" && quiz.educator_is_correct) && (
                                <button 
                                    onClick={(e) => handleSubmit(e, quizId)}
                                    className="btn-submit-file-user m-0 mt-2"
                                    disabled={submitting[quizId] || !codes[quizId]?.trim()}
                                >
                                    {submitting[quizId] ? (<div className="loader"></div>): 'Submit'}
                                </button>
                            )
                        )}

                        {/* Status Messages */}
                        {error && <div className="text-danger mt-2">{error}</div>}
                        
                        {/* <p>Status: {quiz.submissionStatus}</p> */}

                        {/* Feedback Section */}
                        {quiz.submissionStatus === 'GRADED' && (
                            <div className={`user-exam-feedback ${quiz.educator_is_correct ? 'correct' : 'false'}`}>
                                <div>
                                    <p className="text-body-secondary" style={{ fontSize: '1rem' }}>Feedbacks:</p>
                                    <h6 className="p-0 m-0">AI Feedbacks:</h6>
                                    <Markdown>{quiz.ai_note ?? 'No Feedback Added'}</Markdown>
                                    <h6 className="p-0 m-0">Educator Feedbacks:</h6>
                                    <p>{quiz.educator_note === null ? 'No Feedback Added' : quiz.educator_note}</p>
                                    <p className="m-0 p-0 text-body-secondary">Conclusion:</p>
                                    {quiz.educator_is_correct ? (
                                        <h6 className="text-success m-0 p-0">Correct <i className="bi bi-check2"></i></h6>
                                    ) : (
                                        <h6 className="text-danger m-0 p-0">False <i className="bi bi-x-lg"></i></h6>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}