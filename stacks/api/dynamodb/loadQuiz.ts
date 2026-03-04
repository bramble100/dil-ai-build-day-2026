import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { mapToQuiz } from '../helpers/mapToQuiz';
import { Quiz } from '../types';
import { createQuizPrimaryKey, sendGetCommand } from './dynamo';

const loadQuiz = async (id: string): Promise<Quiz> => {
  const command = new GetCommand({
    TableName: process.env.TABLE_NAME!,
    Key: {
      PK: createQuizPrimaryKey(id),
      SK: 'CREATED',
    },
  });

  try {
    const result = await sendGetCommand(command);
    return mapToQuiz(result.Item);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export default loadQuiz;
