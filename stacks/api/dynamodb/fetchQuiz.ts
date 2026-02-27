import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { ChoiceKey, Question } from '../types';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export interface QuizRecord {
  PK: string;
  topic: string;
  difficulty: string;
  questions: Question[];
  userAnswers?: Record<string, ChoiceKey>; // set after /submit is called
}

/**
 * Fetches the full quiz record from DynamoDB by quizId.
 * Returns null if the quiz does not exist.
 */
const fetchQuiz = async (quizId: string): Promise<QuizRecord | null> => {
  const command = new GetCommand({
    TableName: process.env.TABLE_NAME!,
    Key: { PK: `QUIZ#${quizId}` },
  });

  const result = await docClient.send(command);

  if (!result.Item) {
    return null;
  }

  return result.Item as QuizRecord;
};

export default fetchQuiz;
