import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import type { ChatRequest, ChatResponse } from "../types/quiz";

export function useChatMutation() {
  return useMutation<ChatResponse, Error, ChatRequest>({
    mutationFn: (body) => api.chat(body),
  });
}
