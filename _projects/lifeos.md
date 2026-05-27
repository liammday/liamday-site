---
title: LifeOS
description: An architecture case study on LifeOS, a personal Claude-and-MCP operating system. One spine, eight domains, one daily ingestion pipeline. Documents one architectural failure-and-fix that cut sweep time from minutes to under 90 seconds.
summary: A unified Cowork project that replaces nine standalone admin workspaces with a tiered, self-maintaining personal-operations system. Eight domains, one spine, one ingestion path.
role: Architect, operator, and engineer (AI-paired)
year: 2026 – Present
client: Personal applied-AI build
order: 1
type: Case study
image: /assets/images/projects/lifeos-og-card.png
hero_image: /assets/images/projects/lifeos-case-study-hero.png
hero_image_webp: /assets/images/projects/lifeos-case-study-hero.webp
hero_image_width: 1600
hero_image_height: 800
hero_image_alt: "LifeOS architecture: four ingestion sources flow into a daily orchestrator and per-item primitive, which write into a central spine surrounded by eight domain nodes."
hero_image_caption: "One orchestrator, one primitive, one spine. Lazy-loaded domains. Sensitive domains carry metadata-only audit rows."
nav:
  - id: lede
    label: What changed
  - id: problem
    label: The problem
  - id: overview
    label: System overview
  - id: ingestion
    label: Daily ingestion
  - id: spines
    label: Per-domain answers
  - id: failure
    label: Failure and fix
  - id: open
    label: Open work
---

