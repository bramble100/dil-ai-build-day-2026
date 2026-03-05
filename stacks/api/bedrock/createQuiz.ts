import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { v7 as uuidv7 } from 'uuid';
import { Quiz, QuizConfig } from '../types';
import { bedrockClient, MODEL_ID } from './bedrock';

const buildPrompt = ({ topic, difficulty, questionCount }: QuizConfig): string => `
Generate a quiz about "${topic}" with ${questionCount} multiple-choice questions at ${difficulty} difficulty.

Respond with ONLY valid JSON matching this structure (no markdown, no explanation):
{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "questionText": "...",
      "choices": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correctChoice": "A",
      "explanation": "..."
    }
  ]
}
`;

export const createQuiz = async (config: QuizConfig): Promise<Quiz> => {
  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4096,
      messages: [{ role: 'user', content: buildPrompt(config) }],
    }),
  });

  const response = await bedrockClient.send(command);
  const raw = JSON.parse(Buffer.from(response.body).toString('utf-8'));
  const parsed = JSON.parse(raw.content[0].text);

  return {
    id: uuidv7(),
    topic: parsed.topic,
    difficulty: parsed.difficulty,
    questions: parsed.questions.map((q: Record<string, unknown> & { choices: Record<string, string> }) => ({
      id: uuidv7(),
      questionText: q.questionText,
      choices: q.choices,
      correctChoice: q.correctChoice,
      explanation: q.explanation,
    })),
  };
};
