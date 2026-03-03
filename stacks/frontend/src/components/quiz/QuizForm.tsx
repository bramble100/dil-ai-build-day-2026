import { useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PetsIcon from "@mui/icons-material/Pets";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import type {
  CreateMcpQuizRequest,
  CreateQuizRequest,
  Difficulty,
  McpTopic,
  QuizMode,
  UploadQuizRequest,
} from "../../types/quiz";

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

const MCP_TOPICS: { value: McpTopic; label: string }[] = [
  { value: "csuszka", label: "Csuszka" },
  { value: "panir", label: "Panir" },
];

const QUESTION_COUNT_MARKS = [
  { value: 1, label: "1" },
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 20, label: "20" },
];

export type QuizFormData =
  | { mode: "ai"; request: CreateQuizRequest }
  | { mode: "upload"; request: UploadQuizRequest }
  | { mode: "mcp"; request: CreateMcpQuizRequest };

interface QuizFormProps {
  onSubmit: (data: QuizFormData) => void;
  isLoading: boolean;
  error: Error | null;
}

function SharedDifficultyAndCount({
  difficulty,
  questionCount,
  isLoading,
  onDifficultyChange,
  onCountChange,
}: {
  difficulty: Difficulty;
  questionCount: number;
  isLoading: boolean;
  onDifficultyChange: (d: Difficulty) => void;
  onCountChange: (n: number) => void;
}) {
  return (
    <>
      <TextField
        select
        label="Difficulty"
        value={difficulty}
        onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
        fullWidth
        disabled={isLoading}
      >
        {DIFFICULTIES.map((d) => (
          <MenuItem key={d.value} value={d.value}>
            {d.label}
          </MenuItem>
        ))}
      </TextField>

      <Box>
        <Typography gutterBottom>
          Questions: <strong>{questionCount}</strong>
        </Typography>
        <Slider
          value={questionCount}
          onChange={(_, val) => onCountChange(val as number)}
          min={1}
          max={20}
          step={1}
          marks={QUESTION_COUNT_MARKS}
          disabled={isLoading}
        />
      </Box>
    </>
  );
}

