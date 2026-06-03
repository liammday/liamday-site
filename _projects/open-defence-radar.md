---
title: open-defence-radar
description: An applied-AI case study on open-defence-radar, a grounded retrieval engine over open UK defence-and-security data. Every answer cites its sources, and quality is measured in CI rather than asserted. Documents the eval-gated decision to leave a reranker switched off.
summary: A clearance-safe retrieval system over open government data, exposed as an MCP tool, a CLI, and a web console. Every claim traces to a fetched, licensed source, and a CI-gated evaluation harness holds retrieval and grounding to a floor on every commit.
role: Architect and engineer (AI-paired)
year: 2026
client: Personal applied-AI build
outcome: v1.0.0, public, CI-gated
order: 2
type: Case study
image: /assets/images/projects/open-defence-radar-og-card.png
hero_image: /assets/images/projects/open-defence-radar-hero.svg
hero_image_width: 1600
hero_image_height: 800
hero_image_alt: "open-defence-radar mark: a radar scope with range rings, an ember sweep, and two signal blips tethered to their source markers."
nav:
  - id: lede
    label: What it does
  - id: problem
    label: The problem
  - id: overview
    label: Architecture
  - id: grounding
    label: Grounding
  - id: failure
    label: Eval as arbiter
  - id: guardrails
    label: Clearance-safe
  - id: open
    label: Open work
links:
  - title: "Source on GitHub, liammday/open-defence-radar"
    url: https://github.com/liammday/open-defence-radar
  - title: "System design: architecture, the eval harness, and the trade-offs"
    url: https://github.com/liammday/open-defence-radar/blob/main/docs/design/system-design.md
---

