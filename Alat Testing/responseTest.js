import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 20, 
  duration: '120s', 
};

const baseUrl = 'https://evaluasikode.site';
const submissionUrl = `${baseUrl}/api/submissions`;

// Test data
const examId = 53;
const quizId = 143;
const studentId = 43; // You need to get this from your test user

const payload = JSON.stringify({
  answer: 'print("Hello World")',
  quizId: quizId,
  examId: examId,
});

const params = {
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..lmwcXhH8k-1lngVf.eCWk7Jzrw8KQz9aBmtAbVLt2MiGm8jIhqO0jJd3cb81TcZGtbWg7hsB6_RV_vKUFUT14TLoXl2wRsXtSW3PhQgB7OPcPM7SMNEntqfy2iQmoGP0e4ftA8demb8E7LaZTnmpPg1Urj3zQ1r-ACJ4GMWgGBisgvu9S25IrHuQoM_gmy7j7_n-SdIasOFTSTXKeafGGI9-rRZEWl33u94-foh-dng.OZBCyMkNQbDDqmAhwCApVg',
  },
};

export default function () {
  // Step 1: Submit the answer
  const submitRes = http.post(submissionUrl, payload, params);
  
  check(submitRes, {
    'submission status is 200': (r) => r.status === 200,
  });

  // Check if submission was successful
  let submitData;
  try {
    submitData = JSON.parse(submitRes.body);
  } catch (e) {
    console.error('Failed to parse submission response:', submitRes.body);
    return;
  }

  if (!submitData.success) {
    console.error('Submission failed:', submitData.error);
    return;
  }

  // Step 2: Poll for the result using the existing GET endpoint
  const pollUrl = `${submissionUrl}?examId=${examId}&studentId=${studentId}`;
  
  let currentStatus = 'GRADING';
  let retries = 0;
  const maxRetries = 30; // Maximum 60 seconds (30 * 2 seconds)
  
  while (retries < maxRetries) {
    sleep(2); // Wait 2 seconds between polls
    
    const pollRes = http.get(pollUrl, params);
    
    // Check if response is valid
    const contentType = pollRes.headers['Content-Type'] || pollRes.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`Non-JSON response, status ${pollRes.status}:`, pollRes.body);
      break;
    }
    
    let pollData;
    try {
      pollData = JSON.parse(pollRes.body);
    } catch (e) {
      console.error('Failed to parse poll response:', pollRes.body);
      break;
    }
    
    // Find the quiz we submitted
    const targetQuiz = pollData.quizzes?.find(q => q.quiz_id === quizId);
    if (targetQuiz) {
      currentStatus = targetQuiz.status;
    } else {
      console.error('Quiz not found in response');
      break;
    }

    currentStatus = targetQuiz.status;
    if (currentStatus === 'GRADED') break;
    retries++;
  }
  
  // Step 3: Check final status
  check(currentStatus, {
    'status is GRADED': (s) => s === 'GRADED',
  });
  
  // Log final result
  if (currentStatus === 'GRADED') {
    console.log('✓ Submission processed successfully');
  } else if (retries >= maxRetries) {
    console.log('✗ Timeout waiting for grading to complete');
  } else {
    console.log(`✗ Unexpected status: ${currentStatus}`);
  }
  
  sleep(1);
}