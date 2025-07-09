'use client'

import { useState } from 'react'
import Link from "next/link"
import { getExamTiming } from '@/lib/actions/exams'

export default function MentorStudentList({ exam, examId, students, examSubmissions, timing }) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredStudents = students?.filter(student => 
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

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
            <div className="mentor-pill-badge bg-body-secondary">
                OPEN                                      
            </div>
        )
    }

    const statusGrading = () => {
        return (
            <div className="mentor-pill-badge bg-yellow">
                GRADING                                      
            </div>
        )
    }

    const statusGraded = () => {
        return (
            <div className="mentor-pill-badge bg-green">
                GRADED                                      
            </div>
        )
    }

    function formatDateIndo(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    return (
        <>
            <div className="d-flex justify-content-start mb-3">
                <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Search for name" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredStudents.length === 0 ? (
                <h6 className='fw-normal'>Student not found</h6>
            ) : (
                filteredStudents.map(student => {
                    const submission = examSubmissions?.find(sub => sub.studentId === student.user_id)
                    const timing = getExamTiming(exam, new Date(), submission)
                
                    return (
                        <div key={student.user_id} className="exam-content p-0 mt-1 mb-2">
                            <div className="border-bottom d-flex gap-2 align-items-start" style={{ padding: "15px", paddingBottom: "7px" }}>
                                <h4 style={{ verticalAlign: "-0.125em" }}><i className='bi bi-person-fill m-0 p-0'></i></h4>
                                <h4 className="m-0">{student.name}</h4>
                            </div>
                            <div className="d-flex flex-wrap flex-md-nowrap justify-content-between align-items-center" style={{ padding: "15px" }}>
                                    <div className="d-flex gap-2">
                                        <div>
                                            {submissionStatus(submission?.status)}         
                                        </div>
                                        {submission?.status === "GRADED" && (
                                        <>
                                            <div>
                                            {submission?.score !== undefined && (
                                                submission.score < exam?.minScore ? (
                                                <p className="mentor-pill-badge bg-red text-danger mb-0">{submission.score}/100</p>
                                                ) : (
                                                <p className="mentor-pill-badge bg-green text-success mb-0">{submission.score}/100</p>
                                                )
                                            )}
                                            </div>
                                            <div>
                                                {submission?.updatedAt && exam?.endDate && (
                                                    <>
                                                        {new Date(submission.updatedAt) <= new Date(exam.endDate) ? (
                                                            <p className="mentor-pill-badge bg-green text-success mb-0">{formatDateIndo(submission.updatedAt)}</p>
                                                        ) : (
                                                            <p className="mentor-pill-badge bg-red text-danger mb-0">{formatDateIndo(submission.updatedAt)}</p>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </>
                                        )}
                                        <div>
                                            {timing.status === 'ended' ? (
                                                <p className='mentor-pill-badge bg-red text-danger mb-0'>Past Due Date</p>
                                            ) : ''}

                                        </div>
                                    </div>
                                <div>
                                    <Link
                                        href={`${examId}/student/${student.user_id}`}
                                        className='btn btn-outline-dark'
                                    >
                                        Detail <i className="bi bi-arrow-right-short"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )
                })
            )}
        </>
    )
}