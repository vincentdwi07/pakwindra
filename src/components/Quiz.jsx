'use client'
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import Editor from "@monaco-editor/react"
import '../styles/user.css'

export default function Quiz({ exam, userId }) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState(exam.quizzes[0]?.id.toString())
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [codes, setCodes] = useState({})

    // Debug initial data
    useEffect(() => {
        console.log('Initial Quiz Data:', {
            examId: exam.id,
            quizzes: exam.quizzes.map(quiz => ({
                quizId: quiz.id,
                submissions: quiz.submissions
            }))
        });
    }, []);

    const [quizzesData, setQuizzesData] = useState(() => {
        const initialData = exam.quizzes.reduce((acc, quiz) => {
            const submission = quiz.submissions[0] // Ambil submission pertama (terbaru)
            console.log(`Initializing Quiz ${quiz.id}:`, {
                submission,
                status: submission?.status,
                hasSubmission: !!submission
            });

            acc[quiz.id] = {
                key: quiz.id,
                instruction: quiz.instruction,
                submissionStatus: submission?.status || 'OPEN',
                submission: submission || null,
                educator_note: submission?.feedback,
                ai_note: submission?.aiNote,
                educator_is_correct: submission?.isCorrect,
                submitted_code: submission?.answer || '# Drop your code here',
            }
            return acc
        }, {})

        console.log('Initial Quizzes Data:', initialData);
        return initialData;
    })

    useEffect(() => {
        const initialCodes = {}
        Object.entries(quizzesData).forEach(([quizId, quiz]) => {
            initialCodes[quizId] = quiz.submitted_code
        })
        console.log('Setting initial codes:', initialCodes);
        setCodes(initialCodes)
    }, [quizzesData])

    useEffect(() => {
        console.log('Exam or userId changed:', {
            examId: exam.id,
            userId,
            timestamp: new Date().toISOString()
        });

        const newQuizzesData = exam.quizzes.reduce((acc, quiz) => {
            const submission = quiz.submissions[0] // Ambil submission pertama (terbaru)
            acc[quiz.id] = {
                key: quiz.id,
                instruction: quiz.instruction,
                submissionStatus: submission?.status || 'OPEN',
                submission: submission || null,
                educator_note: submission?.feedback,
                ai_note: submission?.aiNote,
                educator_is_correct: submission?.isCorrect,
                submitted_code: submission?.answer || '# Drop your code here',
            }
            return acc
        }, {})

        console.log('Updating quizzesData:', newQuizzesData);
        setQuizzesData(newQuizzesData)
    }, [exam, userId])

    const handleCodeChange = (value, quizId) => {
        setCodes(prev => ({
            ...prev,
            [quizId]: value || ""
        }))
    }

    // HANDLE SUBMIT
    const handleSubmit = async (event, quizId) => {
        event.preventDefault()
        console.log('Submitting quiz:', {
            quizId,
            currentTime: new Date().toISOString()
        });

        const currentCode = codes[quizId]
        const aiNote = "aiNote"
        if (!currentCode?.trim()) {
            setError('Please enter your code before submitting')
            return
        }

        setSubmitting(true)
        setError('')
        setSuccess('')

        try {
            const payload = {
                answer: currentCode,
                quizId: parseInt(quizId),
                examId: parseInt(exam.id),
                isCorrect: true,
                aiNote: aiNote,
            }

            console.log('Sending payload:', payload);

            const response = await fetch('/api/submissions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
            })

            if (!response.ok) {
            const errorText = await response.text()
            throw new Error(errorText || 'Server error')
            }

            const data = await response.json()
            console.log('Submission response:', data);

            if (data.error) throw new Error(data.error)

            setQuizzesData(prev => {
            const newState = {
                ...prev,
                [quizId]: {
                ...prev[quizId],
                submissionStatus: 'GRADED',
                educator_is_correct: true,  
                ai_note: "AI NOTE",
                submitted_code: currentCode,
                submission: {
                    ...prev[quizId].submission,
                    status: 'GRADED',
                    answer: currentCode,
                    isCorrect: true,
                    feedback: null,
                    aiNote: "AI NOTE"
                }
                }
            };

            console.log('Updated quizzesData:', newState);
            return newState;
            });

            setSuccess('Code submitted successfully')
            
            /*const aiResponse = await fetch('/api/submissions/ai-feedback', {
                method: 'POST',
                body: JSON.stringify({
                    instruction: quizzesData[quizId].instruction,
                    answer: currentCode,
                    submissionId: parseInt(quizId)
                })
            })
            if (!aiResponse.ok) {
                const aiErrorText = await aiResponse.text()
                console.warn('AI Feedback API error:', aiErrorText)
            } else {
                console.log("Successfully generating ai response");
                console.log(aiResponse);
            }*/

            //PANGGIL API AI UNTUK FEEDBACK
        //     try {
        //     const aiResponse = await fetch('/api/submissions/ai-feedback', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Accept': 'application/json'
        //         },
        //         body: JSON.stringify({
        //             instruction: quizzesData[quizId].instruction,
        //             answer: currentCode,
        //             submissionId: parseInt(quizId) // pastikan ambil id yang benar
        //         })
        //     })

        //     if (!aiResponse.ok) {
        //         const aiErrorText = await aiResponse.text()
        //         console.warn('AI Feedback API error:', aiErrorText)
        //     } else {
        //         const aiData = await aiResponse.json()
        //         console.log('AI Feedback response:', aiData)
        //         // Update aiNote di quizzesData
        //         setQuizzesData(prev => {
        //         const updated = {
        //             ...prev,
        //             [quizId]: {
        //                 ...prev[quizId],
        //                 submission: {
        //                     ...prev[quizId].submission,
        //                     aiNote: aiData.aiNote,
        //                     isCorrect: aiData.isCorrect, // Tambahkan isCorrect dari AI
        //                     status: 'GRADED'
        //                 }
        //             }
        //         }
        //         console.log('Updated quizzesData with AI feedback:', updated);
        //         return updated
        //         })
        //     }
        //     } catch (aiError) {
        //     console.warn('Failed to fetch AI feedback:', aiError)
        //     }
        //     // --- End tambahan ---

        //     // Start polling untuk update status
        //     startPolling(quizId);

        //     // Refresh page setelah delay
        //     setTimeout(() => {
        //     router.refresh()
        //     }, 1000)
        } catch (error) {
            console.error('Submission error:', error);
            setError(error.message || 'Failed to submit code. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }


    /*const startPolling = async (quizId) => {
        let attempts = 0;
        const maxAttempts = 60; // 5 menit dengan interval 5 detik
        const pollInterval = setInterval(async () => {
            try {
                if (attempts >= maxAttempts) {
                    clearInterval(pollInterval);
                    return;
                }

                const response = await fetch(`/api/submissions/status?quizId=${quizId}`);
                const data = await response.json();
                
                console.log('Polling response:', data);

                if (data.status && data.status !== 'GRADING') {
                    setQuizzesData(prev => ({
                        ...prev,
                        [quizId]: {
                            ...prev[quizId],
                            submissionStatus: data.status,
                            submission: {
                                ...prev[quizId].submission,
                                status: data.status,
                                isCorrect: data.isCorrect,
                                feedback: data.feedback,
                                aiNote: data.aiNote
                            }
                        }
                    }));
                    clearInterval(pollInterval);
                }

                attempts++;
            } catch (error) {
                console.error('Polling error:', error);
                clearInterval(pollInterval);
            }
        }, 5000);

        return () => clearInterval(pollInterval);
    };*/

    return (
        <div className="user-task">
            <div className="tab">
                {Object.entries(quizzesData).map(([quizId, quiz]) => {
                    /*console.log(`Rendering tab for quiz ${quizId}:`, {
                        status: quiz.submissionStatus,
                        isCorrect: quiz.educator_is_correct
                    });*/

                    return (
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
                            {quiz.key}
                        </button>
                    );
                })}
            </div>

            <div className="task-content">
                {Object.entries(quizzesData).map(([quizId, quiz]) => {
                    /*console.log(`Rendering content for quiz ${quizId}:`, {
                        status: quiz.submissionStatus,
                        isCorrect: quiz.educator_is_correct
                    });*/

                    return (
                        <div key={quizId} className={`instruction ${activeTab === quizId ? 'show' : ''}`}>
                            <p>{quiz.instruction}</p>
                            
                            {(quiz.submissionStatus === "GRADING" || quiz.submissionStatus === "GRADED") ? (
                                <p>Your answer review:</p>
                            ) : (
                                <p>Input your answer here:</p>
                            )}

                            <Editor
                                height="400px"
                                language="python"
                                value={codes[quizId] || ''}
                                onChange={(value) => handleCodeChange(value, quizId)}
                                theme="vs-dark"
                                className="mb-3"
                                options={{
                                    readOnly: quiz.submissionStatus === "GRADING" || 
                                             (quiz.submissionStatus === "GRADED" && quiz.educator_is_correct),
                                    domReadOnly: quiz.submissionStatus === "GRADING" || 
                                                (quiz.submissionStatus === "GRADED" && quiz.educator_is_correct),
                                    cursorStyle: (quiz.submissionStatus === "GRADING" || 
                                               (quiz.submissionStatus === "GRADED" && quiz.educator_is_correct)) 
                                               ? "line-thin" : "line",
                                    renderValidationDecorations: "off",
                                    minimap: { enabled: false },
                                    lineNumbers: "on",
                                    wordWrap: "on",
                                    automaticLayout: true,
                                }}
                            />

                            {(quiz.submissionStatus === "GRADING" || quiz.submissionStatus === "GRADED") ? (
                                (quiz.submissionStatus === "GRADED" && quiz.educator_is_correct) || quiz.submissionStatus === "GRADING" ? (
                                    <span className="text-secondary">Submitted <span className="bi bi-check"></span></span>
                                ) : (
                                    <button 
                                        onClick={(e) => handleSubmit(e, quizId)}
                                        className="btn-submit-file-user m-0 mt-2"
                                        disabled={submitting || !codes[quizId]?.trim()}>
                                        {submitting ? 'Submitting...' : 'Submit'}
                                    </button>
                                )
                            ) : (
                                <button 
                                    onClick={(e) => handleSubmit(e, quizId)}
                                    className="btn-submit-file-user m-0 mt-2"
                                    disabled={submitting || !codes[quizId]?.trim()}>
                                    {submitting ? 'Submitting...' : 'Submit'}
                                </button>
                            )}

                            {error && <div className="text-danger mt-2">{error}</div>}
                            {success && <div className="text-success mt-2">{success}</div>}

                            {quiz.submissionStatus === 'GRADED' && (
                                <div className={`user-exam-feedback ${quiz.educator_is_correct ? 'correct' : 'false'}`}>
                                    <div>
                                        <p style={{ fontSize: '1rem' }} className="text-body-secondary">Feedbacks:</p>
                                        <h6 className="p-0 m-0">AI Feedbacks:</h6>
                                        <p>{quiz.ai_note ?? 'No Feedback Added'}</p>
                                        <h6 className="p-0 m-0">Educator Feedbacks:</h6>
                                        <p>{quiz.educator_note ?? 'No Feedback Added'}</p>
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
                    );
                })}
            </div>
        </div>
    )
}