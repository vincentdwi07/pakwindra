'use client';
import MentorNavbar from "@/components/Mentor/MentorNavbar";
import "@/styles/user.css";
import { useState } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { useRouter } from "next/navigation";

export default function CreateExamPage() {
    const router = useRouter();
    // Form data untuk menyimpan data Exam
    const [formData, setFormData] = useState({
        title: '',
        courseName: '',
        description: '',
        dueDate: null,
        minScore: 75 
    });

    // Date untuk dueDate
    const [date, setDate] = useState('');

    // Sistem untuk mengatur QUIZ (quizKomponen)
    const [quizComponents, setQuizComponents] = useState([{ 
        id: 1,
        file: null,
        submissionLimit: null,
        instruction: '',
        rubrik: '',
        language: 'Python'
    }]);

    // Fungsi untuk menambah komponen quiz
    const addQuizComponent = (e) => {
        e.preventDefault();
        setQuizComponents([...quizComponents, {
            id: quizComponents.length + 1,
            file: null,
            submissionLimit: null,
            instruction: '',
            rubrik: '',
            language: 'Python'
        }]);
    };

    const deleteQuizComponent = (e, idToDelete) => {
        e.preventDefault();
        if (quizComponents.length > 1) { // Keep at least one component
            setQuizComponents(quizComponents.filter(comp => comp.id !== idToDelete));
        }
    };

    // Fungsi untuk merubah input form data Exam
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    // FUngsi untuk merubah input file pada Quiz[id]
    const handleFileChange = (e, id) =>{
        const file = e.target.files[0];
        if (file && !file.type.includes('pdf')) {
            setError('Please upload PDF files only');
            return;
        }
        setQuizComponents(prev => prev.map(comp => 
            comp.id === id? {...comp, file} : comp
        ))
        setError(''); 
    }

    //Fungsi untuk merubah input limir pada Quiz[id]
    const handleSubmissionLimit = (e, id) => {
        const value = e.target.value;
        const limit = value === '' ? null : parseInt(value);
        setQuizComponents(prev => prev.map(comp => 
            comp.id === id ? {...comp, submissionLimit: limit} : comp
        ));
    }

    const handleInstruction = (e, id) => {
        const value = e.target.value;
        const instruction = value === '' ? null : value;
        setQuizComponents(prev => prev.map(comp => 
            comp.id === id ? {...comp, instruction: instruction} : comp
        ));
    }

    const handleRubrik = (e, id) => {
        const value = e.target.value;
        const rubrik = value === '' ? null : value;
        setQuizComponents(prev => prev.map(comp => 
            comp.id === id ? {...comp, rubrik: rubrik} : comp
        ));
    }
    
    const handleLanguage = (e, id) => {
        const value = e.target.value;
        setQuizComponents(prev => prev.map(comp => 
            comp.id === id ? {...comp, language: value} : comp
        ));
    }

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Form Data:', formData);
        console.log('Date:', date);
        console.log('Quiz Components:', quizComponents);

        if (!formData.title || !formData.courseName || !formData.description || !date) {
            setError('Please fill in all required fields');
            return;
        }

        const missingRubrikOrLang = quizComponents.some(q => !q.rubrik || !q.language);
        if (missingRubrikOrLang) {
            setError('Please fill in rubrik and language for all quizzes');
            return;
        }

        // const missingFiles = quizComponents.some(comp => !comp.file);
        // if (missingFiles) {
        //     setError('Please upload PDF files for all quizzes');
        //     return;
        // }

        setIsSubmitting(true);

        try {
            console.log('Starting file uploads...');

            const quizFiles = await Promise.all(
                quizComponents.map(async (quiz) => {
                    let uploaded = {};

                    if (quiz.file) {
                        const formData = new FormData();
                        formData.append('file', quiz.file);

                        const uploadRes = await fetch('/api/exams/upload', {
                            method: 'POST',
                            body: formData
                        });

                        if (!uploadRes.ok) {
                            const errorText = await uploadRes.text();
                            console.error('Upload error response:', errorText);
                            throw new Error(`File upload failed for quiz ${quiz.id}: ${errorText}`);
                        }

                        const uploadResult = await uploadRes.json();
                        uploaded = {
                            filePath: uploadResult.filePath,
                            fileUrl: uploadResult.fileUrl,
                            filename: quiz.file.name
                        };
                    }

                    return {
                        ...quiz,
                        ...uploaded
                    };
                })
            );



            const payload = {
                title: String(formData.title),
                courseName: String(formData.courseName),
                description: String(formData.description),
                dueDate: date.toISOString(),
                minScore: Number(formData.minScore),
                quizzes: quizFiles.map((quiz) => ({
                    filePath: String(quiz.filePath) || null,
                    fileUrl: String(quiz.fileUrl) || null,
                    submissionLimit: quiz.submissionLimit ? Number(quiz.submissionLimit) : null,
                    filename: String(quiz.filename) || "",
                    instruction: quiz.instruction || "",
                    rubrik: String(quiz.rubrik) || "",
                    language: String(quiz.language) || ""
                }))
            };


            // Make request with explicit headers
            const examResponse = await fetch('/api/exams/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            
            const responseText = await examResponse.text();
            console.log('Raw Response:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                throw new Error(`Invalid JSON response: ${responseText}`);
            }

            if (!examResponse.ok) {
                console.error('API Error:', data);
                throw new Error(data.error || `Server error: ${examResponse.status}`);
            }

            if (data.success) {
                setError('');
                setSuccess('Exam created successfully!');
                
                setTimeout(() => {
                    router.push('/mentor/dashboard');
                }, 1500);
            } else {
                throw new Error(data.error || 'Unknown error occurred');
            }

        } catch (error) {
            console.error("Error creating exam:", error);
            setSuccess('');
            setError(error.message || 'Failed to create exam. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = (e) =>{
        e.preventDefault();
        router.push('/mentor/dashboard');
    }

    return (
        <div className="user-dashboard position-relative">
            <MentorNavbar />

            <div className="user-dashboard-content w-100">
                <h3 className="mb-3">Create New Exam</h3>
                <div className="container m-0">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-8 p-0">
                                <div className="d-flex flex-column mb-3 pe-4">
                                    <label htmlFor="title">Title</label>
                                    <input 
                                        id="title" 
                                        type="text" 
                                        className="mentor-add-exam-input" 
                                        placeholder="Enter exam title" 
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="d-flex flex-column mb-3 pe-4">
                                    <label htmlFor="courseName">Course Name</label>
                                    <input 
                                        id="courseName" 
                                        type="text" 
                                        className="mentor-add-exam-input" 
                                        placeholder="Enter course name, ex: Algoritma"
                                        value={formData.courseName}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                                <div className="d-flex flex-column mb-3 pe-4">
                                    <label htmlFor="description">Exam Description</label>
                                    <textarea 
                                        rows="4" 
                                        id="description" 
                                        type="text" 
                                        className="mentor-add-exam-input" 
                                        placeholder="Enter exam description" 
                                        value={formData.description}
                                        onChange={handleInputChange}    
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-4 p-0">
                                <div className="d-flex flex-column mb-3 w-100">
                                    <div className="d-flex flex-column mb-3 w-100">
                                        <label htmlFor="due-date">Due Date</label>
                                        <Flatpickr
                                            className="mentor-add-exam-input"
                                            value={date}
                                            options={{ 
                                                dateFormat: "Y-m-d H:i", 
                                                minDate: "today",
                                                enableTime: true,
                                                time_24hr: true,
                                                defaultHour: 23,
                                                defaultMinute: 59, 
                                                minuteIncrement: 1,
                                            }}
                                            onChange={([selectedDate]) => {
                                                if (selectedDate) {
                                                    selectedDate.setHours(23, 59, 0);
                                                    setDate(selectedDate);
                                                }
                                            }}
                                            placeholder="Select due date"
                                            required
                                        />
                                    </div>
                                    <div className="d-flex flex-column mb-3 w-100">
                                        <label htmlFor="minScore">Minimum Score</label>
                                        <input 
                                            id="minScore"
                                            type="number"
                                            className="mentor-add-exam-input"
                                            placeholder="Enter minimum score"
                                            value={formData.minScore}
                                            onChange={handleInputChange}
                                            min={0}
                                            max={100}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-12 p-0">
                                <p>Add Quiz</p>
                                {quizComponents.map((component) => (
                                    <div key={component.id} className="mentor-add-quiz-component mb-3">
                                        <div className="d-flex gap-3 justify-content-between">
                                            <div className="d-flex gap-3 flex-grow-1 align-items-start">
                                                <p className="fw-normal mb-0 border rounded-1 bg-body-secondary p-2 px-3">{component.id}</p>
                                                <div className="w-100 mentor-quiz-field-input">
                                                    <div>
                                                        <div className="d-flex flex-column">
                                                            <label htmlFor="" className="text-muted mb-2">Quiz Instruction (Leave this field blank for Instruction with PDF File)</label>
                                                            <textarea
                                                                id={`quizText-${component.id}`}
                                                                className="form-control mb-3 mentor-add-exam-input"
                                                                rows="4"
                                                                placeholder="Enter quiz instructions..."
                                                                value={component.instruction || ""}
                                                                onChange={(e) => handleInstruction(e, component.id)}
                                                            />
                                                        </div>

                                                        <div className="d-flex flex-column">
                                                            <label htmlFor="" className="text-muted mb-2">Quiz Instruction PDF File (Leave this field blank for text instruction only)</label>
                                                            <input 
                                                                className="form-control mb-4 mentor-add-exam-input" 
                                                                type="file" 
                                                                id={`formFile-${component.id}`} 
                                                                accept=".pdf"
                                                                onChange={(e) => handleFileChange(e, component.id)}
                                                            />
                                                        </div>

                                                        <div className="d-flex flex-column">
                                                            <label htmlFor="" className="text-muted mb-2">Quiz Language</label>
                                                            <select
                                                                className="form-select mb-3 mentor-add-exam-input"
                                                                value={component.language || ""}
                                                                onChange={(e) => handleLanguage(e, component.id)}
                                                                required
                                                            >
                                                                <option value="Python">Python</option>
                                                                <option value="Java">Java</option>
                                                                <option value="PHP">PHP</option>
                                                                <option value="C">C</option>
                                                                <option value="JavaScript">JavaScript</option>
                                                            </select>
                                                        </div>


                                                        <div className="d-flex flex-column">
                                                            <label htmlFor="" className="text-muted mb-2">Quiz Rubrik</label>
                                                            <textarea
                                                                id={`quizText-${component.id}`}
                                                                className="form-control mb-3 mentor-add-exam-input"
                                                                rows="4"
                                                                placeholder="Enter quiz rubrik..."
                                                                value={component.rubrik || ""}
                                                                required
                                                                onChange={(e) => handleRubrik(e, component.id)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="d-flex flex-column">
                                                        <label htmlFor="" className="text-muted mb-2">Set quiz submission limit (Leave this field blank for unlimited submission limit)</label>
                                                        <input 
                                                            className="form-control mentor-add-exam-input" 
                                                            type="number" 
                                                            id={`submissionLimit-${component.id}`} 
                                                            placeholder="Unlimited"
                                                            min={1}
                                                            value={component.submissionLimit || ''}
                                                            onChange={(e) => handleSubmissionLimit(e, component.id)}
                                                        />
                                                    </div>

                                                </div>
                                            </div>
                                            <div className="d-flex align-items-end justify-content-center">                            
                                                {quizComponents.length > 1 ? (
                                                    <button 
                                                        onClick={(e) => deleteQuizComponent(e, component.id)}
                                                        className="btn btn-danger mt-2"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                ):(
                                                    <div></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button 
                                    onClick={addQuizComponent}
                                    className="btn-mentor-add-quiz-component bg-dark"
                                >
                                    <i className="bi bi-plus"></i>Tambah Quiz
                                </button>
                            </div>
                            <div className="d-flex gap-2 mt-5 justify-content-end m-0 p-0">
                                <button 
                                    type="submit" 
                                    className="btn btn-success"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="loader"></div>
                                    ) : "Publish"}
                                </button>

                                <button 
                                    type="button" 
                                    className="btn btn-danger"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                            </div>

                            <p className="text-danger">{error}</p>
                            <p className="text-success">{success}</p>
                        </div>
                    
                    </form>
                </div>
            </div>
        </div>
    )
}


