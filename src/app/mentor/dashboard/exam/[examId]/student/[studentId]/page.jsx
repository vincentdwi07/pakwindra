'use client'
import MentorNavbar from '@/components/Mentor/MentorNavbar'
import "@/styles/user.css";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import MentorDetailStudentQuiz from '@/components/Mentor/MentorDetailStudentQuiz';

export default function MentorStudentExamDetail() {
    const { examId, studentId } = useParams()
    const [quizzes, setQuizzes] = useState([])
    const [student, setStudent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

   const fetchQuizzes = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            if (!examId || !studentId) {
                throw new Error('Missing examId or studentId')
            }

            const res = await fetch(`/api/exam/${examId}/student/${studentId}/quiz-submissions`)
            
            // If response is not ok, try to get error details
            if (!res.ok) {
                const errorData = await res.json().catch(() => null)
                throw new Error(
                    errorData?.error || 
                    `Server error (${res.status})`
                )
            }

            // Try to parse response as JSON
            const data = await res.json()

            // Validate response structure
            if (!data || !data.student || !Array.isArray(data.quizzes)) {
                throw new Error('Invalid response format')
            }

            // Update state with response data
            setQuizzes(data.quizzes)
            setStudent(data.student)

        } catch (err) {
            console.error('Error fetching quizzes:', {
                error: err,
                examId,
                studentId
            })
            setError(err.message || 'Failed to load quiz data')
            setQuizzes([])
            setStudent(null)
        } finally {
            setLoading(false)   
        }
    }, [examId, studentId])


    useEffect(() => {
        if (examId && studentId) {
            fetchQuizzes()
        }
    }, [examId, studentId, fetchQuizzes])

    if (error) {
        return (
            <div className="user-dashboard position-relative">
                <MentorNavbar />
                <div className="user-dashboard-content w-100">
                    <div className="alert alert-danger">
                        {error}
                    </div>
                    <button 
                        onClick={fetchQuizzes}
                        className="btn btn-primary"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="user-dashboard position-relative">
            <MentorNavbar/>
            <div className="user-dashboard-content w-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className='m-0'>
                        {student ? `${student.name}'s Quiz Submissions` : 'Quiz Submissions'}
                    </h3>
                    <button 
                        onClick={fetchQuizzes} 
                        className="btn btn-outline-dark"
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
                
                {loading ? (
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <MentorDetailStudentQuiz 
                        quizzes={quizzes}
                        onFeedbackSubmit={fetchQuizzes}
                    />
                )}
            </div>
        </div>
    )
}