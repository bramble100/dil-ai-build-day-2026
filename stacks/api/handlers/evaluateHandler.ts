import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequest, ok } from '../responses';
import loadQuiz from '../dynamodb/loadQuiz';
import loadSubmissions from '../dynamodb/loadSubmissions';

const evaluateHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const quizId = event.pathParameters?.id;

  if (!quizId) {
    return badRequest(event, event.path);
  }

  const questions = (await loadQuiz(quizId)).questions;
  const submissions = (await loadSubmissions(quizId)).answers;

  const totalQuestionsCount = questions.length;
  const correctAnswersCount = 2;

  return ok(event, { submissions, ratio: correctAnswersCount / totalQuestionsCount });
};

export default evaluateHandler;
