import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { mapToQuizUserSubmission } from '../helpers/mappers';
import { QuizUserSubmission } from '../types';
import { createQuizPrimaryKey, sendGetCommand } from './dynamo';

const loadSubmissions = async (quizId: string): Promise<QuizUserSubmission> => {
  const command = new GetCommand({
    TableName: process.env.TABLE_NAME!,
    Key: {
      PK: createQuizPrimaryKey(quizId),
      SK: 'SUBMISSION',
    },
  });

  try {
    const result = await sendGetCommand(command);
    return mapToQuizUserSubmission(result.Item);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export default loadSubmissions;
