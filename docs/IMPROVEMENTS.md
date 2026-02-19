# App Improvement Roadmap

A prioritized list of improvements for the Approved Content Variant Generator POC.

---

## 1. High-Impact, Low Effort (Start Here)

| Item | Description | Status |
|------|-------------|--------|
| **Fix docs drift in README** | README still says request payload is `{ title, body, channel, audience, tone }`. Update to match actual contract: `baseContent`, `targetAudience`, `channel`, `tone`. | Done |
| **Add Generation Health check** | Small page or endpoint to verify env + Supabase + n8n webhook connectivity before users hit Generate. | Done |
| **Improve error UX** | Map common n8n errors (404 webhook inactive, 403 auth, invalid JSON) to friendly actionable messages. | Done |

---

## 2. Product UX Improvements

| Item | Description | Status |
|------|-------------|--------|
| **Generation presets** | Save frequently used combinations (channel + audience + tone) for one-click generation. | Done |
| **Bulk actions in Review** | Approve/reject/submit multiple variants at once. | Done |
| **Search + filters** | Add filter by status/channel/audience/tone to Review and Export. | Done |
| **Versioning / regenerate flow** | Keep previous variants and allow "Regenerate with tweaks" for side-by-side comparison. | Pending |

---

## 3. Content Quality & AI Controls

| Item | Description | Status |
|------|-------------|--------|
| **Per-channel prompt templates** | Different system prompts for email/web/sms (length, CTA style, compliance language). | Pending |
| **Automated quality checks** | Enforce min/max length, banned phrases, required disclaimers, readability score. | Pending |
| **Structured metadata output** | Ask LLM to return `headline`, `body`, `cta`, `riskNotes` for better downstream reuse. | Pending |

---

## 4. Compliance / Governance (Pharma-Ready)

| Item | Description | Status |
|------|-------------|--------|
| **Audit trail** | Track who generated/edited/approved/rejected and when. | Pending |
| **Approval notes** | Require rationale/comments on reject or approval. | Pending |
| **Role-based access** | Separate creator/reviewer/approver permissions. | Pending |

---

## 5. Technical Reliability

| Item | Description | Status |
|------|-------------|--------|
| **Queue-based generation** | Move webhook calls to background jobs for retries/timeouts and scalability. | Pending |
| **Idempotency keys** | Prevent duplicate variants on double-submit/retry. | Pending |
| **Observability** | Log request/response timings, model used, token cost, failure reasons. | Pending |

---

## 6. Developer Experience

| Item | Description | Status |
|------|-------------|--------|
| **Contract validation with Zod** | Validate webhook request/response schemas at runtime; fail with clear errors. | Pending |
| **E2E tests (Playwright)** | Cover login → generate → review → export happy path and common failures. | Pending |
| **CI pipeline** | Lint, typecheck, test, build on every PR. | Pending |
