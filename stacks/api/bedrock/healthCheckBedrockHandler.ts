import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { ok } from '../responses';
import { bedrockClient } from './bedrock';

const healthCheckBedrockHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const body = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Improvise a short response for a health check. Make it moderately humorous.',
          },
        ],
      },
    ],
  };

  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(body),
  });

  const response = await bedrockClient.send(command);

  const message = new TextDecoder().decode(response.body);

  return ok(event, { message: JSON.parse(message) });
};

export default healthCheckBedrockHandler;
