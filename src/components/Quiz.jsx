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

    // State untuk quiz data - dengan data submission yang lebih akurat
    const [quizzesData, setQuizzesData] = useState(() => {
        if (!exam?.quizzes) return {}

        return exam.quizzes.reduce((acc, quiz) => {
            const submission = quiz.submissions?.[0]
            acc[quiz.quiz_id] = {
                key: quiz.quiz_id,
                instruction: quiz.instruction,
                quizSubmissionLimit: quiz.submission_limit || "Unlimited",
                submissionStatus: submission?.status || 'OPEN',
                educator_note: submission?.feedback || null,
                ai_note: submission?.aiNote || null,
                educator_is_correct: submission?.isCorrect || false,
                filePath: quiz.filePath || null,
                // PERBAIKAN: Ambil submission_count dari database, bukan hardcode 0
                submissionCount: submission?.submission_count || 0,
                submissionUpdatedAt: submission?.updatedAt 
                    ? new Date(submission.updatedAt).toLocaleString()
                    : null,
            }
            return acc
        }, {})
    })

    // Fungsi untuk refresh data dari database
    const refreshData = async () => {
        try {
            const response = await fetch(`/api/submissions?examId=${exam.exam_id}&studentId=${userId}`)
            const data = await response.json()
            if (response.ok && data.quizzes) {
                setQuizzesData(prev => {
                    const newData = { ...prev }
                    data.quizzes.forEach(quiz => {
                        newData[quiz.quiz_id] = {
                            ...newData[quiz.quiz_id],
                            submissionStatus: quiz.status,
                            ai_note: quiz.ai_note,
                            educator_is_correct: quiz.is_correct,
                            educator_note: quiz.educator_note,
                            // PENTING: Update submissionCount dari database
                            submissionCount: quiz.submission_count || 0,
                            submissionUpdatedAt: quiz.updatedAt 
                                ? new Date(quiz.updatedAt).toLocaleString()
                                : null
                        }
                    })
                    return newData
                })
            }
        } catch (error) {
            console.error('Failed to refresh data:', error)
        }
    }

    // Auto refresh data saat component mount
    useEffect(() => {
        refreshData()
    }, [exam.exam_id, userId])

    // Auto refresh data setiap 30 detik untuk memastikan data selalu update
    useEffect(() => {
        const autoRefreshInterval = setInterval(refreshData, 30000) // 30 detik
        return () => clearInterval(autoRefreshInterval)
    }, [exam.exam_id, userId])

    // Memoize handleCodeChange
    const handleCodeChange = useCallback((value, quizId) => {
        setCodes(prev => ({
            ...prev,
            [quizId]: value || ""
        }))
    }, [])

    // Enhanced polling effect - lebih agresif untuk update real-time
    useEffect(() => {
        let pollInterval

        const startPolling = () => {
            pollInterval = setInterval(async () => {
                try {
                    const response = await fetch(`/api/submissions?examId=${exam.exam_id}&studentId=${userId}`)
                    const data = await response.json()
                    
                    if (response.ok && data.quizzes) {
                        setQuizzesData(prev => {
                            const newData = { ...prev }
                            let hasUpdates = false

                            data.quizzes.forEach(quiz => {
                                if (newData[quiz.quiz_id] && 
                                    (prev[quiz.quiz_id].submissionStatus !== quiz.status ||
                                     prev[quiz.quiz_id].submissionCount !== quiz.submission_count ||
                                     prev[quiz.quiz_id].ai_note !== quiz.ai_note ||
                                     prev[quiz.quiz_id].educator_note !== quiz.educator_note)) {
                                    hasUpdates = true
                                    newData[quiz.quiz_id] = {
                                        ...prev[quiz.quiz_id],
                                        submissionStatus: quiz.status,
                                        ai_note: quiz.ai_note,
                                        educator_is_correct: quiz.is_correct,
                                        educator_note: quiz.educator_note,
                                        submissionCount: quiz.submission_count || prev[quiz.quiz_id].submissionCount,
                                        submissionUpdatedAt: quiz.updatedAt 
                                            ? new Date(quiz.updatedAt).toLocaleString()
                                            : null
                                    }
                                }
                            })

                            return hasUpdates ? newData : prev
                        })
                    }
                } catch (error) {
                    console.error('Polling error:', error)
                }
            }, 2000) // Poll setiap 2 detik
        }

        // Mulai polling
        startPolling()

        // Cleanup
        return () => {
            if (pollInterval) {
                clearInterval(pollInterval)
            }
        }
    }, [exam.exam_id, userId, quizzesData])

    // Handle submission dengan update yang lebih akurat
    const handleSubmit = async (event, quizId) => {
        event.preventDefault()
        
        const currentCode = codes[quizId]
        if (!currentCode?.trim()) {
            setError('Please enter your code before submitting')
            return
        }

        // PERBAIKAN: Cek submission limit sebelum submit
        const currentQuiz = quizzesData[quizId]
        if (currentQuiz.quizSubmissionLimit !== "Unlimited" && 
            currentQuiz.submissionCount >= currentQuiz.quizSubmissionLimit) {
            setError('You have reached the submission limit for this quiz')
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

            // PERBAIKAN: Update status dan increment submissionCount
            setQuizzesData(prev => ({
                ...prev,
                [quizId]: {
                    ...prev[quizId],
                    submissionStatus: 'GRADING',
                    educator_is_correct: false,
                    ai_note: "AI evaluation in progress...",
                    submissionCount: (prev[quizId].submissionCount || 0) + 1
                }
            }))

            // TAMBAHAN: Auto refresh setelah submit untuk sinkronisasi langsung
            setTimeout(() => {
                refreshData()
            }, 500) // Refresh lebih cepat setelah submit
            
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
            <div className="task-content position-relative">{Object.entries(quizzesData).map(([quizId, quiz]) => (
                    <div key={quizId} className={`instruction ${activeTab === quizId ? 'show' : ''}`}>
                        <p className="fw-bold mb-1">Read instruction below: </p>
                        <iframe
                            src={`${quiz.filePath}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="pdf-frame"
                        ></iframe>
                        
                        <p className="fw-bold mb-2 mt-5">
                            {(quiz.submissionStatus === "GRADING" || quiz.submissionStatus === "GRADED")
                                ? "Your answer review:"
                                : "Input your answer here:"}
                        </p>

                        <Editor
                            key={`editor-${quizId}`}
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

                        {quiz.quizSubmissionLimit === "Unlimited" ? (
                            <p className="text-muted mb-2 mt-2">
                                Submission attempt left: Unlimited
                            </p>          
                        ): ('')}

                        {quiz.submissionStatus === "GRADED" && quiz.educator_is_correct ? null : (
                            quiz.quizSubmissionLimit === "Unlimited" ? (
                                quiz.submissionStatus === "GRADING" ? (
                                    <p className="text-muted bg-body-secondary p-3 text-center rounded-1 m-0">
                                        Your answer is being reviewed by AI. This process usually takes 2-5 mins. Do not close or refresh the browser!
                                    </p>
                                ) : (
                                    <button
                                        onClick={(e) => handleSubmit(e, quizId)}
                                        className="btn-submit-file-user m-0 mt-2"
                                        disabled={submitting[quizId] || !codes[quizId]?.trim()}
                                    >
                                        {submitting[quizId] ? (<div className="loader"></div>) : 'Submit'}
                                    </button>
                                )
                            ) : (
                                // Limited: cek sisa attempt dan status
                                <>
                                    <p className="text-muted mb-2 mt-2">
                                        Submission attempt left: {Math.max(0, quiz.quizSubmissionLimit - quiz.submissionCount)}
                                    </p>
                                    
                                    {quiz.submissionCount < quiz.quizSubmissionLimit ? (
                                        quiz.submissionStatus === "GRADING" ? (
                                            <p className="text-muted bg-body-secondary p-3 text-center rounded-1 m-0">
                                                Your answer is being reviewed by AI. This process usually takes 2-5 mins. Do not close or refresh the browser!
                                            </p>
                                        ) : (
                                            <button
                                                onClick={(e) => handleSubmit(e, quizId)}
                                                className="btn-submit-file-user m-0 mt-2"
                                                disabled={submitting[quizId] || !codes[quizId]?.trim()}
                                            >
                                                {submitting[quizId] ? (<div className="loader"></div>) : 'Submit'}
                                            </button>
                                        )
                                    ) : ('')}
                                </>
                            )
                        )}

                        {/* Status Messages */}
                        {error && <div className="text-danger mt-2">{error}</div>}
                        
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