## What changed
{: #lede .scroll-mt-32 }

Before LifeOS, nine separate Cowork projects each held a slice of my admin life. Finances was one project. The car was another. Pensions, dentist search, insurance, subscriptions, and three further sensitive domains each had their own scratchpad. None of them could talk to each other.

The change is not that the data is tidier. The change is the set of questions that became askable.

Before, "which of my subscriptions are at risk this month because of a card that has changed?" required pulling up the finances workspace, then the subscriptions one, then cross-referencing by hand. Now it is a single question against the spine. The answer comes back with the at-risk lines, the renewal dates, the cards on file, and whether the renewal will route through Apple Pay or Stripe.

Before, "is anything in the pipeline that touches both the car and finances this week?" was not a question I could ask. The two workspaces did not share a calendar. Now the calendar lookahead and the daily ingestion pipeline both write into one shared spine, and the cross-cut is a single read.

Before, an inbound scanned letter sat in iCloud until I noticed it. The relevant workspace had to be opened before anything happened. Now it lands in the inbox, gets classified into the right domain on the next scheduled sweep, updates the domain context file, and surfaces as a pending action with a deadline and a proposed next step.

## The problem
{: #problem .scroll-mt-32 }

The starting state was nine standalone Cowork projects across three years of admin life. Each one was useful in isolation. Together, they had three failure modes that compounded.

The first was that cross-domain questions were not just slow, they were not askable. The context window made it impossible to load more than one workspace at a time without burning a turn on file shuffling.

The second was that the same fact lived in two or three places. A recurring direct-debit figure lived in the subscriptions register, in the finances workspace summary, and in the pensions context if it was a pension contribution. When one of them drifted, the rest did not know. Reconciliation was a manual chore.

The third was that ingestion was per workspace. Each project ran its own scheduled task to scan the relevant inbox for new items. The finance workspace watched for subscription renewals. The car workspace watched for warranty and dealer correspondence. Each sensitive-domain workspace watched for its own kind of inbound mail. Five separate monitors, each loading the same three Apple Mail accounts, parsing the same headers, producing overlapping work. The token cost was paid four or five times over for the same sweep.

LifeOS was the rebuild. One project, three tiers, eight domains, one ingestion pipeline, one decision log.

## System overview
{: #overview .scroll-mt-32 }

The filesystem is organised so the amount of content loaded into a conversation scales with the task, not with the size of the knowledge base.

**Tier 1, the spine, always loaded.** Five small, stable, cross-domain files in `shared/`. Identity, money-spine, people, calendar, and the append-only ingestion log. Tier 1 is tuned to stay under about ten kilobytes of markdown so it fits comfortably in context on every turn. It is the persistent working memory.

**Tier 2, the domain packs, lazy-loaded.** Each of the eight domains has a folder with a `CONTEXT.md` file, one or more extension files, and an `artifacts/` directory for source PDFs, CSVs, photos, and the SQLite database that holds the full transaction history. Domain packs are only pulled into a conversation when the work is in that domain.

**Tier 3, the archive, cold.** A snapshot of the nine old projects, kept for audit and rollback. Nothing in tier 3 is loaded into a conversation unless explicitly referenced.

The single design rule across the tiers: each fact has one home. The recurring-charge amount lives in the money-spine; the subscription register holds the per-line metadata. When one updates, the other reads from it rather than mirroring it. Cross-domain summaries reference sensitive-domain particulars only by opaque handle.

## Daily ingestion
{: #ingestion .scroll-mt-32 }

Ingestion is the part that earns LifeOS the right to call itself an operating system rather than a folder.

Every morning at 05:30 local, a scheduled task fires the `daily-ingestion` orchestrator. The orchestrator sweeps four sources in sequence. Apple Mail, three accounts (personal, work, study). The Preview iCloud scans folder, which is where Continuity Camera and "Import from iPhone" drop scanned letters. The local `Downloads` directory and the iCloud `Downloads` directory, deduped against each other. And `inbox/raw/`, the manual drop zone for anything I forward or drag in between runs.

Everything new lands in `inbox/raw/` with a timestamped filename. The orchestrator does not classify; it sweeps.

For each item, the orchestrator hands off to a per-item primitive, `ingest-triage`. The primitive reads the artefact, OCRs it if it is a scan, converts office formats with `markitdown`, and classifies into one of the eight domains using a shared rulebook in `INGESTION-KNOWLEDGE.md`. It then writes in four places at once: the domain `CONTEXT.md` file gains a row in Active Items or Key Facts; the spine receives a write-back if a recurring figure changed; the calendar gains a dated event if one is implied; and the append-only ingestion log gains one row recording what arrived and where it went.

If the item needs a human decision, the primitive writes a pending-action brief into `inbox/pending-action/` with a deadline and a proposed next step. The next session I open shows it on the dashboard.

After every run, a deterministic conformance pass walks the vault, applies structural tags from path inference and content tags from a curated rules engine, fixes wikilink drift, and updates the cross-domain Map-of-Content blocks. The pass is idempotent and safe to re-run; it is what keeps the knowledge graph honest without human upkeep.

## Per-domain answers
{: #spines .scroll-mt-32 }

Each of the eight domains now answers a question that no single workspace could answer before. The five non-sensitive domains are named here; the three sensitive ones are grouped as "sensitive" with their shape described but their identity withheld.

**Finances.** Which subscriptions renew in the next fourteen days, and which ones are still on a card that has changed? A single read against the money-spine plus the subscriptions register, cross-cut with the calendar.

**Pensions.** What is the projected aggregate at the standard retirement age, given the current pots, and which pot is the worst on fee drag? Pensions context plus the spine.

**Car.** What warranty work is outstanding, and is the PCP balloon date still on the calendar at the right amount? Car context plus money-spine plus calendar.

**Insurance.** What policies are live, when do they renew, and which renewals are tied to a card that has changed? Insurance context plus calendar plus money-spine.

**Dentist search.** Which NHS practices have I contacted, which are open to new patients, and when can I follow up? Domain context plus calendar.

**The three sensitive domains** are not named on this page because the particulars are personal correspondence, legal cases, or job applications in flight. The architectural point is what they share: every artefact tags `audience/sensitive`, the cross-domain ingestion log records only opaque metadata, and every cross-domain report excludes them unless explicitly asked for. The system enforces the boundary; the reader does not need the labels to see how.

## Failure and fix
{: #failure .scroll-mt-32 }

The version-one shape was a separate scheduled task per domain that needed monitoring. There were five of them, one per domain that had inbound correspondence to watch. Each task opened the same three Apple Mail accounts, loaded its own domain context, ran its own subject-line classifier, and wrote into its own domain folder.

Three problems showed up within a fortnight.

The first was overlapping work. Each domain monitor read the same inbox, hit the same Apple Mail MCP, and reparsed the same headers. The token cost for one sweep was paid four or five times. The bash sandbox was hitting timeout ceilings on the larger runs.

The second was misclassification. Each per-domain monitor was strict about what it would claim, but lax about what it would let pass. An email that genuinely touched two domains would be caught by neither, because each monitor's classifier saw the other domain's keywords first and bailed out. Items fell silently through the gaps.

The third was that any cross-domain figure (a card expiry, a salary change, a new address) had to be written into every domain that referenced it. The first attempt to add an address-change confirmation row produced three almost-identical entries in three different domain context files, with three slightly different timestamps.

The fix was an orchestrator-and-primitive split, deployed 2026-04-29.

One orchestrator, `daily-ingestion`, runs once at 05:30 local. It loads the spine read-only at the start, opens the three mail accounts once, sweeps the three document sources once, and produces a single queue of unclassified items. It does not own any classification logic. It owns the sweep.

One primitive, `ingest-triage`, runs once per item. It classifies into one of the eight domains using a shared rulebook, updates the domain context file, writes back to the spine if a figure changed, writes a dated event to the calendar if one is implied, and appends one row to the ingestion log. It does not own the sweep. It owns the per-item write.

The two skills cache the four operating documents once per session and reuse the cache across every item.

The five per-domain monitor tasks were retired the same day.

<aside class="surface-panel my-8 p-6">
  <p class="text-xs font-semibold uppercase tracking-[0.3em] text-aluminum-400">Measured, four weeks after the split</p>
  <div class="mt-4 overflow-x-auto">
    <table class="w-full min-w-[640px] text-left text-sm leading-relaxed text-aluminum-300">
      <thead class="text-xs uppercase tracking-wider text-aluminum-400">
        <tr>
          <th class="pr-4 pb-3 font-semibold">Metric</th>
          <th class="pr-4 pb-3 font-semibold">Before, per-domain monitors</th>
          <th class="pb-3 font-semibold">After, orchestrator and primitive</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-aluminum-500/15">
        <tr>
          <td class="py-3 pr-4 text-aluminum-200">Tool-execution time per nightly sweep</td>
          <td class="py-3 pr-4">~4 to 5 minutes across a five-monitor stack</td>
          <td class="py-3">Under 90 seconds, single sweep</td>
        </tr>
        <tr>
          <td class="py-3 pr-4 text-aluminum-200">Misclassification events (item caught by no domain or the wrong one)</td>
          <td class="py-3 pr-4">Recurring, missed silently</td>
          <td class="py-3">2 over 4 weeks, both caught by weekly review, not the user</td>
        </tr>
        <tr>
          <td class="py-3 pr-4 text-aluminum-200">Cross-domain figure drift (same fact in 2+ domain contexts)</td>
          <td class="py-3 pr-4">Routine on any shared change</td>
          <td class="py-3">Zero, single write path back to the spine</td>
        </tr>
        <tr>
          <td class="py-3 pr-4 text-aluminum-200">Token cost for the daily ingestion run</td>
          <td class="py-3 pr-4">Paid 4 to 5 times for overlapping inbox reads</td>
          <td class="py-3">Paid once, cached operating docs reused per item</td>
        </tr>
      </tbody>
    </table>
  </div>
</aside>

The trade-off honest enough to put in print: the orchestrator is now a single point of failure. If `daily-ingestion` fails, no domain ingestion happens that day. That is the right trade against four redundant pipelines, because the failure is loud (the ingestion log shows no rows) and recoverable (the next run picks up the missing window). It is the wrong trade for any system where silent gaps matter more than redundant cost; this is not that system.

## Open work
{: #open .scroll-mt-32 }

The Cowork artefact bridge returns HTTP 400 on every `callMcpTool`. The dashboard is snapshot-driven as a result, with refresh routed through the user-clicked scheduled-task path. The shape is right; the live-read path is waiting on a desktop-app fix.

The weekly review skill exists as a scheduled task but the underlying `SKILL.md` was missing on first run. Created since; needs one more pass for completeness.

Quarterly compaction is scheduled but has not run yet; the ingestion log is approaching ten times its target size and is the next compaction target.

LifeOS exists because I am not a tidy person by default. The reason it works is that I treat a mess I produced as a system to model rather than a chore to grind. The same shape applies to the work I take on at scale: a small ambient spine, lazy-loaded depth, a single ingestion path, an honest audit trail, and a documented trade-off whenever the obvious approach turns out to be the slower one.
