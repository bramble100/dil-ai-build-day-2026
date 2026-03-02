import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { jsonResponse, ok } from '../responses';
import { ChoiceKey } from '../types';
import fetchQuiz from '../dynamodb/fetchQuiz';
import saveAnswers from '../dynamodb/saveAnswers';

const VALID_CHOICES: ChoiceKey[] = ['A', 'B', 'C', 'D'];

export const submitHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Parse body
  let body: Record<string, unknown> = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(event, 400, { error: 'Invalid JSON in request body.' });
  }

  // Validate quizId
  const quizId = body.quizId;
  if (!quizId || typeof quizId !== 'string' || quizId.trim().length === 0) {
    return jsonResponse(event, 400, { error: 'quizId is required.' });
  }

  // Validate answers map
  const answers = body.answers;
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return jsonResponse(event, 400, { error: 'answers must be an object mapping questionId to a choice (A–D).' });
  }

  const answerMap = answers as Record<string, unknown>;

  // Validate each entry
  for (const [questionId, choice] of Object.entries(answerMap)) {
    if (!VALID_CHOICES.includes(choice as ChoiceKey)) {
      return jsonResponse(event, 400, {
        error: `Invalid choice "${choice}" for question "${questionId}". Must be one of A, B, C, D.`,
      });
    }
  }

  // Verify quiz exists before saving
  const quiz = await fetchQuiz(quizId.trim());
  if (!quiz) {
    return jsonResponse(event, 404, { error: `Quiz "${quizId}" not found.` });
  }

  await saveAnswers(quizId.trim(), answerMap as Record<string, ChoiceKey>);

  console.log(`[submitHandler] Answers saved for quiz ${quizId} (${Object.keys(answerMap).length} answers)`);

  return ok(event, { message: 'Answers submitted successfully.', event });
// const submitHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//   return ok(event, { message: event.path, event });
};

export default submitHandler;
