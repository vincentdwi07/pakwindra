// File: /components/QuestionDisplay.jsx
import React from 'react';

const QuestionDisplay = ({ question }) => {
    return (
        <div className="card">
            <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Assignment</h5>
            </div>
            <div className="card-body">
                <pre className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{question}</pre>
            </div>
        </div>
    );
};

export default QuestionDisplay;