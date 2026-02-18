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

Implement in n8n (prompt + optional blocklist). Document in your workflow.
