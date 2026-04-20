# AI Ops Hackathon 2026 -- LLM Wiki

## Slide 1: Pain Points

### Knowledge dies in chat history

- **Rediscovery tax** -- Every time we ask an AI about our documents, it searches from scratch. Nothing is learned, nothing compounds.
- **Scattered sources, no synthesis** -- Annual reports, transcripts, articles, multilingual content -- the connections between them exist only in people's heads.
- **Wikis get abandoned** -- Manual knowledge bases decay because the maintenance burden (cross-references, updates, consistency) grows faster than the value.
- **Point-in-time snapshots** -- Current AI tools produce static reports. Next quarter, you start over.

---

## Slide 2: Who Uses This?

### Anyone who builds knowledge from documents over time

| Team                              | Use Case                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Board Intelligence / Research** | Company profiles from annual reports, filings, transcripts -- auto-updated as new sources arrive |
| **Competitive Intelligence**      | Living competitor wikis that evolve with each data point, not one-off reports                    |
| **Client Onboarding / CS**        | Structured knowledge bases from scattered client docs                                            |
| **Any analyst**                   | Turn a pile of PDFs into a cross-referenced, queryable wiki in hours                             |

**Our demo proves it:** 12 German PDFs became 35 interconnected financial analysis pages. 11 sources in 4 languages became a 53-page travel guide. No app, no infra -- just an LLM agent and markdown.

---

## Slide 3: Expected Business Impact

### From hours of manual synthesis to minutes of AI compilation

| Metric                                             | Manual Approach                    | LLM Wiki                                         | Improvement                     |
| -------------------------------------------------- | ---------------------------------- | ------------------------------------------------ | ------------------------------- |
| **Build a company profile from 12 annual reports** | 2-3 days analyst work              | ~2 hours (mostly review)                         | **~10x faster**                 |
| **Cross-reference multilingual sources**           | Requires language specialists      | AI handles 4+ languages natively                 | **Eliminates language barrier** |
| **Keep wiki current when new data arrives**        | Re-read everything, update by hand | Ingest new source, AI updates all affected pages | **Near-zero maintenance**       |
| **Onboard someone to a topic**                     | "Read these 50 docs"               | Hand them a structured wiki with an index        | **Instant context**             |

**Knowledge compounds instead of evaporating.** Every source added makes the wiki richer. Every question asked can become a new page. Traditional AI chat is stateless -- you lose the work the moment you close the window.

---

## Slide 4: Why AI Is Essential

### This task is impossible without AI -- and trivial with it

- **The bottleneck is bookkeeping, not thinking.** Updating cross-references, flagging contradictions, maintaining consistency across dozens of pages -- humans abandon this work. LLMs don't.
- **Scale breaks humans, not AI.** 90 wiki pages with correct internal links, frontmatter metadata, and source citations across 23 documents -- no human would maintain this by hand.
- **Multilingual synthesis is an AI superpower.** Our Amsterdam wiki was built from Spanish, Hungarian, English, and Dutch sources. The AI read all four and produced a unified English wiki. A human team would need translators.
- **Structure emerges from chaos.** The AI doesn't just summarize -- it creates entity pages, concept pages, comparisons, and time-series analyses. It finds patterns ("3 sources agree on this ranking") that would take hours to spot manually.

> _"LLMs don't get bored, don't forget to update a cross-reference, and can touch 15 files in one pass."_ -- Andrej Karpathy

---

## Slide 5: How It Works

### Three layers, zero infrastructure

```
Raw Sources (you curate)  -->  LLM Wiki (AI writes)  <--  Schema (rules & conventions)
PDFs, articles, transcripts     Summaries, entity pages,     AGENTS.md, TOPIC.md,
in any language                 cross-references, index      skill workflows, quality gates
```

**The workflow -- four operations:**