## What it does
{: #lede .scroll-mt-32 }

open-defence-radar answers questions about UK defence and security using only open, published data, and it shows its working.

You ask a question. It retrieves the relevant passages from public procurement notices, tenders, and government announcements, synthesises an answer, and attaches a citation to every claim. Each citation resolves to a fetched, licensed record: the source, the date, the title, the URL. If nothing in the ingested data supports an answer, it says so rather than inventing one.

That last sentence is the whole point. A language model will answer anything, confidently. This one is only allowed to say what the retrieved sources support, and it carries the receipts.

It runs four ways from the same core: a read-only `query` tool inside an MCP client, which is the headline surface, a command-line tool, a web console with a trust dashboard, and an `odr agent` that breaks a broad question into focused sub-questions and recombines the answers into one cited brief.

<figure class="not-prose my-10">
  <picture>
    <source srcset="{{ '/assets/images/projects/open-defence-radar-console.webp' | relative_url }}" type="image/webp">
    <img src="{{ '/assets/images/projects/open-defence-radar-console.png' | relative_url }}" alt="The web console answering a question about UK defence contracts mentioning AI or autonomy, with inline citation chips, a groundedness read of 1.00, and a numbered list of sources." width="1600" height="2170" loading="lazy" class="w-full rounded-2xl border border-aluminum-500/20">
  </picture>
  <figcaption class="mt-3 text-xs text-aluminum-400">The web console. A grounded answer to a real question, every claim carrying a citation, with a groundedness read and the sources it drew from. Generated live against the ingested open-data store.</figcaption>
</figure>

## The problem
{: #problem .scroll-mt-32 }

Language models have quietly become the first draft of analysis. Ask one a question over a pile of documents and it answers instantly, fluently, and often wrongly. Over messy, high-stakes material like government and defence data, that last word is the whole problem.

For anything decision-shaped, a fluent answer with no source is worse than no answer. It invites a trust it has not earned, and the cost of acting on a confident hallucination is paid downstream, by whoever assumed the machine had done the reading. The bottleneck in applied AI is no longer generation. It is grounding: can you trust the output, and can you prove it.

So the product question is narrow and unglamorous. Can you build a system that answers from a real corpus, shows its working on every claim, says so plainly when the evidence is not there, and keeps proving it does all of that on every change. open-defence-radar is that system, built end to end with the messy parts left in.

One constraint shaped every decision: it had to be useful in a defence and security context and safe to build and share in the open. So, open sources only, analytic rather than operational, nothing that could resolve to a person, a site, or an operation. That reads like a limitation. It is the opposite. It forced provenance, honesty about what the data can and cannot say, and the kind of data-governance discipline any serious deployment has to do anyway.

## System overview
{: #overview .scroll-mt-32 }

<figure class="not-prose my-10">
{% include open-defence-radar-architecture.svg %}
<figcaption class="mt-3 text-xs text-aluminum-400">One pipeline, one store, one grounded path to an answer. Open sources are fetched, normalised, chunked and embedded into a single SQLite store; four surfaces issue the same query; the evaluation harness reads the store and gates every commit.</figcaption>
</figure>

The shape is a single grounded path from open data to a cited answer.

Open sources are fetched, normalised into one `Document` model, deduplicated by content hash, chunked, and embedded. Embeddings run on a local model, so ingest costs nothing and works offline. Everything lands in one SQLite file that holds three things at once: the vectors, a keyword index, and the relational metadata that carries provenance. One file, no service to stand up, and a backup is a copy.

Retrieval is hybrid. A semantic search and a keyword search run against the same filtered candidates, and their rankings are fused with Reciprocal Rank Fusion, which is deterministic and needs no model. Synthesis takes the top passages and is allowed to use nothing else.

Every provider is a swappable seam behind a typed interface. The embedder, the generator, and the store are each chosen at the composition root from the environment, and the tests inject fakes for all three, so the suite runs with no network and no database. Generation defaults to a free-tier model; change one variable and it runs against a paid model or a local one. None of the surfaces know or care which.

## How it stays grounded
{: #grounding .scroll-mt-32 }

Grounding is checked twice, deliberately at two different costs.

At synthesis time, on every single answer, the system parses the generated text and checks that each factual claim carries a citation marker that resolves to a passage that was actually retrieved. An uncited claim, or a citation to a passage that was never fetched, is flagged. This is free, it is parsing, and it runs every time.

At evaluation time, on a curated question set, an LLM judge does the more expensive check: for each cited claim, does the cited passage actually entail it? The judge runs at temperature zero and caches its verdicts by claim and passage, so the same pair is never paid for twice.

The provenance chain underneath is unbroken: answer, to citation, to chunk, to document with its URL and date and content hash, to source with its licence. Every claim is traceable to a fetched, licensed record. There is no point in the chain where a claim floats free of its source.

<figure class="not-prose my-10">
  <picture>
    <source srcset="{{ '/assets/images/projects/open-defence-radar-trust.webp' | relative_url }}" type="image/webp">
    <img src="{{ '/assets/images/projects/open-defence-radar-trust.png' | relative_url }}" alt="The trust dashboard: retrieval hit-rate 1.00, groundedness 0.95, unsupported-claim rate 0.05, a provenance table of the three ingested sources, and a region-level choropleth of procurement activity." width="1600" height="1874" loading="lazy" class="w-full rounded-2xl border border-aluminum-500/20">
  </picture>
  <figcaption class="mt-3 text-xs text-aluminum-400">The trust dashboard. Retrieval and grounding scored against their floors, the provenance of every source, and where the open procurement activity sits, region by region. These numbers are recomputed and gated on every commit.</figcaption>
</figure>

## A decision the eval made
{: #failure .scroll-mt-32 }

Hybrid retrieval fuses a semantic and a keyword search with a deterministic rule. The textbook next move is a cross-encoder reranker: a small model that re-scores the top candidates for relevance. It is the obvious upgrade, and I built it.

Then the rule I had set for myself applied. The reranker ships only if the evaluation harness shows it beats the deterministic baseline on the curated set. It has not earned that here. With retrieval already sitting at and above its floors, the reranker added latency and a model dependency without moving the numbers that matter. So it stays off by default, behind a flag, ready for the day the corpus grows large enough to need it.

That is the entire thesis made literal. The eval is the arbiter, not my instinct and not the textbook. Building something and then leaving it switched off because the measurement did not justify it is not wasted work. It is the work.

There was a blunter failure too. The vector extension would not load on the stock Python interpreter on macOS, which ships without the ability to load SQLite extensions at all. The honest fix was to move the storage layer onto a build of SQLite that bundles extension loading and ships cross-platform wheels, rather than fight the interpreter. It loads everywhere now, and the diagnosis was most of the work.

The trade-off honest enough to put in print: one SQLite file and a deterministic baseline are the right call for a bounded, reproducible, single-machine corpus. They are the wrong call past about a hundred thousand vectors, where brute-force search stops being free and the answer is Postgres with a vector index. The storage interface is drawn so that the swap is a replacement, not a rewrite. It is the right trade for what this is, and the design says so out loud.

## Clearance-safe by design
{: #guardrails .scroll-mt-32 }

The guardrails are not a disclaimer at the bottom of the page. They are design decisions, made early, that the rest of the system had to respect.

Open data only: every source declares its licence in code, and the repository holds no secrets and no employer-connected data. Analytic, not operational: the system describes what is publicly known and announced, never targeting or interpretation. Region level only: procurement notices carry a delivery region, and the map resolves no finer than one of the twelve UK regions. The richer and riskier options, conflict-event geocoding and precise coordinates and "within so many kilometres of a place", were considered and deliberately declined, because they cut against an open and analytic posture for a clearance-aware public repository.

Stating those boundaries plainly is not caution for its own sake. It is the data-governance reasoning any serious deployment of this kind has to do anyway, done in the open.

## Open work
{: #open .scroll-mt-32 }

The honest list of what is not finished.

Embeddings are local-only in this version. That keeps cost at zero and the build reproducible, but it leaves quality on the table a hosted model might recover, and the eval harness is exactly the instrument to decide whether it is worth it.

The curated evaluation set is deliberately small. It proves the harness and gates regressions; it does not yet prove breadth. Growing it is the next obvious move, and the floors are written to ratchet up, never quietly down.

Claim segmentation at synthesis time is a heuristic, not a real claim extractor. It catches the cheap failures honestly, and it is upgradeable.

open-defence-radar is a deliberately small answer to a large and generic problem: how do you make an AI system you can actually trust over data where being wrong is expensive. The answer it argues for is the same one I would bring to that problem at scale. Ground every claim in a source. Measure quality continuously rather than asserting it. Refuse rather than guess. Resist the complexity the numbers do not justify. The domain here is open defence data; the discipline travels to anywhere the output has to be believed.
