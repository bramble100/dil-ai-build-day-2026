import { v7 as uuidv7 } from 'uuid';
import { ChatBedrockConverse } from '@langchain/aws';
import { HumanMessage } from '@langchain/core/messages';
import JSON5 from 'json5';
import pdfParse from 'pdf-parse';

import { ChoiceKey, Question, Quiz, QuizConfig } from '../types';

// ---------------------------------------------------------------------------
// Shared Bedrock model instance
// ---------------------------------------------------------------------------

const model = new ChatBedrockConverse({
  model: process.env.BEDROCK_MODEL_ID ?? 'anthropic.claude-3-haiku-20240307-v1:0',
  region: process.env.AWS_REGION,
  modelKwargs: {
    max_tokens: 4096,
    temperature: 0.3,
  },
});

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * Cleans a raw string returned by Claude to make it safe for JSON parsing.
 * Claude occasionally emits smart quotes, curly apostrophes, or trailing commas
 * which cause JSON.parse to throw. This mirrors the cleanup from the .md guide.
 */
const sanitizeJson = (raw: string): string =>
  raw
    .trim()
    // Strip optional markdown code fences (```json ... ```)
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    // Smart double quotes → straight
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    // Smart single quotes / apostrophes → straight
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    // Curly apostrophe → straight
    .replace(/\u2019/g, "'")
    // Trailing commas before } or ]
    .replace(/,(\s*[}\]])/g, '$1');

/**
 * Parses the JSON string from Claude with a JSON5 fallback.
 * JSON5 tolerates trailing commas and single quotes that survive sanitization.
 */
const parseJson = (raw: string, context: string): any => {
  const sanitized = sanitizeJson(raw);
  try {
    return JSON.parse(sanitized);
  } catch {
    console.warn(`[${context}] JSON.parse failed, falling back to JSON5`);
    return JSON5.parse(sanitized);
  }
};

/**
 * Shared prompt footer that enforces the output format Claude must follow.
 */
const buildFormatRules = (questionCount: number): string => `
CRITICAL RULES:
- Respond ONLY with a valid JSON object. No markdown, no explanation, no code fences.
- Use ONLY straight ASCII double-quotes ("). Never use smart quotes like " " „ ".
- No trailing commas after the last element in any array or object.
- The correct answer must be distributed randomly across A, B, C, and D.

Respond in this EXACT format:
{
  "questions": [
    {
      "id": "Q01",
      "questionText": "...",
      "choices": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correctChoice": "A",
      "explanation": "Brief explanation of why this answer is correct."
    }
  ]
}

Zero-pad the id: Q01, Q02, ... Q${String(questionCount).padStart(2, '0')}.
Generate the ${questionCount} questions now:`;

// ---------------------------------------------------------------------------
// createCustomTopicQuiz
// ---------------------------------------------------------------------------

/**
 * Generates a quiz on a custom topic using AWS Bedrock (Claude).
 * Asks Claude to respond directly in our Question type shape so no
 * post-processing mapper is required.
 */
export const createCustomTopicQuiz = async (config: QuizConfig): Promise<Quiz> => {
  const prompt =
    `Generate exactly ${config.questionCount} multiple-choice questions about "${config.topic}" at ${config.difficulty} level.` +
    buildFormatRules(config.questionCount);

  const response = await model.invoke([new HumanMessage(prompt)]);
  const content = response.content as string;

  console.log('[createCustomTopicQuiz] Raw Bedrock response length:', content.length);

  const parsed = parseJson(content, 'createCustomTopicQuiz');

  if (!parsed?.questions || !Array.isArray(parsed.questions)) {
    throw new Error('[createCustomTopicQuiz] Unexpected response shape from Bedrock');
  }

  return {
    id: uuidv7(),
    topic: config.topic,
    difficulty: config.difficulty,
    questions: parsed.questions,
  };
};

// ---------------------------------------------------------------------------
// createQuizFromUploadedFile
// ---------------------------------------------------------------------------

/**
 * Extracts plain text from a PDF buffer using pdf-parse.
 * Truncates to ~12,000 chars to stay within Claude Haiku's context window.
 */
const extractTextFromPdf = async (pdfBuffer: Buffer): Promise<string> => {
  const data = await pdfParse(pdfBuffer);
  const text = data.text.trim();

  const MAX_CHARS = 12_000;
  if (text.length > MAX_CHARS) {
    console.warn(`[createQuizFromUploadedFile] PDF text truncated from ${text.length} to ${MAX_CHARS} chars`);
    return text.slice(0, MAX_CHARS);
  }

  return text;
};

