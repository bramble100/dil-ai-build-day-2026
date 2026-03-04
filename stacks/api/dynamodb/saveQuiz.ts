import { PutCommandOutput, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Quiz } from '../types';
import { createQuizPrimaryKey, sendPutCommand } from './dynamo';

const saveQuiz = async (quiz: Quiz): Promise<PutCommandOutput> => {
  const command = new PutCommand({
    TableName: process.env.TABLE_NAME!,
    Item: {
      PK: createQuizPrimaryKey(quiz.id),
      SK: 'CREATED',
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      questions: quiz.questions,
    },
  });

  return await sendPutCommand(command);
};

export default saveQuiz;
