import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { jsonResponse, ok } from '../responses';
import { evaluateQuizAnswers } from '../bedrock/createQuiz';
import fetchQuiz from '../dynamodb/fetchQuiz';

const evaluateHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Parse body
  let body: Record<string, unknown> = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON in request body.' });
  }

  // Validate quizId
  const quizId = body.quizId;
  if (!quizId || typeof quizId !== 'string' || quizId.trim().length === 0) {
    return jsonResponse(400, { error: 'quizId is required.' });
  }

  // Fetch quiz (includes questions and userAnswers stored by /submit)
  const quiz = await fetchQuiz(quizId.trim());
  if (!quiz) {
    return jsonResponse(404, { error: `Quiz "${quizId}" not found.` });
  }

  if (!quiz.userAnswers || Object.keys(quiz.userAnswers).length === 0) {
    return jsonResponse(409, { error: 'No answers have been submitted for this quiz yet. Call /submit first.' });
  }

  console.log(`[evaluateHandler] Evaluating quiz ${quizId} (${quiz.questions.length} questions)`);

  const evaluation = await evaluateQuizAnswers(quiz.topic, quiz.questions, quiz.userAnswers);

  return ok(evaluation);
};

export default evaluateHandler;
