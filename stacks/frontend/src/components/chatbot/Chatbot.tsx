import { useEffect, useRef, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Fab from "@mui/material/Fab";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { useChatMutation } from "../../hooks/useChatMutation";
import type { ChatMessage } from "../../types/quiz";

interface ChatbotProps {
  topic: string;
}

interface UIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function Chatbot({ topic }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<UIMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi! I'm your quiz assistant. Ask me anything about "${topic}" to deepen your understanding!`,
    },
  ]);

  const chatMutation = useChatMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const buildHistory = (): ChatMessage[] =>
    messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || chatMutation.isPending) return;

    const userMsg: UIMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    chatMutation.mutate(
      { topic, message: trimmed, history: buildHistory() },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            { id: `assistant-${Date.now()}`, role: "assistant", content: data.reply },
          ]);
        },
        onError: (err) => {
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: "assistant",
              content: `Sorry, something went wrong: ${err.message}`,
            },
          ]);
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!isOpen && (
        <Tooltip title="Ask the AI about this topic" placement="left">
          <Fab
            variant="extended"
            aria-label="open chatbot"
            onClick={() => setIsOpen(true)}
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 1300,
              borderRadius: "24px",
              px: 4,
              minWidth: 168,
              height: 56,
              fontSize: "1rem",
              fontWeight: 600,
              gap: 1,
              textTransform: "none",
              boxShadow: 4,
              "&&": {
                backgroundColor: "#3d7a4f",
                color: "#ffffff",
              },
              "&&:hover": { backgroundColor: "#2e5e3c" },
            }}
          >
            <ChatIcon />
            Ask the AI
          </Fab>
        </Tooltip>
      )}

      {isOpen && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 360,
            height: 520,
            display: "flex",
            flexDirection: "column",
            zIndex: 1300,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              bgcolor: "primary.main",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <SmartToyIcon fontSize="small" />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Quiz Assistant
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Topic: {topic}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{
                "&&": { color: "#ffffff", backgroundColor: "transparent" },
                "&&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
              }}
              aria-label="close chatbot"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              bgcolor: "grey.50",
            }}
          >
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-end",
                  gap: 1,
                }}
              >
                {msg.role === "assistant" && (
                  <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main", flexShrink: 0 }}>
                    <SmartToyIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                )}
                <Box
                  sx={{
                    maxWidth: "78%",
                    px: 1.5,
                    py: 1,
                    borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    bgcolor: msg.role === "user" ? "primary.main" : "white",
                    color: msg.role === "user" ? "white" : "text.primary",
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                    {msg.content}
                  </Typography>
                </Box>
              </Box>
            ))}

            {chatMutation.isPending && (
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main", flexShrink: 0 }}>
                  <SmartToyIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Box
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: "12px 12px 12px 2px",
                    bgcolor: "white",
                    boxShadow: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <CircularProgress size={12} />
                  <Typography variant="body2" color="text.secondary">
                    Thinking...
                  </Typography>
                </Box>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box sx={{ p: 1.5, bgcolor: "white", borderTop: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
              <TextField
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about the topic..."
                multiline
                maxRows={3}
                fullWidth
                size="small"
                disabled={chatMutation.isPending}
                variant="outlined"
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!input.trim() || chatMutation.isPending}
                aria-label="send message"
                sx={{ flexShrink: 0 }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      )}
    </>
  );
}
