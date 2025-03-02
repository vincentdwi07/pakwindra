import Link from 'next/link'

export default function ExamContent({
                                        id,
                                        subject,
                                        title,
                                        description,
                                        status,
                                        score,
                                        userId,
                                        // minScore,
                                        startDate,
                                        endDate,
                                        quizCount,
                                        studentId
                                    }) {
    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }

    const now = new Date() // Using the provided current time
    const hasStarted = now >= new Date(startDate)
    const hasEnded = now >= new Date(endDate)

    const getExamStatus = () => {
        if (!hasStarted) {
            return 'upcoming'
        }
        if (hasEnded) {
            return 'ended'
        }
        return 'active'
    }

    const examStatus = status

    const Open = () => (
        <Link
            href={`/exam/${id}`}
            className='btn btn-primary'
        >
            Start <i className="bi bi-arrow-right-short"></i>
        </Link>
    )

    const Grading = () => (
        <Link
            href={`/exam/${id}`}
            className='text-secondary'>
            Submitted (in-grading) <i className="bi bi-check-lg"></i>
        </Link>
    )

    const Graded = () => (
        <Link
            href={`/exam/${id}/result`}
            className='btn btn-outline-primary'
        >
            Detail <i className="bi bi-arrow-right-short"></i>
        </Link>
    )

    const Upcoming = () => (
        <div className='text-secondary'>
            Opens {formatDate(startDate)}
        </div>
    )

    const ButtonStatus = () => {
        if (examStatus === 'upcoming') {
            return <Upcoming />
        }

        switch(status) {
            case 'OPEN':
                return <Open />
            case 'GRADING':
                return <Grading />
            case 'GRADED':
                return <Graded />
            default:
                return null
        }
    }

    return (
        <>
            <div className="exam-content">
                <div className="d-flex justify-content-between exam-content-head column-gap-3 flex-wrap">
                        <p>{subject} | {title}</p>
                    <p><span><i className="bi bi-calendar2-week-fill me-2"></i></span>
                        Due {formatDate(endDate)}
                    </p>
                </div>
                <h5>{title}</h5>
                {description && (
                    <p>{description}</p>
                )}

                <div className='d-flex align-items-center justify-content-between'>
                    <div className='d-flex gap-2'>
                        <div className="total-task">
                            <p className="m-0 p-0">
                                <span><i className="bi bi-file-earmark-text me-1"></i></span>
                                {quizCount} {quizCount === 1 ? 'Quiz' : 'Quizzes'}
                            </p>
                        </div>
                        {status === "GRADED" && score !== null ? (
                            ""// <div className={`user-exam-score text-light ${score < min_score ? 'bg-danger' : 'bg-success'}`}><span><i className="bi bi-file-earmark-check-fill me-2"></i></span>{score.toFixed(1)}</div>
                        ):(
                            ''
                        )
                        }
                    </div>
                    <ButtonStatus statusparam={examStatus}/>
                </div>
            </div>
        </>
    )
}