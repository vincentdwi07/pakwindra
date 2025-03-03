'use client'
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import '../styles/user.css'
import path from "path"

export default function Quiz({ exam, userId }) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState(exam.quizzes[0]?.id.toString())
    const [selectedFile, setSelectedFile] = useState(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [fileContent, setFileContent] = useState('');


    // Convert quizzes array to an object for easier access
    const quizzesData = exam.quizzes.reduce((acc, quiz) => {
        const submission = quiz.submissions.find(sub => sub.studentId === userId)
        acc[quiz.id] = {
            key: quiz.id,
            instruction: quiz.instruction,
            status: quiz.status,
            submission: submission,
            educator_note: submission?.feedback,
            ai_note: submission?.aiNote,
            educator_is_correct: submission?.isCorrect,
            submission_file_name : submission?.fileName,
            submission_file_url : submission?.fileUrl
        }
        return acc
    }, {})

    const handleFileChange = (event) => {
        const file = event.target.files[0];
    
        if (file) {
            if (file.name.endsWith('.py')) {
                setSelectedFile(file);
                setError('');
    
                const reader = new FileReader();
                reader.onload = (e) => {
                    setFileContent(e.target.result);
                    console.log("Isi file:", e.target.result);
                };
                reader.readAsText(file);
            } else {
                setSelectedFile(null);
                setError('Only Python (.py) files are allowed!');
            }
        }
    };
    

    const handleSubmit = async (event, quizId) => {
        event.preventDefault()
        if (!selectedFile) {
            setError('Please select a file first')
            return
        }
    
        setSubmitting(true)
        setError(null) // Reset error state
    
        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('quizId', quizId)
            formData.append('examId', exam.id)
            formData.append('status', 'GRADING')
    
            const response = await fetch('/api/submissions', {
                method: 'POST',
                body: formData
            })
    
            const data = await response.json()
    
            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit')
            }
    
            // Show success message
            setSuccess('File submitted successfully')
            
            // Refresh the page to show updated data
            router.refresh()
            setSelectedFile(null)
        } catch (error) {
            console.error('Submission error:', error)
            setError(error.message || 'Failed to submit file. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const ReadPreviewSubmitted = ({ url }) => {
        const [fileContent, setFileContent] = useState('');
    
        useEffect(() => {
            if (!url) return;
            
            // Buat fungsi async untuk membaca file
            const readFile = async () => {
                try {
                    // Gunakan fetch biasa untuk membaca file dari public folder
                    const response = await fetch(url);
                    const text = await response.text();
                    setFileContent(text);
                } catch (error) {
                    console.error('Error reading file:', error);
                    setFileContent('Error: Could not load file content');
                }
            };
    
            readFile();
        }, [url]);
    
        if (!url) return null;
    
        return (
            <div className="mt-4">
                <pre className="border p-2 mt-2 bg-body-tertiary rounded-2 overflow-auto" 
                     style={{ maxHeight: '300px' }}>
                    <code>
                        <strong className="text-black">Code Preview: </strong>
                        <br /><br />{fileContent || 'Loading...'}
                    </code>
                </pre>
            </div>
        );
    };
    

    return (
        <div className="user-task">

            {/* Quiz Navigation */}
            <div className="tab">
                {Object.entries(quizzesData).map(([quizId, quiz]) => (
                    <button
                    key={quizId}
                    className={`tablinks ${
                        activeTab === quizId 
                            ? 'active'
                            : quiz.status === 'GRADED'
                                ? quiz.educator_is_correct
                                    ? 'bg-success text-light'
                                    : 'bg-danger text-light'
                                : 'bg-transparent'
                    }`}
                    onClick={() => setActiveTab(quizId)}
                >
                    {quiz.key}
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
                                    disabled={quiz.status === 'GRADING' || quiz.educator_is_correct == true}
                                />

                                {quizzesData[quizId].status === "GRADING" || quizzesData[quizId].status === "GRADED" ? (
                                    (quizzesData[quizId].status === "GRADED" && quizzesData[quizId].educator_is_correct == true || quizzesData[quizId].status === "GRADING"? (
                                        <span className="text-secondary ms-2">Submitted <span className="bi bi-check"></span></span>
                                    ):(
                                        <button type="submit" className="btn-submit-file-user"
                                            disabled={submitting || !selectedFile}>
                                            {submitting ? 'Submitting...' : 'Submit'}
                                        </button>
                                    )
                                ))
                                :(
                                    <button type="submit" className="btn-submit-file-user"
                                            disabled={submitting || !selectedFile}>
                                        {submitting ? 'Submitting...' : 'Submit'}
                                    </button>
                                )}

                                {error && (
                                    <div className="text-danger mt-2">{error}</div>
                                )}

                                {fileContent ? (
                                    <pre className="border p-2 mt-3 bg-body-tertiary rounded-2">
                                        <strong className="text-dark">Code Preview:</strong> 
                                        <br /><br />{fileContent}</pre>
                                ) : (
                                    ''
                                )}

                                {quizzesData[quizId].submission_file_url && (
                                    <>
                                        <ReadPreviewSubmitted url={quizzesData[quizId].submission_file_url} />
                                    </>

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