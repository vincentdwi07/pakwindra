// File: /app/page.jsx
'use client';

import { SetStateAction, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import CodeUploadForm from '@/app/code-evaluator/components/CodeUploadForm';
import EvaluationResults from '@/app/code-evaluator/components/EvaluationResults';
import {evaluateCode} from '@/app/code-evaluator/utils/codeEvaluator';
import QuestionDisplay from '@/app/code-evaluator/components/QuestionDisplay';

const evaluationCache = new Map();

export default function Testing() {
    const [fileContent, setFileContent] = useState('');
    const [fileName, setFileName] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evaluation, setEvaluation] = useState(null);
    const [error, setError] = useState('');



    // Default question from lecturer
    const defaultQuestion = `Dengan penggalan program berikut:
a = [3, 1, 5, 3, 8, 1, 0]
b = [3, 1, 5, 3, 8, 2, 0]
Uji apakah kedua array memiliki elemen yang sama. Jika sama, tampilkan sama, jika ada 1 saja yang tidak sama, tampilkan tidak sama.`;

    // Create a cache key from the input parameters
    const cacheKey = `${fileContent}_${fileName}_${defaultQuestion}`;

    // Check if we have a cached result
    /*if (evaluationCache.has(cacheKey)) {
        console.log("Returning cached evaluation result");
        //return evaluationCache.get(cacheKey);
        setEvaluation(evaluationCache.get(cacheKey));
    }*/


    const handleFileUpload = (content: SetStateAction<string>, name: SetStateAction<string>) => {
        setFileContent(content);
        setFileName(name);
        setError('');
        setEvaluation(null);
    };

    const handleEvaluate = async () => {
        if (!fileContent) {
            setError('Please upload a Python file first');
            return;
        }

        setIsEvaluating(true);
        setError('');

        try {
            const result = await evaluateCode(fileContent, fileName, defaultQuestion);
            evaluationCache.set(cacheKey, result);
            setEvaluation(result);
        } catch (err) {
            console.error("Error in code evaluation:", err);
            setError("Failed to evaluate code. Make sure Ollama server is running.");
        } finally {
            setIsEvaluating(false);
        }
    };

    return (
        <div className="container py-5">
            <h1 className="mb-4">Python Code Evaluator</h1>

            <div className="row">
                <div className="col-lg-12 mb-4">
                    <QuestionDisplay question={defaultQuestion} />
                </div>

                <div className="col-lg-12 mb-4">
                    <CodeUploadForm
                        onFileUpload={handleFileUpload}
                        fileContent={fileContent}
                        fileName={fileName}
                        isEvaluating={isEvaluating}
                        onEvaluate={handleEvaluate}
                        error={error}
                    />
                </div>

                {evaluation && (
                    <div className="col-lg-12">
                        <EvaluationResults evaluation={evaluation} />
                    </div>
                )}
                {/*<div className="col-lg-12">
                    <EvaluationResults evaluation={evaluation} />
                </div>*/}
            </div>
        </div>
    );
}