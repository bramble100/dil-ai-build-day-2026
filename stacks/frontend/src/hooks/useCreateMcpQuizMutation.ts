import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import type { CreateMcpQuizRequest, CreateQuizResponse } from "../types/quiz";

export function useCreateMcpQuizMutation() {
  return useMutation<CreateQuizResponse, Error, CreateMcpQuizRequest>({
    mutationFn: (body) => api.createMcpQuiz(body),
  });
}
