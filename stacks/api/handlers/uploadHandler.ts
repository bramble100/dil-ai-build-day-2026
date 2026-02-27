import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { jsonResponse, ok } from '../responses';
import { Difficulty, QuizConfig } from '../types';
import { createQuizFromUploadedFile } from '../bedrock/createQuiz';
import { uploadPdf } from '../s3/uploadPdf';
import saveQuiz from '../dynamodb/saveQuiz';

const DEFAULT_DIFFICULTY: Difficulty = 'beginner';
const DEFAULT_QUESTION_COUNT = 5;
const VALID_DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];

// API Gateway payload limit is 10MB; base64 encoding inflates by ~33%,
// so the raw PDF limit is effectively ~7.5MB.
const MAX_BASE64_LENGTH = 10 * 1024 * 1024;

export const uploadHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Parse request body
  let body: Record<string, unknown> = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON in request body.' });
  }

  // Validate the base64-encoded PDF
  const fileBase64 = body.file;
  if (!fileBase64 || typeof fileBase64 !== 'string' || fileBase64.trim().length === 0) {
    return jsonResponse(400, { error: 'A base64-encoded PDF must be provided in the "file" field.' });
  }

  if (fileBase64.length > MAX_BASE64_LENGTH) {
    return jsonResponse(413, { error: 'PDF file exceeds the maximum allowed size of ~7.5MB.' });
  }

  // Decode base64 → raw Buffer
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = Buffer.from(fileBase64, 'base64');
  } catch {
    return jsonResponse(400, { error: 'Failed to decode the base64 file content.' });
  }

  // Validate optional topic label (used as a descriptive name for the quiz)
  const rawTopic = body.topic;
  const topic =
    typeof rawTopic === 'string' && rawTopic.trim().length > 0
      ? rawTopic.trim()
      : 'Uploaded document';

  // Validate optional difficulty
  const rawDifficulty = body.difficulty;
  const difficulty: Difficulty =
    typeof rawDifficulty === 'string' && VALID_DIFFICULTIES.includes(rawDifficulty as Difficulty)
      ? (rawDifficulty as Difficulty)
      : DEFAULT_DIFFICULTY;

  // Validate optional question count
  const rawCount = body.count;
  const questionCount =
    typeof rawCount === 'number' && rawCount > 0 && rawCount <= 20
      ? rawCount
      : DEFAULT_QUESTION_COUNT;

  const config: QuizConfig = { topic, difficulty, questionCount };

  console.log('[uploadHandler] Processing PDF upload, config:', config);

  // Generate quiz from PDF content
  const quiz = await createQuizFromUploadedFile(pdfBuffer, config);

  // Upload the original PDF to S3 for traceability (keyed by quizId)
  await uploadPdf(quiz.id, pdfBuffer);

  // Persist quiz to DynamoDB
  await saveQuiz(quiz);

  console.log(`[uploadHandler] Quiz created: ${quiz.id} (${quiz.questions.length} questions)`);

  return ok({
    quizId: quiz.id,
    topic: quiz.topic,
    difficulty: quiz.difficulty,
    questions: quiz.questions,
  });
};

export default uploadHandler;
