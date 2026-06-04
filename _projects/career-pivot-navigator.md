---
title: Career Pivot Navigator
description: An applied-AI case study on Career Pivot Navigator, a governed tool that translates a UK service leaver's experience into realistic civilian occupations grounded in cited open labour-market data. Every figure carries its source, and the output is guidance, never a determination.
summary: A grounded career-transition tool for UK Armed Forces service leavers, built to run inside an ordinary person's own Claude. It translates a military role into realistic civilian occupations, grounds every figure in cited open data, ranks them, and produces one transition plan that is guidance, never a determination.
role: Architect and engineer (AI-paired)
year: 2026
client: Personal applied-AI build
outcome: v0, open source, no LLM API
order: 1
type: Case study
image: /assets/images/projects/career-pivot-navigator-og-card.png
hero_image: /assets/images/projects/career-pivot-navigator-hero.svg
hero_image_width: 1600
hero_image_height: 800
hero_image_alt: "Career Pivot Navigator mark: a wayfinding field with an origin hub and routes fanning to candidate destinations, one lit in ember and ending at a flagged, ranked destination."
nav:
  - id: lede
    label: What it does
  - id: problem
    label: The problem
  - id: overview
    label: Architecture
  - id: grounding
    label: Grounding
  - id: decision
    label: The data pivot
  - id: guardrails
    label: Responsible
  - id: open
    label: Open work
links:
  - title: "Source on GitHub, liammday/career-pivot-navigator"
    url: https://github.com/liammday/career-pivot-navigator
  - title: "Data provenance: every source, licence, and vintage"
    url: https://github.com/liammday/career-pivot-navigator/blob/main/data/PROVENANCE.md
---

