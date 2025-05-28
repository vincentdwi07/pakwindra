'use client'

import { useState } from 'react'
import Link from "next/link"

export default function MentorStudentList({ examId, students, examSubmissions }) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredStudents = students?.filter(student => 
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

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
                    const submission = examSubmissions?.find(sub => sub.studentId === student.id)
                
                    return (
                        <div key={student.id} className="exam-content p-0 mt-1 mb-2">
                            <div className="border-bottom d-flex gap-2 align-items-start" style={{ padding: "15px", paddingBottom: "7px" }}>
                                <h4 style={{ verticalAlign: "-0.125em" }}><i className='bi bi-person-fill m-0 p-0'></i></h4>
                                <h4 className="m-0">{student.name}</h4>
                            </div>
                            <div className="d-flex flex-wrap flex-md-nowrap justify-content-between align-items-end" style={{ padding: "15px" }}>
                                <div className="flex-fill">
                                    <div className="row mb-1">
                                        <div className="col-2">
                                            <p className="m-0">Status</p>
                                        </div>
                                        <div className="col-10">
                                            <p className="m-0">: {submission?.status || 'OPEN'}</p>
                                        </div>
                                    </div>
                                    {submission?.status === "GRADED" && (
                                        <>
                                            <div className="row mb-1">
                                                <div className="col-2">
                                                    <p className="m-0">Score</p>
                                                </div>
                                                <div className="col-10">
                                                    <p className="m-0">: {submission?.score ? `${submission.score}/100` : '-'}</p>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-2">
                                                    <p className="m-0">Submitted at</p>
                                                </div>
                                                <div className="col-10">
                                                    <p className="m-0">: {
                                                        submission?.updatedAt 
                                                            ? new Date(submission.updatedAt).toLocaleDateString('id-ID', {
                                                                weekday: 'long',
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric'
                                                            })
                                                            : '-'
                                                    }</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div>
                                    <Link
                                        href={`/mentor/exam/${examId}/student/${student.id}`}
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