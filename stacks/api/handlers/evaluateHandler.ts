import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequest, notFound, ok } from '../responses';
import loadQuiz from '../dynamodb/loadQuiz';
import loadSubmissions from '../dynamodb/loadSubmissions';
import { QuizEvaluationDto } from '../types';
import { createEvaluation } from '../bedrock/createEvaluation';

const evaluateHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const quizId = event.pathParameters?.id;
  if (!quizId) {
    return badRequest(event, event.path);
  }

  const quiz = await loadQuiz(quizId);
  if (!quiz) {
    return notFound(event, event.path);
  }

  const evaluation: QuizEvaluationDto = {
    quizId: quiz.id,
    topic: quiz.topic,
    difficulty: quiz.difficulty,
    correctAnswerCount: 0,
    verdict: '',
    evaluatedAnswers: quiz.questions.map((q) => {
      return {
        questionId: q.id,
        questionText: q.questionText,
        correctChoice: q.correctChoice,
        explanation: q.explanation,
        isCorrect: false,
      };
    }),
  };

  const submissions = (await loadSubmissions(quizId)).answers;
  if (!submissions) {
    return ok(event, { evaluation });
  }

  for (const submission of submissions) {
    if (submission.selectedChoice) {
      const question = evaluation.evaluatedAnswers.find((a) => a.questionId === submission.questionId);
      if (question && question.correctChoice === submission.selectedChoice) {
        question.isCorrect = true;
        evaluation.correctAnswerCount++;
      }
    }
  }

  // evaluation.verdict = await createEvaluation(JSON.stringify(evaluation));

  return ok(event, { evaluation });
};

export default evaluateHandler;
