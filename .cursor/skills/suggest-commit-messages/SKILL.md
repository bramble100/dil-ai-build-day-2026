---
name: suggest-commit-messages
description: Reviews staged git changes, understands them, and suggests short descriptive commit messages in conventional commit format. Recommends splitting into multiple commits when changes mix unrelated concerns. Use when there are staged changes and the user wants commit message suggestions, or when asked to write a commit message.
compatibility: Requires git
---

# Suggest Commit Messages

When there are staged changes and the user wants commit message suggestions, analyze the diff and propose conventional commit messages.

## When to Use

- User has staged changes and asks for a commit message
- User says "suggest a commit message", "what should I commit?", "write my commit message"
- User explicitly invokes this skill for staged changes

## Workflow

1. **Get staged changes** — Run `git diff --staged` (and optionally `git diff --staged --stat` for overview).

2. **Understand the changes** — Read the diff. Identify:

   - Type of change (feature, fix, refactor, docs, chore, etc.)
   - Scope (area affected: auth, api, ui, config, etc.)
   - Main intent and impact

3. **Assess whether to split** — Do the staged changes form one logical unit or several? If multiple concerns are mixed, recommend splitting into separate commits rather than one large commit.

4. **Propose 1–3 commit messages** — Use conventional commit format. Prefer short, descriptive subject lines. If splitting is recommended, provide a message for each suggested commit.

## Conventional Commit Format

```
<type>[optional scope]: <description>

[optional body]
```

### Types

| Type       | Use for                                           |
| ---------- | ------------------------------------------------- |
| `feat`     | New feature                                       |
| `fix`      | Bug fix                                           |
| `refactor` | Code change that neither fixes nor adds a feature |
| `docs`     | Documentation only                                |
| `style`    | Formatting, whitespace, no code change            |
| `test`     | Adding or updating tests                          |
| `chore`    | Build, tooling, deps, config                      |
| `perf`     | Performance improvement                           |

### Scope (optional)

Short noun for the area: `auth`, `api`, `ui`, `config`, `deps`, etc.

### Subject Line Rules

- Imperative mood: "add" not "added" or "adds"
- No period at end
- ~50 chars or less when possible
- One logical change per commit

## When to Split Into Multiple Commits

**Recommend splitting** when staged changes mix:

- Different types (e.g. `feat` + `fix` + `docs`)
- Unrelated scopes (e.g. auth + billing + config)
- Distinct concerns that could be reverted or reviewed independently

**Phrasing:** "Consider splitting into N commits:" followed by a suggested message for each, with brief guidance on which files/hunks belong where (e.g. "First commit: auth files. Second commit: billing files.").

**Single commit is fine** when changes are tightly related (e.g. feature + its tests, or a refactor that touches many files but one intent).

## Output Format

Provide 1–3 options, best first. Include body only when it adds clarity.

**Option 1 (recommended):**

```
type(scope): short imperative description

Optional body if the change needs context or breaking-change notes.
```

**Option 2:** Alternative phrasing or scope.

**Option 3:** If changes span multiple concerns, recommend splitting and provide a message for each suggested commit.

## Examples

**Staged:** New login form component and auth hook.

```
feat(auth): add login form and useAuth hook
```

**Staged:** Fix date parsing in report generator.

```
fix(reports): correct date parsing in timezone conversion
```

**Staged:** Update README and add API docs.

```
docs: update README and add API documentation
```

**Staged:** Refactor payment service, extract validation.

```
refactor(billing): extract validation from payment service
```

**Staged:** Mixed changes (new feature + fix). Recommend splitting:

```
Consider splitting into 2 commits:

1. feat(checkout): add express checkout button
   (checkout-button.tsx, checkout-context.tsx)

2. fix(checkout): resolve cart total rounding error
   (cart-utils.ts)

Single commit only if both changes are tiny:
feat(checkout): add express checkout and fix cart rounding
```

## Style

- **Concise** — Subject line says what changed, not how
- **Scoped** — Use scope when it clarifies (e.g. `api`, `ui`)
- **Imperative** — "add", "fix", "update", not "added", "fixes"
- **Body optional** — Add body only for context, breaking changes, or rationale
- **Prefer split** — When in doubt, recommend splitting over one large commit
