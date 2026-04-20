# AI Ops Hackathon 2026 -- QuizAI

## Pain Points

### Studying and knowledge assessment is broken

- **One-size-fits-all quizzes** -- Off-the-shelf quizzes cover generic topics at fixed difficulty. If your team needs to test knowledge on a specific technology, process, or domain, you either write questions by hand or settle for something irrelevant.
- **Manual quiz creation is tedious and slow** -- Writing good multiple-choice questions with plausible distractors, correct answers, and explanations takes hours. Subject-matter experts spend time on formatting instead of teaching.
- **No feedback loop** -- Traditional quizzes give you a score and nothing else. You know you got 60%, but not *what* to study next or *where* your gaps are. The learning opportunity is wasted.
- **Static difficulty, no adaptation** -- Beginner and expert get the same questions. Beginners get discouraged, experts get bored. There's no way to dial the challenge to match the learner.

---

## Who Uses This?

### Anyone who needs to test or build knowledge on any topic

| Team | Use Case |
| --- | --- |
| **Engineering / Tech Leads** | Assess team knowledge on specific technologies (AWS Lambda, TypeScript, security practices) before a project or after a training session |
| **Onboarding / HR** | Generate role-specific quizzes for new hires -- test knowledge on company processes, tools, or domain fundamentals |
| **L&D / Training** | Create on-demand assessments for any training topic, at any difficulty, without waiting for a course designer |
| **Individual learners** | Self-study tool -- pick a topic you're learning, quiz yourself, and get AI-powered feedback on where to improve |
| **Managers / Team Leads** | Quick knowledge checks before certifications, audits, or compliance reviews |

**Our demo proves it:** Pick any topic -- from cloud architecture to cooking to philosophy -- choose a difficulty level and question count, and the AI generates a tailored quiz with explanations in seconds. The evaluation doesn't just score you; it tells you what to study next.

---

## Expected Business Impact

### From hours of manual question writing to seconds of AI generation

| Metric | Manual Approach | QuizAI | Improvement |
| --- | --- | --- | --- |
| **Create a 20-question quiz on a specific topic** | 2-4 hours (research, write questions, write distractors, verify answers) | ~30 seconds (AI generates questions, choices, correct answers, and explanations) | **~300x faster** |
| **Adjust difficulty for different audiences** | Rewrite questions from scratch for each level | Select beginner/intermediate/advanced/expert from a dropdown | **Instant adaptation** |
| **Provide actionable feedback after assessment** | Manual review and write-up by instructor | Deterministic scoring + AI-generated verdict with domain-specific learning recommendations and development guidance | **Automated and personalized** |
| **Cover a new topic** | Find or commission new content | Type the topic name and click Generate | **Zero lead time** |

**Knowledge assessment becomes a conversation, not a bottleneck.** Teams can test understanding of *any* topic at *any* difficulty level on demand. Scoring is deterministic and trustworthy -- no AI ambiguity in the pass/fail judgment. But the real value is the *verdict*: after scoring, the AI analyzes the pattern of correct and incorrect answers and generates personalized guidance on how to develop further in the domain -- which sub-topics to revisit, what resources to explore, where the knowledge gaps are. This is the kind of individualized coaching that traditionally requires a human instructor reviewing each submission.

---

## Why AI Is Essential

### This product cannot exist without AI -- it's the core, not a feature

- **Quiz generation is a creative task at scale.** Writing a good multiple-choice question requires understanding the topic deeply enough to craft plausible wrong answers and clear explanations. This is exactly what LLMs excel at -- synthesizing knowledge into structured, pedagogically sound output.
- **Topic coverage is unbounded.** A question bank is always limited to pre-written content. AI generates questions for *any* topic a user types -- from "Kubernetes networking" to "Renaissance art" to "Hungarian cooking." No human team could pre-author this breadth.
- **Difficulty calibration requires nuance.** The difference between a beginner and expert question isn't just harder vocabulary -- it's testing different cognitive levels (recall vs. application vs. analysis). The LLM adjusts question complexity, distractor sophistication, and explanation depth based on the difficulty parameter.
- **The verdict is the real unlock.** After deterministic scoring (see below), the AI receives the full quiz context -- topic, difficulty, which questions were missed, and the explanations -- and generates a *verdict*: a personalized analysis of the user's weaknesses with concrete recommendations on how to develop in that domain. It doesn't just say "you got 60%"; it tells you *which sub-topics to study*, *what resources to explore*, and *where your knowledge gaps are*. This kind of individualized learning guidance traditionally requires a human instructor reviewing each submission -- the AI delivers it instantly for every quiz.
- **AI where it matters, determinism where it counts.** We deliberately split the pipeline: scoring is *not* done by AI. Each answer is compared to the known correct choice in code -- a deterministic, auditable check with no room for hallucination or inconsistency. AI is used only where it's irreplaceable: (1) Claude on Bedrock generates the quiz with structured JSON output -- questions, choices, correct answers, and explanations. (2) After deterministic scoring, Claude reads the scored results and produces the natural-language verdict with domain-specific learning guidance. This separation ensures that the pass/fail judgment is always reliable, while the AI focuses on what it does best -- synthesizing personalized insights from the results.

