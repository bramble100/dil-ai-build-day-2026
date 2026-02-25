import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, PutCommandOutput } from '@aws-sdk/lib-dynamodb';
import { Quiz } from '../types';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const saveQuiz = async (quiz: Quiz): Promise<PutCommandOutput> => {
  const command = new PutCommand({
    TableName: process.env.TABLE_NAME!,
    Item: {
      PK: `QUIZ#${quiz.id}`,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      questions: quiz.questions,
    },
  });

  return await docClient.send(command);
};

export default saveQuiz;
