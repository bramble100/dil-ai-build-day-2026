import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';

const region = 'eu-west-1';

export const bedrockClient = new BedrockRuntimeClient({ region });
