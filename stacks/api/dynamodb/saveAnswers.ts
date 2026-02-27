import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ChoiceKey } from '../types';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Persists the user's answers onto the existing quiz item in DynamoDB.
 * Uses UpdateItem so the questions array stored by saveQuiz is preserved.
 *
 * @param quizId - The quiz UUID
 * @param answers - Map of questionId → chosen ChoiceKey, e.g. { "Q01": "A", "Q02": "C" }
 */
const saveAnswers = async (quizId: string, answers: Record<string, ChoiceKey>): Promise<void> => {
  const command = new UpdateCommand({
    TableName: process.env.TABLE_NAME!,
    Key: { PK: `QUIZ#${quizId}` },
    UpdateExpression: 'SET userAnswers = :answers, submittedAt = :submittedAt',
    ExpressionAttributeValues: {
      ':answers': answers,
      ':submittedAt': new Date().toISOString(),
    },
    // Only update if the quiz exists — prevents creating orphan answer records
    ConditionExpression: 'attribute_exists(PK)',
  });

  await docClient.send(command);
};

export default saveAnswers;
