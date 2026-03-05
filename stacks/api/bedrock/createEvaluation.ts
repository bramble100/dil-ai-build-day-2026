import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { bedrockClient } from './bedrock';

const buildPrompt = (json: string): string => `Please create a verdict based on the results of this quiz. 
Do not add overview and do not break down the results to individual questions. 
But provide info on how to learn more about the topics, based on the weaknesses.
${json}`;

export const createEvaluation = async (json: string): Promise<string> => {
  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-sonnet-4-6',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4096,
      messages: [{ role: 'user', content: buildPrompt(json) }],
    }),
  });

  const response = await bedrockClient.send(command);
  const raw = JSON.parse(Buffer.from(response.body).toString('utf-8'));
  const parsed = JSON.parse(raw.content[0].text);

  return parsed;
};
