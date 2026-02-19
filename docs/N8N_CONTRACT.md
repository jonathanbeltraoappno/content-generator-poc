# n8n Webhook Contract for Variant Generation

The app calls an n8n webhook to generate channel-appropriate variants from approved content (e.g. via Requesty/LLM).

## Request (App → n8n)

- **Method:** POST
- **URL:** `N8N_WEBHOOK_URL` in env
- **Body (JSON):** `{ "baseContent", "targetAudience", "channel", "tone" }`
  - `baseContent`: string — combined approved content (title + "\n\n" + body, or body only if no title)
  - `targetAudience`: hcp | patient | internal
  - `channel`: email | web | sms
  - `tone`: professional | friendly | formal | conversational

## Response (n8n → App)

- **Status:** 200
- **Body (JSON):** either shape below.

**Shape A — variants array (preferred):**

- `{ "variants": [ { "channel?", "audience?", "tone?", "text" } ] }`
  - One or more variants; each must have `text`; channel/audience/tone optional (default to request values).

**Shape B — single generated text:**

- `{ "text": "..." }` or `{ "output": "..." }` or `{ "result": "..." }`
  - App builds one variant from this text using the request’s channel, audience, and tone.

## Errors

- Non-2xx or invalid JSON: app shows error, no variants saved.
- Optional: `{ "error": "message" }` with 4xx for user-visible message.

## Guardrails

Guardrails ensure generated content stays within approved boundaries and complies with pharma/healthcare regulations. Implement these in your n8n workflow.

### Prompt Constraints (Required)

Instruct the LLM via system/user prompts to:

- **Stay within source content**: Do not add claims, data, or references not present in `baseContent`. Do not invent statistics, study results, or medical claims.
- **Match channel constraints**: Adapt length and structure per channel:
  - **Email**: Can be longer, structured with headers/sections
  - **Web**: Structured, scannable, may include formatting
  - **SMS**: Concise, under 160 characters when possible
- **Match audience and tone**: Adjust language appropriately:
  - **HCP**: Clinical, evidence-based, professional terminology
  - **Patient**: Plain language, accessible, empathetic
  - **Internal**: Can be more technical or strategic
- **Avoid off-label claims**: Do not make statements about unapproved uses, indications, or patient populations.
- **Preserve safety information**: If `baseContent` includes disclaimers, warnings, or safety language, preserve them in the adapted variant.

**Example system prompt:**

```
You adapt approved brand content for different channels and audiences.
Rules:
- Do not add claims, data, or references not in the source content.
- Do not make off-label statements or unapproved medical claims.
- Match the requested channel (email/web/sms), audience (HCP/patient/internal), and tone.
- Preserve any safety information or disclaimers from the source.
- Respond with only the adapted content, no meta-commentary.
```

### Blocklist (Optional)

Define a list of prohibited terms/phrases that should not appear in generated content:

- Competitor brand names
- Off-label indications
- Prohibited medical claims
- Regulatory-sensitive terms

**Implementation in n8n:**

1. Store blocklist in a Code node or Set node as an array: `["term1", "term2", ...]`
2. After LLM response, use a Code node to check if output contains any blocklisted term (case-insensitive)
3. If match found:
   - Option A: Return `{ "error": "Generated content contains prohibited term: [term]" }` with 400 status
   - Option B: Filter/replace the term and continue (document this behavior)

### Validation (Optional)

Add post-processing checks:

- **Length limits**: Enforce per-channel constraints (e.g., SMS < 160 chars)
- **Required disclaimers**: If `baseContent` includes specific disclaimer text, ensure it appears in the variant
- **Format validation**: Ensure output matches expected format (e.g., no markdown if plain text expected)

**Implementation in n8n:**

Use a Code node after LLM response to validate length, presence of required text, etc. Return an error if validation fails.

### Documentation Checklist

In your n8n workflow, document:

- [ ] Which prompt constraints are enforced (list them)
- [ ] Whether a blocklist is applied (and where it's defined)
- [ ] Any post-processing validation rules
- [ ] How errors are returned to the app (status code + error message format)
