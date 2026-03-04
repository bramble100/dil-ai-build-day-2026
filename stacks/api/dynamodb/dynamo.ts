import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const createQuizPrimaryKey = (id: string) => `QUIZ#${id}`;
export const sendGetCommand = (command: GetCommand) => docClient.send(command);
export const sendPutCommand = (command: PutCommand) => docClient.send(command);
