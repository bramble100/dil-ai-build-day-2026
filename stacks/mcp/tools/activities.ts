import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));

export const getActivities = async (dogName: string, limit = 10): Promise<string> => {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: process.env.ACTIVITY_TABLE!,
      KeyConditionExpression: 'dogName = :dog',
      ExpressionAttributeValues: { ':dog': dogName },
      ScanIndexForward: false,
      Limit: limit,
    }),
  );

  const items = result.Items ?? [];
  console.log(`[get_activities] Returning ${items.length} records for ${dogName}`);

  if (items.length === 0) {
    return `No activity records found for ${dogName}.`;
  }

  return (
    `Recent activities for ${dogName}:\n\n` +
    items
      .map(
        (a) =>
          `- ${a.date}: ${a.activity_type}, ${a.distance_km ?? '?'} km, ` +
          `${a.duration_minutes} min, route: ${a.route_name ?? 'unknown'}`,
      )
      .join('\n')
  );
};
