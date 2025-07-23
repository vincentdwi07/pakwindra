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
    const [exam, setExam] = useState(null)

    console.log("quizzes: ",quizzes);

    const fetchQuizzes = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // Validate params
            if (!examId || !studentId) {
                throw new Error('Missing examId or studentId')
            }

            // Log request params
            console.log('Fetching quizzes for:', { examId, studentId })

            const res = await fetch(`/api/exam/${examId}/student/${studentId}/quiz-submissions`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })
                
            // Get response text first for debugging
            const responseText = await res.text()
            console.log('Raw response:', responseText)

            // Try to parse as JSON
            let data
            try {
                data = JSON.parse(responseText)
            } catch (parseError) {
                console.error('JSON parse error:', parseError)
                throw new Error(`Invalid JSON response: ${responseText}`)
            }

            // If response is not ok, handle error
            if (!res.ok) {
                throw new Error(
                    data?.error || 
                    data?.message || 
                    `Server error (${res.status})`
                )
            }

            // Validate response structure
            if (!data || !data.student || !Array.isArray(data.quizzes)) {
                console.error('Invalid response structure:', data)
                throw new Error('Invalid response format')
            }

            // Update state with response data
            setQuizzes(data.quizzes)
            setStudent(data.student)
            setExam(data.exam)
            setError(null)

        } catch (err) {
            console.error('Error fetching quizzes:', {
                message: err.message,
                examId,
                studentId,
                stack: err.stack
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
                        <div className="loader"></div>
                    </div>
                ) : (
                    <MentorDetailStudentQuiz 
                        exam={exam}
                        quizzes={quizzes}
                        onFeedbackSubmit={fetchQuizzes}
                    />
                )}
            </div>
        </div>
    )
}