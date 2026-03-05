import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';

const region = 'eu-west-1';

export const MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0';

export const bedrockClient = new BedrockRuntimeClient({ region });
