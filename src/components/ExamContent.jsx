import Link from 'next/link'

export default function ExamContent({
                                        id,
                                        title,
                                        description,
                                        status,
                                        score,
                                        courseName,
                                        creatorName,
                                        endDate,
                                        quizzes,
                                        timing,
                                        minScore
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

    const quizCount = quizzes.length || 0

    const examStatus = status

    const Open = () => (
        <Link
            href={`/exam/${id}`}
            className='btn btn-outline-dark'
        >
            Start <i className="bi bi-arrow-right-short"></i>
        </Link>
    )

    const Graded = () => (
        <Link
            href={`/exam/${id}`}
            className='btn btn-outline-dark bg-dark text-white'
        >
            Detail <i className="bi bi-arrow-right-short"></i>
        </Link>
    )

    const ButtonStatus = () => {
        if (timing?.status === 'ended'){
            return <Graded/>
        }
        switch(status) {
            case 'OPEN':
                return <Open />
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
                        <p>{courseName} | {creatorName}</p>
                    <p className={timing?.status === 'ended' ? `text-danger` : ''}>
                        <span><i className="bi bi-calendar2-week-fill me-2"></i></span>
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
                        {timing?.status === 'ended' ? (
                            <div className={`user-exam-score text-light bg-danger`}>
                                <p className='mb-0'>Past Due Date</p>
                            </div>
                        ): ''}
                        {status === "GRADED" && score !== null && (
                            <div className={`user-exam-score text-light ${score < minScore ? 'bg-danger' : 'bg-success'}`}>
                                <span><i className="bi bi-file-earmark-check-fill me-2"></i></span>
                                {score.toFixed(1)}
                            </div>
                        )}
                    </div>
                    <ButtonStatus statusparam={examStatus}/>
                </div>
            </div>
        </>
    )
}