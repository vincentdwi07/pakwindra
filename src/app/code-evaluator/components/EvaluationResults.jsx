import React from 'react';

const EvaluationResults = ({ evaluation }) => {
    // If evaluation is null or undefined, show a loading message
    if (!evaluation) {
        return (
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">Evaluation Results</h5>
                </div>
                <div className="card-body">
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Check if evaluation is a string (text format)
    if (typeof evaluation === 'string') {
        return (
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">Evaluation Results</h5>
                </div>
                <div className="card-body">
                    <pre className="mb-0 p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                        {evaluation}
                    </pre>
                </div>
            </div>
        );
    }

    // If evaluation is an object, render it in a structured way
    try {
        const {
            correctnessAnalysis,
            testCaseResults,
            errors,
            feedbackAndImprovements,
            overallJudgment
        } = evaluation;

        const getBadgeColor = (passed) => {
            return passed ? "bg-success" : "bg-danger";
        };

        return (
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Evaluation Results</h5>
                    {overallJudgment && typeof overallJudgment.correct !== 'undefined' && (
                        <span className={`badge ${overallJudgment.correct ? 'bg-success' : 'bg-danger'} fs-6`}>
                            {overallJudgment.correct ? 'Correct' : 'Incorrect'}
                        </span>
                    )}
                </div>
                <div className="card-body">
                    {overallJudgment && overallJudgment.summary && (
                        <div className="mb-4">
                            <h5 className="border-bottom pb-2">Overall Assessment</h5>
                            <p>{overallJudgment.summary}</p>
                            {typeof overallJudgment.score !== 'undefined' && (
                                <div className="d-flex align-items-center">
                                    <span className="me-2">Score:</span>
                                    <span className="badge bg-primary fs-6">{overallJudgment.score}/10</span>
                                </div>
                            )}
                        </div>
                    )}

                    {correctnessAnalysis && (
                        <div className="mb-4">
                            <h5 className="border-bottom pb-2">Correctness Analysis</h5>
                            <p className="mb-0">{correctnessAnalysis}</p>
                        </div>
                    )}

                    {testCaseResults && testCaseResults.length > 0 && (
                        <div className="mb-4">
                            <h5 className="border-bottom pb-2">Test Case Results</h5>
                            <div className="list-group">
                                {testCaseResults.map((result, index) => (
                                    <div key={index} className="list-group-item">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h6 className="mb-0">Test Case {result.testCase || (index + 1)}</h6>
                                            {typeof result.passed !== 'undefined' && (
                                                <span className={`badge ${getBadgeColor(result.passed)}`}>
                                                    {result.passed ? 'Passed' : 'Failed'}
                                                </span>
                                            )}
                                        </div>
                                        {result.actualOutput && (
                                            <p className="mb-1">
                                                <strong>Actual Output:</strong> {typeof result.actualOutput === 'object' ?
                                                JSON.stringify(result.actualOutput) : result.actualOutput}
                                            </p>
                                        )}
                                        {result.issues && (
                                            <p className="mb-0 text-danger">
                                                <strong>Issues:</strong> {result.issues}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {errors && errors.length > 0 && (
                        <div className="mb-4">
                            <h5 className="border-bottom pb-2">Errors Found</h5>
                            <ul className="list-group">
                                {errors.map((error, index) => (
                                    <li key={index} className="list-group-item list-group-item-danger">
                                        {typeof error === 'object' ? JSON.stringify(error) : error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {feedbackAndImprovements && Object.keys(feedbackAndImprovements).length > 0 && (
                        <div className="mb-0">
                            <h5 className="border-bottom pb-2">Feedback and Improvements</h5>
                            {feedbackAndImprovements.specificFeedback && (
                                <div className="card mb-3">
                                    <div className="card-header">What's Wrong</div>
                                    <div className="card-body">
                                        <p className="mb-0">{feedbackAndImprovements.specificFeedback}</p>
                                    </div>
                                </div>
                            )}

                            {feedbackAndImprovements.howToFix && (
                                <div className="card mb-3">
                                    <div className="card-header">How to Fix It</div>
                                    <div className="card-body">
                                        <p className="mb-0">{feedbackAndImprovements.howToFix}</p>
                                    </div>
                                </div>
                            )}

                            {feedbackAndImprovements.codeQualitySuggestions &&
                                feedbackAndImprovements.codeQualitySuggestions.length > 0 && (
                                    <div className="card">
                                        <div className="card-header">Code Quality Suggestions</div>
                                        <ul className="list-group list-group-flush">
                                            {feedbackAndImprovements.codeQualitySuggestions.map((suggestion, index) => (
                                                <li key={index} className="list-group-item">
                                                    {typeof suggestion === 'object' ? JSON.stringify(suggestion) : suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        // If anything goes wrong extracting properties, fall back to displaying JSON
        return (
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">Evaluation Results</h5>
                </div>
                <div className="card-body">
                    <pre className="mb-0 p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(evaluation, null, 2)}
                    </pre>
                </div>
            </div>
        );
    }
};

export default EvaluationResults;