## What it does
{: #lede .scroll-mt-32 }

Career Pivot Navigator answers one question for someone leaving the Armed Forces: what civilian work could I realistically move into, and can I trust the answer.

You describe your background in plain English. It translates your military role into candidate civilian occupations, grounds each one in real labour-market data, how it pays, how many people do it, whether it is growing towards 2035, and the skills it needs, ranks them, and produces a single transition plan. Every figure arrives with its source and its date. Where the data is thin, or an estimate is shaky, it says so plainly.

The whole thing runs inside the user's own Claude. There is no API key, no per-token cost, and nothing to host but a small, stateless data service. It ships as three Anthropic-native pieces: a connector that carries the data and the logic, a Skill that carries the workflow and the guardrails, and a self-contained artifact that presents the plan as a page.

<figure class="not-prose my-10">
{% include career-pivot-navigator-plan.svg %}
<figcaption class="mt-3 text-xs text-aluminum-400">Example output: a cited civilian shortlist for a Royal Signals leaver. Every pay, employment and outlook figure carries its source and date, and the recommendation is framed as guidance, not a determination.</figcaption>
</figure>

That a figure always carries its source is the whole point. A career tool that invents a salary, or quietly implies you "qualify" for something, does real harm to a person making a large decision under pressure. This one is only allowed to say what the data supports, and it shows the receipts.

## The problem
{: #problem .scroll-mt-32 }

Every year, tens of thousands of people leave the UK Armed Forces. The hard part of that transition is rarely ambition or work ethic. It is translation. A rank, a trade and a decade of responsibility do not map cleanly onto a civilian job title, a believable salary, or the question that actually decides things: is this a field worth moving into. I made that move myself, and the guidance on offer is often generic, un-sourced, or quietly over-confident.

For someone making a large decision under real pressure, a hallucinated salary or an implied "you qualify" is not a small error. It is the kind of wrong that gets acted on. And a language model has quietly become the first draft of this advice. Ask one what a civilian "comms operator" earns and it answers instantly, fluently, and with no way to tell whether the number is real.

This cohort makes that worse in a specific way. A leaver's questions do not stay neatly inside careers. They run into compensation claims, fitness for work, and mental health, where a confident wrong answer is not just unhelpful, it is harmful. So the product question is narrow and unglamorous. Can you build something that translates a background into realistic civilian occupations, grounds every figure in a real source, ranks honestly, refuses the questions it must not answer and points to proper help instead, and never implies a determination. Career Pivot Navigator is that, demoed on the hardest cohort I know.

One constraint shaped every decision. It had to run on an ordinary person's existing Claude subscription, at no marginal cost, and be safe to build and share in the open. Open data only, nothing classified or clearance-specific. That reads like a limitation. It is the opposite. It forced provenance, and honesty about what the data can and cannot say.

## How it is built
{: #overview .scroll-mt-32 }

<figure class="not-prose my-10">
{% include career-pivot-navigator-architecture.svg %}
<figcaption class="mt-3 text-xs text-aluminum-400">One deterministic connector grounds the figures; the user's own Claude, guided by the Skill, does the judgement and writes the plan. Open data in, a cited plan out, and a self-contained artifact that makes no further calls.</figcaption>
</figure>

The shape is a clean split between what must be deterministic and what must be reasoned.

Everything numeric and factual lives in the connector, a small stateless MCP server that holds no language model. It translates a role against a curated map, ranks candidates on their cited figures, grounds pay, demand, projection and skills, and renders the final plan. Pay and the 2035 projection are shipped as parsed open files; current employment and the skills lists are fetched live from keyless public APIs. The sources are real and named: ONS earnings (ASHE), ONS employment via Nomis, the Department for Education's Skills Imperative 2035 projections, and ESCO for occupational skills.

The genuinely fuzzy work is done by the user's own Claude, guided by the Skill. Reading a messy free-text profile into structure, judging which civilian roles are a fair translation of a military one, weighing the skills gap against a person's real experience, and writing the plan in plain language: these are reasoning, and they sit with the model. The Skill is instructions, not code. It carries the workflow and the responsible-spine rules.

One line holds the whole thing together. Claude is never asked to recall a number a tool can return. That is why the output can be trusted: the figures come from the connector and carry citations, and the judgement comes from the model and is presented as judgement. A known limitation of the current artifact surface, where an embedded page cannot call the connector directly, is met head on: the plan is rendered with its data baked in, as a self-contained page that makes no further calls.

## How it stays grounded
{: #grounding .scroll-mt-32 }

Two rules do the work, and both are enforced in code rather than asked for in a prompt.

No un-sourced numbers. The connector cannot emit a figure without a citation. The helper that builds one requires a known source, or it raises rather than return. So a pay or employment number always arrives with its source and date attached, or it does not arrive at all. There is no path where a number floats free of where it came from.

Transparent about uncertainty. Where an estimate is unreliable or suppressed in the underlying data, the tool returns it as unavailable with a note, never a guess. Pay carries the official reliability band the statisticians publish with it. The 2035 projection only varies at a broad occupation-group level, so two different roles in the same group share a trajectory, and the tool says exactly that rather than implying a precision it does not have. The vintages differ: pay is a 2021 release, employment is the latest survey, the projection runs to 2035, and each figure wears its own date.

The effect is small and it matters. When the tool is sure, it tells you, with sources. When it is not, it tells you that too.

## The decision the build made
{: #decision .scroll-mt-32 }

The plan started with a single, ideal data source: LMI for All, a free government API that bundled pay, projections and skills behind one key-free endpoint. On paper it was perfect for this.

The first task was to verify it for real rather than trust the brief. It was still answering. But the checks showed it had been discontinued: the data frozen, official support ended, and the terms of use forbade storing any response at all. Building on it would have meant shipping a grounded tool on a dead source, and breaking its licence to do so.

So the foundation was replaced before a line of the engine was written, with maintained, openly-licensed data from ONS, the DfE and ESCO, each chosen for currency and for a licence that permits storage and reuse. It cost more plumbing, and it is the right trade. The case study is honest about what came with it: the best four-digit pay data on this footing is a 2021 vintage, and the projection resolves only at a broad group level.

Verifying the foundation before building on it is unglamorous. It is also the work. A grounded tool is only ever as trustworthy as the provenance underneath it, and that had to be real, not assumed.

## Responsible by design
{: #guardrails .scroll-mt-32 }

The guardrails are not a disclaimer at the foot of the plan. They are decisions made early that the rest of the system has to respect.

Guidance, never a determination. The tool advises and signposts. It does not decide eligibility, benefits, or any legal, medical or financial question, and it never implies a guaranteed outcome. The language is "you could explore" and "this is often a route into", not "you qualify".

Principled refusal, which this cohort needs more than most. When the conversation turns to a compensation claim, fitness for work, or mental health, the tool declines to advise and points to named, real support instead: Veterans UK and Citizens Advice for entitlements, the NHS for anything clinical, and for any sign of distress, the Samaritans and the NHS veterans' mental-health service, handled first, before any talk of jobs. Those refusals are not an afterthought. They are tested, so they cannot quietly rot out of the system.

The person owns their data, the service keeps nothing, and the whole thing runs on open data only. For a tool aimed at a vulnerable moment in someone's life, that posture is the product, not the packaging.

## Open work
{: #open .scroll-mt-32 }

The honest list of what is not finished.

The curated military-to-civilian map covers a handful of common trades. It is a starting point to validate with a Career Transition Partnership adviser, not the full taxonomy, and it is built to expand. Where a role is not in it, Claude translates the role itself and says so rather than pretending the map is complete.

The pay data is a 2021 vintage and the projection resolves only at a broad group level. Both are surfaced to the user rather than smoothed over, and the data layer is drawn so a fresher source is a swap, not a rewrite.

The conformance set proves the guardrails on the cases that matter most, a benefits question that must be refused and a sign of distress that must be handled first. It does its job, and it is built to grow.

Career Pivot Navigator is a deliberately small answer to a problem I have lived: how do you give someone leaving the military advice they can actually trust, at the moment it matters, without a hallucinated number or an implied promise. The answer it argues for is the same one I would bring to that problem at scale. Translate honestly. Ground every figure in a source. Refuse rather than guess. Stay transparent about what the data cannot say. The cohort here is service leavers; the discipline travels to anywhere an AI has quietly become the first draft and the output still has to be believed.
