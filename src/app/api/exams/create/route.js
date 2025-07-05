import { db } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(req) {
    console.log('=== API Route Started ===');
    
    try {
        // Log request details
        console.log('Request method:', req.method);
        console.log('Request headers:', Object.fromEntries(req.headers.entries()));
        
        const session = await getServerSession(authOptions)
        console.log('Session check:', session ? 'Valid' : 'Invalid');
        
        if (!session?.user || session.user.role !== 'EDUCATOR') {
            console.log('Authorization failed');
            return Response.json({ 
                error: 'Unauthorized',
                success: false
            }, { status: 401 });
        }

        console.log('User authorized:', session.user.id);

        let body;
        let rawBody;
        
        try {
            rawBody = await req.text();
            console.log('Raw body length:', rawBody.length);
            console.log('Raw body preview:', rawBody.substring(0, 200) + '...');
            
            // Then parse as JSON
            body = JSON.parse(rawBody);
            console.log('Parsed body keys:', Object.keys(body));
            console.log('Body title:', body.title);
            console.log('Body quizzes length:', body.quizzes?.length);
            
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.log('Raw body that failed to parse:', rawBody);
            
            return Response.json({
                error: 'Invalid JSON payload',
                details: parseError.message,
                rawBodyLength: rawBody?.length || 0,
                success: false
            }, { status: 400 });
        }
        
        // Validate required fields
        const requiredFields = ['title', 'description', 'courseName', 'dueDate', 'quizzes'];
        const missingFields = requiredFields.filter(field => !body[field]);
        
        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            return Response.json({
                error: 'Missing required fields',
                missingFields,
                success: false
            }, { status: 400 });
        }

        // Validate quizzes array
        if (!Array.isArray(body.quizzes) || body.quizzes.length === 0) {
            console.error('Invalid quizzes data');
            return Response.json({
                error: 'At least one quiz is required',
                success: false
            }, { status: 400 });
        }

        console.log('All validations passed');

        const startDate = new Date();
        const endDate = new Date(body.dueDate);

        // Validate dates
        if (isNaN(endDate.getTime())) {
            console.error('Invalid date');
            return Response.json({
                error: 'Invalid due date format',
                success: false
            }, { status: 400 });
        }

        console.log('Starting database transaction');

        try {
            const result = await db.$transaction(async (tx) => {
                console.log('Creating exam...');
                
                // Create new Exam
                const exam = await tx.exam.create({
                    data: {
                        title: body.title,
                        description: body.description || '',
                        courseName: body.courseName,  
                        startDate: startDate,
                        endDate: endDate,
                        creatorId: parseInt(session.user.id),
                        minScore: parseFloat(body.minScore || 75),  
                    }
                });

                console.log('Exam created with ID:', exam.exam_id);

                // Create Quiz data
                console.log('Creating quizzes...');
                const quizzes = await Promise.all(
                    body.quizzes.map(async (quiz, index) => {
                        console.log(`Creating quiz ${index + 1}:`, {
                            filePath: quiz.filePath,
                            filename: quiz.filename,
                            fileUrl: quiz.fileUrl,
                            submissionLimit: quiz.submissionLimit,
                            language: quiz.language,
                            rubrik: quiz.rubrik
                        });
                        
                        const createdQuiz = await tx.quiz.create({
                            data: {
                                examId: exam.exam_id,
                                filePath: quiz.filePath || null,
                                filename: quiz.filename || null,
                                fileUrl: quiz.fileUrl || null,
                                submission_limit: quiz.submissionLimit || null,
                                instruction: quiz.instruction || '',
                                language: quiz.language || '',
                                rubrik: quiz.rubrik || ''
                            }
                        });
                        
                        console.log(`Quiz ${index + 1} created with ID:`, createdQuiz.quiz_id);
                        return createdQuiz;
                    })
                );

                console.log('All quizzes created');

                // Get all students and create exam submissions
                console.log('Finding students...');
                const students = await tx.user.findMany({
                    where: { role: 'STUDENT' },
                    select: { user_id: true }
                });

                console.log('Found students:', students.length);

                if (students.length > 0) {
                    console.log('Creating exam submissions...');
                    const examSubmissions = await tx.examSubmission.createMany({
                        data: students.map(student => ({
                            examId: exam.exam_id,
                            studentId: student.user_id,
                            status: "OPEN"
                        }))
                    });
                    console.log('Exam submissions created:', examSubmissions.count);
                }

                return { exam, quizzes };
            });

            console.log('Transaction completed successfully');

            return Response.json({
                success: true,
                examId: result.exam.exam_id,
                message: 'Exam created successfully'
            }, { status: 201 });

        } catch (dbError) {
            console.error('Database error details:', {
                message: dbError.message,
                code: dbError.code,
                meta: dbError.meta
            });
            
            return Response.json({
                error: 'Database operation failed',
                details: dbError.message,
                success: false
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Unexpected error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        return Response.json({
            error: error.message || 'Failed to create exam',
            success: false
        }, { status: 500 });
    }
}