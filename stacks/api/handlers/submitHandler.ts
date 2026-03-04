import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok } from '../responses';
import { mapToQuizUserSubmission } from '../helpers/mappers';
import { saveUserSubmission } from '../dynamodb/saveUserSubmission';

const submitHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const quizId = event.pathParameters?.id;

  const submission = {
    quizId,
    answers: [
      { questionId: 'aeabd6d2-7782-40a9-83e6-885c09e9bdf3', selectedChoice: 'A' },
      { questionId: 'd78116ff-62be-4019-a95a-355586f2ec09', selectedChoice: 'B' },
      { questionId: 'a7d890c5-aaa7-409a-a31b-87a8b86cdbb4', selectedChoice: 'C' },
    ],
  };
  const output = await saveUserSubmission(mapToQuizUserSubmission(submission));
  return ok(event, { output });
};

export default submitHandler;