---

## How It Works

### Three-tier serverless architecture, fully deployed on AWS

```
User (Browser)  -->  API Gateway + Lambda  -->  Amazon Bedrock (Claude 3 Haiku)
React + Vite         TypeScript handlers         Quiz generation & verdict
                     CORS, routing, validation
                     deterministic scoring
                            |
                       DynamoDB
                  Quizzes, submissions
```

**The workflow -- three operations:**

1. **Create** -- User picks a topic, difficulty (beginner/intermediate/advanced/expert), and question count (1-20). The Lambda handler sends a structured prompt to Claude 3 Haiku on Amazon Bedrock, which returns quiz questions as JSON. The quiz is saved to DynamoDB and returned to the frontend.
2. **Submit** -- User answers the multiple-choice questions in the browser and submits. Answers are stored in DynamoDB keyed by quiz ID.
3. **Evaluate** -- The Lambda handler loads the quiz and submissions from DynamoDB and scores each answer deterministically in code -- comparing the user's selected choice against the known correct answer. No AI is involved in scoring; it's a straightforward, auditable match. Once the score is computed, the handler sends the full scored context (topic, difficulty, per-question results, explanations) to Claude on Bedrock, which generates a *verdict* -- a personalized analysis of the user's strengths and weaknesses with specific recommendations on how to develop further in the domain. Results are displayed with a visual score ring, per-question breakdowns with correct/incorrect highlights, and the AI-generated verdict with learning guidance.

**Stack:**
- **Frontend:** React 19 + Vite + TypeScript, hosted on S3, CSS Modules for styling
- **Backend:** AWS SAM (Serverless Application Model), TypeScript Lambda handlers behind API Gateway
- **Database:** DynamoDB single-table design (partition key: `QUIZ#<guid>`, sort keys for metadata, questions, and submissions)
- **AI:** Amazon Bedrock with Claude 3 Haiku (`anthropic.claude-3-haiku-20240307-v1:0`) for quiz generation and verdict generation (scoring is deterministic in code)
- **Infrastructure:** CloudFormation nested stacks (Frontend, API, DynamoDB, Bedrock IAM), deployed via `sam deploy`
- **Local dev:** SAM CLI + Docker for local Lambda emulation, Vite dev server for frontend

---

## What We Learned

### Lessons from building an AI-powered quiz app in a day

**On AI in practice:**

- **Structured output is the key to reliability.** Prompting Claude to return strict JSON (questions, choices, correct answer, explanation) made the integration deterministic. The prompt template with an explicit JSON schema eliminated parsing failures -- the AI consistently returned well-formed quiz data.
- **Know when *not* to use AI.** Scoring must be deterministic -- comparing user answers to known correct choices is a simple code operation that must be 100% reliable and auditable. We deliberately keep AI out of the scoring path. AI is reserved for the two tasks where it's irreplaceable: generating quiz content and generating the verdict. This separation was a deliberate design choice, not a limitation.
- **The verdict is what makes the app valuable.** The AI doesn't just say "you scored 60%." It reads the full scored context -- which questions were missed, their explanations, the topic and difficulty -- and produces a personalized verdict: what the user's weaknesses are, which sub-topics to study, and how to develop further in the domain. This transforms a simple quiz into a learning tool.
- **Difficulty is more than a label.** When you tell the AI "expert difficulty," it doesn't just use harder words -- it tests deeper understanding, adds subtle distractors, and writes more nuanced explanations. The quality difference across difficulty levels was genuinely impressive without any additional prompt engineering.
- **Serverless + AI = fast iteration.** SAM nested stacks let us build the full architecture (API Gateway, Lambda, DynamoDB, Bedrock IAM, S3 frontend) incrementally. Each piece could be tested independently. Local development with `sam local` and Docker meant we could iterate on handlers without deploying.

**How we'll use AI day-to-day going forward:**

- **As an assessment engine, not just a chatbot.** The mental model shift from "ask AI a question" to "have AI test your understanding and guide your learning" opens up training, onboarding, and knowledge management use cases across the organization.
- **For any knowledge verification need** -- before a certification, after a training, during onboarding -- QuizAI turns "did you read the docs?" into a measurable, actionable assessment with personalized feedback.