/**
 * Generates a quiz from the content of an uploaded PDF.
 * The PDF text is injected into the prompt as context so Claude's questions
 * are grounded in the document.
 *
 * @param pdfBuffer - Raw bytes of the uploaded PDF
 * @param config - QuizConfig (topic is used as a label; difficulty and questionCount drive the prompt)
 */
export const createQuizFromUploadedFile = async (
  pdfBuffer: Buffer,
  config: QuizConfig,
): Promise<Quiz> => {
  const documentText = await extractTextFromPdf(pdfBuffer);

  if (documentText.length === 0) {
    throw new Error('[createQuizFromUploadedFile] PDF contained no extractable text. Is it a scanned image?');
  }

  console.log(`[createQuizFromUploadedFile] Extracted ${documentText.length} chars from PDF`);

  const prompt =
    `You are a quiz generator AI. Generate exactly ${config.questionCount} multiple-choice questions ` +
    `at ${config.difficulty} level based ONLY on the following document.\n\n` +
    `=== DOCUMENT START ===\n${documentText}\n=== DOCUMENT END ===\n\n` +
    `Every question MUST be answerable from the document above. Do not use outside knowledge.\n` +
    `Distribute difficulty: ~40% easy, ~40% medium, ~20% hard.\n` +
    buildFormatRules(config.questionCount);

  const response = await model.invoke([new HumanMessage(prompt)]);
  const content = response.content as string;

  console.log('[createQuizFromUploadedFile] Raw Bedrock response length:', content.length);

  const parsed = parseJson(content, 'createQuizFromUploadedFile');

  if (!parsed?.questions || !Array.isArray(parsed.questions)) {
    throw new Error('[createQuizFromUploadedFile] Unexpected response shape from Bedrock');
  }

  return {
    id: uuidv7(),
    topic: config.topic,
    difficulty: config.difficulty,
    questions: parsed.questions,
  };
};

// ---------------------------------------------------------------------------
// evaluateQuizAnswers
// ---------------------------------------------------------------------------

export interface QuestionResult {
  questionId: string;
  questionText: string;
  correctChoice: ChoiceKey;
  correctAnswerText: string;
  userChoice: ChoiceKey | null; // null if the question was not answered
  userAnswerText: string | null;
  isCorrect: boolean;
}

export interface QuizEvaluation {
  score: number;
  totalQuestions: number;
  percentage: number;
  evaluation: string; // AI-generated personalised feedback
  results: QuestionResult[];
}

/**
 * Scores the user's answers against the correct choices and asks Claude
 * to generate a short, personalised evaluation of the performance.
 *
 * @param topic - The quiz topic (used in the evaluation prompt for context)
 * @param questions - The original quiz questions including correctChoice
 * @param userAnswers - Map of questionId → chosen ChoiceKey submitted by the user
 */
export const evaluateQuizAnswers = async (
  topic: string,
  questions: Question[],
  userAnswers: Record<string, ChoiceKey>,
): Promise<QuizEvaluation> => {
  const results: QuestionResult[] = questions.map((q) => {
    const userChoice = (userAnswers[q.id] as ChoiceKey) ?? null;
    const isCorrect = userChoice === q.correctChoice;
    return {
      questionId: q.id,
      questionText: q.questionText,
      correctChoice: q.correctChoice,
      correctAnswerText: q.choices[q.correctChoice],
      userChoice,
      userAnswerText: userChoice ? q.choices[userChoice] : null,
      isCorrect,
    };
  });

  const score = results.filter((r) => r.isCorrect).length;
  const totalQuestions = questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  const resultSummary = results
    .map(
      (r) =>
        `Q: ${r.questionText}\n` +
        `Correct: ${r.correctAnswerText}\n` +
        `User answered: ${r.userAnswerText ?? '(no answer)'} — ${r.isCorrect ? '✓ correct' : '✗ wrong'}`,
    )
    .join('\n\n');

  const prompt =
    `A user just completed a quiz on the topic "${topic}" and scored ${score} out of ${totalQuestions} (${percentage}%).\n\n` +
    `Here are the results:\n\n${resultSummary}\n\n` +
    `Write a personalised evaluation in 2-3 sentences. ` +
    `Acknowledge their score, highlight a strength or weakness based on the results, ` +
    `and give one specific encouragement or suggestion for improvement. ` +
    `Respond with plain text only — no markdown, no bullet points.`;

  const response = await model.invoke([new HumanMessage(prompt)]);
  const evaluation = (response.content as string).trim();

  console.log(`[evaluateQuizAnswers] Score: ${score}/${totalQuestions} (${percentage}%)`);

  return { score, totalQuestions, percentage, evaluation, results };
};
