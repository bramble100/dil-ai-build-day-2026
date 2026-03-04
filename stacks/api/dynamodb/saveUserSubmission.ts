import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { QuizUserSubmission } from '../types';
import { createQuizPrimaryKey, sendPutCommand } from './dynamo';

export const saveUserSubmission = async (submission: QuizUserSubmission) => {
  const command = new PutCommand({
    TableName: process.env.TABLE_NAME!,
    Item: {
      PK: createQuizPrimaryKey(submission.quizId),
      SK: 'SUBMISSION',
      selectedChoices: submission.answers,
    },
  });

  return await sendPutCommand(command);
};