export function QuizForm({ onSubmit, isLoading, error }: QuizFormProps) {
  const [mode, setMode] = useState<QuizMode>("ai");

  // AI mode state
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState<Difficulty>("beginner");
  const [aiCount, setAiCount] = useState(5);

  // Upload mode state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTopic, setUploadTopic] = useState("");
  const [uploadDifficulty, setUploadDifficulty] = useState<Difficulty>("beginner");
  const [uploadCount, setUploadCount] = useState(5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // MCP mode state
  const [mcpTopic, setMcpTopic] = useState<McpTopic>("csuszka");
  const [mcpDifficulty, setMcpDifficulty] = useState<Difficulty>("beginner");
  const [mcpCount, setMcpCount] = useState(5);

  const handleTabChange = (_: React.SyntheticEvent, newMode: QuizMode) => {
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "ai") {
      if (!aiTopic.trim()) return;
      onSubmit({
        mode: "ai",
        request: { topic: aiTopic.trim(), difficulty: aiDifficulty, count: aiCount },
      });
      return;
    }

    if (mode === "upload") {
      if (!uploadFile) return;
      const fileBase64 = await readFileAsBase64(uploadFile);
      onSubmit({
        mode: "upload",
        request: {
          file: fileBase64,
          topic: uploadTopic.trim() || undefined,
          difficulty: uploadDifficulty,
          count: uploadCount,
        },
      });
      return;
    }

    if (mode === "mcp") {
      onSubmit({
        mode: "mcp",
        request: { topic: mcpTopic, difficulty: mcpDifficulty, count: mcpCount },
      });
    }
  };

  const isSubmitDisabled =
    isLoading ||
    (mode === "ai" && !aiTopic.trim()) ||
    (mode === "upload" && !uploadFile);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 720, mx: "auto" }}
    >
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={(_e, val) => { if (val !== null) handleTabChange(_e as React.SyntheticEvent, val); }}
        fullWidth
        disabled={isLoading}
        sx={{
          gap: 1.5,
          "& .MuiToggleButtonGroup-grouped": {
            borderRadius: "12px !important",
            border: "1.5px solid",
            borderColor: "primary.light",
            color: "primary.dark",
            backgroundColor: "#eaf4ed",
            py: 1.2,
            flex: 1,
            "&.Mui-selected": {
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              borderColor: "primary.main",
              "&:hover": { backgroundColor: "primary.dark" },
            },
            "&:not(.Mui-selected):hover": {
              backgroundColor: "#d4ebda",
            },
          },
          "& .MuiToggleButtonGroup-middleButton, & .MuiToggleButtonGroup-lastButton": {
            marginLeft: 0,
            borderLeft: "1.5px solid",
            borderLeftColor: "primary.light",
          },
        }}
      >
        <ToggleButton value="ai" disableRipple={false}>
          <AutoAwesomeIcon fontSize="small" sx={{ mr: 1 }} />
          AI Topic
        </ToggleButton>
        <ToggleButton value="upload" disableRipple={false}>
          <UploadFileIcon fontSize="small" sx={{ mr: 1 }} />
          Upload
        </ToggleButton>
        <ToggleButton value="mcp" disableRipple={false}>
          <PetsIcon fontSize="small" sx={{ mr: 1 }} />
          MCP
        </ToggleButton>
      </ToggleButtonGroup>

      {mode === "ai" && (
        <>
          <TextField
            label="Topic"
            placeholder="e.g. Quantum Physics, World War II, TypeScript..."
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            required
            fullWidth
            disabled={isLoading}
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
          <SharedDifficultyAndCount
            difficulty={aiDifficulty}
            questionCount={aiCount}
            isLoading={isLoading}
            onDifficultyChange={setAiDifficulty}
            onCountChange={setAiCount}
          />
        </>
      )}

      {mode === "upload" && (
        <>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload a PDF document and we'll generate quiz questions from its content.
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}>
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                sx={{
                  "&&": {
                    borderColor: "#5a9e6a",
                    color: "#2e5e3c",
                    backgroundColor: "#eaf4ed",
                  },
                  "&&:hover": { backgroundColor: "#d4ebda", borderColor: "#3d7a4f" },
                }}
              >
                Choose PDF
              </Button>
              {uploadFile && (
                <Typography variant="body2" noWrap sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {uploadFile.name}
                </Typography>
              )}
            </Box>
          </Box>
          <TextField
            label="Topic label (optional)"
            placeholder="e.g. Chapter 3: Photosynthesis"
            value={uploadTopic}
            onChange={(e) => setUploadTopic(e.target.value)}
            fullWidth
            disabled={isLoading}
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
          <SharedDifficultyAndCount
            difficulty={uploadDifficulty}
            questionCount={uploadCount}
            isLoading={isLoading}
            onDifficultyChange={setUploadDifficulty}
            onCountChange={setUploadCount}
          />
        </>
      )}

      {mode === "mcp" && (
        <>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Generate a quiz using our pre-indexed knowledge base via MCP tools.
            </Typography>
          </Box>
          <TextField
            select
            label="Topic"
            value={mcpTopic}
            onChange={(e) => setMcpTopic(e.target.value as McpTopic)}
            fullWidth
            disabled={isLoading}
          >
            {MCP_TOPICS.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>
          <SharedDifficultyAndCount
            difficulty={mcpDifficulty}
            questionCount={mcpCount}
            isLoading={isLoading}
            onDifficultyChange={setMcpDifficulty}
            onCountChange={setMcpCount}
          />
        </>
      )}

      {error && (
        <Alert severity="error">{error.message}</Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isSubmitDisabled}
        startIcon={
          isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />
        }
      >
        {isLoading ? "Generating Quiz..." : "Generate Quiz"}
      </Button>
    </Box>
  );
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix (e.g. "data:application/pdf;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
