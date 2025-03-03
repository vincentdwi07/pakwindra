// File: /components/CodeUploadForm.jsx
import React from 'react';

const CodeUploadForm = ({
                            onFileUpload,
                            fileContent,
                            fileName,
                            isEvaluating,
                            onEvaluate,
                            error
                        }) => {
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.py')) {
            onFileUpload('', '');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            onFileUpload(event.target.result, file.name);
        };
        reader.readAsText(file);
    };

    return (
        <div className="card">
            <div className="card-header">
                <h5 className="mb-0">Submit Your Solution</h5>
            </div>
            <div className="card-body">
                <div className="mb-3">
                    <label htmlFor="fileUpload" className="form-label">Upload Python File</label>
                    <input
                        className="form-control"
                        type="file"
                        id="fileUpload"
                        accept=".py"
                        onChange={handleFileChange}
                    />
                    <div className="form-text">Only .py files are accepted</div>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {fileContent && (
                    <div className="mb-3">
                        <label className="form-label">File Content: {fileName}</label>
                        <pre className="bg-light p-3 border rounded" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {fileContent}
            </pre>
                    </div>
                )}

                <button
                    className="btn btn-primary"
                    onClick={onEvaluate}
                    disabled={isEvaluating || !fileContent}
                >
                    {isEvaluating ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Evaluating...
                        </>
                    ) : (
                        'Evaluate Code'
                    )}
                </button>
            </div>
        </div>
    );
};

export default CodeUploadForm;