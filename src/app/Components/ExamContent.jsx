'use client'
import { useState } from 'react';
import Link from 'next/link';

export default function ExamContent() {
    const [isOpen, setIsOpen] = useState(false); // Set default ke false agar tertutup

    return (
        <>
            <div className="exam-content">
                <div className="d-flex justify-content-between exam-content-head">
                    <p>Algoritma</p>
                    <p><span><i class="bi bi-calendar2-week-fill me-2"></i></span>Due 3 Januari 2025, 11:59 PM</p>
                </div>
                <h5>Lesson 1: Belajar Bebek</h5>
                <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laboriosam, recusandae obcaecati nesciunt quis commodi dignissimos nostrum pariatur ullam, atque explicabo, in consequuntur porro. Rerum, ea perferendis adipisci qui iste placeat!</p>
                
                <div className='d-flex align-items-center justify-content-between'>
                    <div className='d-flex gap-2'>
                        <div className="total-task">
                            <p className="m-0 p-0">
                                <span><i className="bi bi-file-earmark-text me-1"></i></span>
                                10 Tasks
                            </p>
                        </div>
                        <button 
                            className={`accordion-button btn-user-feedback ${!isOpen ? 'collapsed' : ''}`}
                            type="button"   
                            onClick={() => setIsOpen(!isOpen)}
                            aria-expanded={isOpen}
                        >
                            <span><i className="bi bi-chat-left-text-fill me-2"></i></span>
                            Feedbacks
                            <span><i className={`bi bi-caret-up-fill ms-1 ${isOpen ? '' : 'rotated'}`}></i></span>
                        </button>
                    </div>
                    <div>
                        <Link href={{  }} style={{ textDecoration: "none" }} className='btn-exam-content-start'>
                            Start <span><i class="bi bi-arrow-right-short"></i></span>
                        </Link>
                    </div>
                </div>

            </div>  
            <div 
                className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}
            >
                <div className="accordion-body">
                    <strong><p className='m-0 p-0'>Pak Windra:</p></strong>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nemo doloremque cumque adipisci facere nostrum incidunt cupiditate, voluptatem voluptatum magnam eligendi minus sequi illo excepturi sit expedita consequatur ullam reprehenderit explicabo?</p>
                    <strong><p className='m-0 p-0'>Chat GPT:</p></strong>
                    <p className='p-0 m-0'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nemo doloremque cumque adipisci facere nostrum incidunt cupiditate, voluptatem voluptatum magnam eligendi minus sequi illo excepturi sit expedita consequatur ullam reprehenderit explicabo?</p>
                </div>
            </div>

        </>
    )
}