'use client'
import { useState } from 'react';
import Link from 'next/link';

export default function ExamContent({subject, title, description, status, score, user_id, min_score}) {
    console.log(min_score)
    return (
        <>
            <div className="exam-content">
                <div className="d-flex justify-content-between exam-content-head column-gap-3 flex-wrap">
                    <p>{subject} | {user_id}</p>
                    <p><span><i className="bi bi-calendar2-week-fill me-2"></i></span>Due 3 Januari 2025, 11:59 PM</p>
                </div>
                <h5>{title}</h5>
                <p>{description}</p>
                
                <div className='d-flex align-items-center justify-content-between'>
                    <div className='d-flex gap-2'>
                        <div className="total-task">
                            <p className="m-0 p-0">
                                <span><i className="bi bi-file-earmark-text me-1"></i></span>
                                10 Tasks
                            </p>
                        </div>
                        {status === "graded" ? (
                                <div className={`user-exam-score text-light ${score < min_score ? 'bg-danger' : 'bg-success'}`}><span><i className="bi bi-file-earmark-check-fill me-2"></i></span>{score}/100</div>
                            ):(
                                ''  
                            )
                        }
                    </div>
                    <div>
                        <Link href={{  }} style={{ textDecoration: "none" }} className='btn-exam-content-start'>
                            Start <span><i className="bi bi-arrow-right-short"></i></span>
                        </Link>
                    </div>
                </div>

            </div>  
        </>
    )
}