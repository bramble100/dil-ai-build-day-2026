import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequest, ok } from '../responses';
import loadQuiz from '../dynamodb/loadQuiz';
import loadSubmissions from '../dynamodb/loadSubmissions';

const evaluateHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const quizId = event.pathParameters?.id;

  if (!quizId) {
    return badRequest(event, event.path);
  }

  const quiz = await loadQuiz(quizId);
  const submissions = await loadSubmissions(quizId);

  const totalCount = quiz.questions.length;
  const correctCount = 2;
  return ok(event, { submissions, ratio: correctCount / totalCount });
};

export default evaluateHandler;