1. **Ingest** -- Drop source documents into `raw/`, tell the AI "process this." It reads, summarizes, creates/updates entity pages, concept pages, comparisons, and the master index.
2. **Query** -- Ask questions. The AI searches the wiki, synthesizes an answer with citations. Good answers get filed back as wiki pages.
3. **Lint** -- Periodic health check: find contradictions, stale claims, orphan pages, broken links, missing cross-references.
4. **Init Topic** -- "Create a new topic about X." The AI scaffolds the full directory structure, index, log, and topic config.

**Stack:** Any LLM agent with filesystem access (Claude Code, VS Code + Copilot, Cursor) + plain markdown + git. Viewable in Obsidian (graph view, backlinks) or any markdown reader. No database, no embeddings pipeline, no deployment.

---

## Slide 6: Risks, Mitigations & Adoption

### Honest about the risks, clear on the path

| Risk                                | Mitigation                                                                                                                                         |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AI hallucination / inaccuracy**   | Every wiki page cites its source. Schema enforces claim types: Source (verbatim), Analysis (inference), Unverified, Gap. Human reviews the output. |
| **Sensitive data in prompts**       | All processing is local -- documents stay on your machine, wiki stays in your git repo. No data leaves the controlled environment.                 |
| **Schema quality = output quality** | We provide battle-tested schemas (AGENTS.md + skill workflows). Bad schema = bad wiki, but this is a solved problem once you have a good template. |
| **"Just another tool to learn"**    | There is nothing to learn -- you drop files in a folder and talk to your LLM agent. The wiki is plain markdown anyone can read.                    |

**Driving adoption:**

- **Start with one real team problem** -- a messy Confluence space, a pile of client PDFs, a competitive landscape nobody maintains
- **The output sells itself** -- hand someone a structured 35-page wiki built from their own documents in 2 hours. That's the demo.
- **Templates, not training** -- ship reusable schemas so any team can start in minutes

---

## Slide 7: Build Steps & Resources

### Already built -- now it's about scaling the pattern

| Phase                      | What                                                                                                                                                                       | Timeline  |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| **Done**                   | 3 topics (2 fully populated, 1 scaffolded), reusable schema (AGENTS.md), 4 skill workflows (ingest, query, lint, init-topic), Obsidian-ready vault, comprehensive README | Hackathon |
| **Next: Template Library** | Package schemas for common use cases -- company profiles, competitive intel, client onboarding, regulatory research                                                        | 1-2 weeks |
| **Next: Team Pilot**       | Pick one real team (e.g. Board Intelligence) and build a wiki from their actual documents. Measure time saved vs. current process.                                         | 2-4 weeks |
| **Future: Automation**     | Scripted ingest pipelines (watch folders, scheduled refreshes), Obsidian vault as team-shared viewer, integration with DiligentGPT/Glean as a source feeder               | Quarter   |

**What we need:**

- **LLM agent licenses** for pilot participants (Claude Code, VS Code + Copilot, or any agent with filesystem access)
- **A willing pilot team** with a real document problem and 2 hours to spare
- **No infrastructure, no budget, no deployment** -- this runs on a laptop with a git repo

---

## Slide 8: What We Learned

### Lessons from building two wikis in a day

**On AI in practice:**

- **Schema is everything.** The same AI produces mediocre or excellent output depending on how well you define the rules. We iterated our schema (AGENTS.md) across two very different domains -- corporate finance and travel -- and the same structure worked for both.
- **Human-in-the-loop beats full automation.** One-at-a-time ingest with review caught errors early. Batch mode was faster but sloppier. The sweet spot is small batches of 3-5 sources.
- **AI handles languages we can't.** Synthesizing Hungarian, Spanish, Dutch, and English sources into one coherent wiki -- no human on our team could have done that.
- **Git + markdown is underrated infra.** Version history, diffs, branching, collaboration -- all free. No vendor lock-in, no migration risk. Open it in Obsidian and you get graph view and backlinks for free.

**How we'll use AI day-to-day going forward:**

- **Not as a chatbot, but as a knowledge engineer.** The mental model shift from "ask AI a question" to "have AI build and maintain something" changes what's possible.
- **For any recurring research task** -- if you're doing it more than once, the wiki pattern means the second time builds on the first instead of starting over.
