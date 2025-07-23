import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '2m', target: 150 },
    { duration: '2m', target: 0 },
  ],
};

const baseUrl = 'https://evaluasikode.site';
const submissionUrl = `${baseUrl}/api/submissions`;

const examId = 53;
const quizId = 143;
const studentId = 43;

const payload = JSON.stringify({
  answer: 'print("Hello World")',
  quizId: quizId,
  examId: examId,
});

const params = {
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..XkjZPEU_oc9N9L3T.wSxYcNlQGTBYH4veWVEx9tyRqh57-1UgmyAjT_T1LYfaKQdEt35TIs24UKgQd1Qnv2MITw92oVSQDgMCkFD673TmCyM1_s7fhsfy9FruyScfOZshvL9FyjpgAfGkdMmb7icqqmfPrULSfnvD2n_A3etPwazPA1FzRynlFQEuD5UuDBZVWhrYYeyfRcpuDIDrHhf0kjJOAIqjFOBZ5dCXWpc6Jg.CKKVAJMEBBZo1ZiTg-jAOQ',
  },
};

export default function () {
  // Step 1: Submit the answer
  const submitRes = http.post(submissionUrl, payload, params);

  check(submitRes, {
    'submission status is 200': (r) => r.status === 200,
  });

  if (submitRes.status !== 200) {
    console.error('Submission failed:', submitRes.body);
    return;
  }

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

  // Step 2: Polling
  const pollUrl = `${submissionUrl}?examId=${examId}&studentId=${studentId}`;
  let currentStatus = 'GRADING';
  let retries = 0;
  const maxRetries = 20; // maksimal 40 detik (20 x 2)

  while (retries < maxRetries) {
    sleep(2);

    const pollRes = http.get(pollUrl, params);
    let pollData;
    try {
      pollData = JSON.parse(pollRes.body);
    } catch (e) {
      console.error('Failed to parse poll response:', pollRes.body);
      break;
    }

    const targetQuiz = pollData.quizzes?.find(q => q.quiz_id === quizId);
    if (!targetQuiz) break;

    currentStatus = targetQuiz.status;
    if (currentStatus === 'GRADED') break;
    retries++;
  }

  check(currentStatus, {
    'status is GRADED': (s) => s === 'GRADED',
  });

  sleep(1); // short delay before next iteration
}
