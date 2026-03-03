import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import type { CreateQuizRequest, CreateQuizResponse } from "../types/quiz";

export function useCreateQuizMutation() {
  return useMutation<CreateQuizResponse, Error, CreateQuizRequest>({
    mutationFn: (body) => api.createQuiz(body),
  });
}
