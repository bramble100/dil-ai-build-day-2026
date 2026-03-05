---
name: generate-pr-description
description: Analyzes git commits and diffs between branches, understands all changes, and generates a concise PR description in markdown. Use when the user wants to open a PR, generate a PR description, or create a summary of branch changes for a pull request.
compatibility: Requires git
---

# Generate PR Description

When the user asks to generate a PR description, perform these steps and write a new `.md` file they can copy into the PR.

## When to Use

Use when the user wants to open a PR, generate a PR description, or summarize branch changes (e.g. "write up my changes", "summarize my branch", "create PR body").

## Workflow

1. **Identify branches** — Source branch (e.g. `ui`) and target branch (e.g. `main`). Use the ask questions tool if unclear.

2. **Analyze commits**
   - `git log main..<source> --format="%h %s%n%b"`
   - `git diff main..<source> --stat`

3. **Read key changed files** — Inspect actual code changes, not just names. Understand:
   - New features, refactors, fixes
   - Config, scripts, templates
   - Docs and tooling

4. **Write the PR description** — New file in `docs/` (e.g. `docs/PR-<branch>-<target>.md`). Create `docs/` if it doesn't exist.

## Output Format

Use this structure. Keep it brief and scannable.

```markdown
# PR: [Short title from changes]

## Summary

[1–2 sentence overview of what this PR does]

---

## What's new

### [Area 1]
- **Thing** — brief detail
- **Thing** — brief detail

### [Area 2]
...

---

## How to run locally

[Copy-paste commands if relevant]

---

## Commits (N)

| Commit | Description |
|--------|-------------|
| `abc1234` | Short description |
```

## Example

**Input:** Branch `feature-auth` with login flow and API changes.

**Output:**

```markdown
# PR: Add user authentication

## Summary

Implements JWT-based login flow in the frontend and adds token validation middleware to the API.

---

## What's new

### Frontend
- **Login page** — Form with email/password, stores JWT in localStorage
- **Auth context** — `AuthProvider` for session state across the app

### API
- **Auth middleware** — Validates Bearer token on protected routes
- **Login endpoint** — `POST /auth/login` returns JWT

---

## How to run locally

    npm install && npm run dev
    # API: cd api && npm run start

---

## Commits (4)

| Commit | Description |
|--------|-------------|
| `a1b2c3d` | Add login page and auth form |
| `e4f5g6h` | Add AuthProvider and protected routes |
| `i7j8k9l` | Add auth middleware to API |
| `m0n1o2p` | Add POST /auth/login endpoint |
```

## Style

- **Brief** — Lazy readers should grasp it quickly
- **Bullet points** — Easy to scan
- **Key changes only** — Skip trivial edits
- **Concrete** — File paths, env vars, commands
- **Commits table** — All commits with hash + one-line description
