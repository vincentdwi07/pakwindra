import Link from 'next/link'

export default function ExamContent({
                                        id,
                                        courseName,
                                        creator,
                                        title,
                                        description,
                                        endDate,
                                        quizCount
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

    return (
        <>
            <div className="exam-content">
                <div className="d-flex justify-content-between exam-content-head column-gap-3 flex-wrap">
                        <p>{courseName} | {creator}</p>
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
                    </div>
                    <Link
                        href={`dashboard/exam/${id}/`}
                        className='btn btn-outline-dark'
                    >
                        Detail <i className="bi bi-arrow-right-short"></i>
                    </Link>
                </div>
            </div>
        </>
    )
}