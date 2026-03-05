import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequest, ok } from '../responses';
import { saveUserSubmission } from '../dynamodb/saveUserSubmission';
import { QuizUserSubmission } from '../types';

const submitHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const quizId = event.pathParameters?.id;
  if (!quizId) {
    return badRequest(event, event.path);
  }

  const body = JSON.parse(event.body || '{}');
  if (!Array.isArray(body.answers)) {
    return badRequest(event, event.path);
  }

  const submission: QuizUserSubmission = {
    quizId,
    answers: body.answers.map((a: { questionId: string; selectedChoice: string }) => ({
      questionId: a.questionId,
      selectedChoice: a.selectedChoice,
    })),
  };

  const output = await saveUserSubmission(submission);
  return ok(event, { output });
};

export default submitHandler;
