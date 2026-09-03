#!/usr/bin/env bash

# Script to create GitHub issues using GitHub CLI (gh)
# Run `gh auth login` first if gh CLI is installed, or copy issues directly from ISSUES.md.

set -e

REPO="SmartCraftGroup/soroban-ops-cookbook"

echo "Creating issue 1..."
gh issue create --repo "$REPO" \
  --title "feat(account-policies): implement OpenZeppelin stellar-accounts Policy trait" \
  --label "good-first-issue,enhancement,account-policies" \
  --body "### Summary
The policy contracts in \`account-policies/\` (\`spend-limit\`, \`rate-limit\`, \`contract-allowlist\`) currently expose a standalone \`check()\` helper function. We need to implement the official \`Policy\` trait from OpenZeppelin's \`stellar-accounts\` crate for each policy contract.

### Tech Stack
- Rust (\`edition = \"2021\"\`)
- Soroban SDK \`v22.0.0\`
- OpenZeppelin \`stellar-accounts\`

### Acceptance Criteria
- [ ] Add \`stellar-accounts\` dependency to \`account-policies/*/Cargo.toml\`.
- [ ] Implement \`install\`, \`uninstall\`, and \`enforce\` methods for \`SpendLimitPolicy\`, \`RateLimitPolicy\`, and \`ContractAllowlistPolicy\`.
- [ ] Maintain legacy \`check()\` hook for backwards compatibility with standalone usage.
- [ ] Add integration test verifying policy rejection when registered on a simulated smart account.
- [ ] All Rust tests pass without warnings."

echo "Creating issue 2..."
gh issue create --repo "$REPO" \
  --title "feat(anchor-configs): add interactive CLI input validation for assets and domains" \
  --label "enhancement,anchor-configs,good-first-issue" \
  --body "### Summary
\`generate-config.js\` prompts users for SEP-24 / SEP-31 parameters. We need to add stricter interactive input validation for asset codes, Stellar public key addresses (G... 56 chars), and valid URL domains.

### Tech Stack
- Node.js (\`v20+\`)
- CommonJS / \`prompts\` CLI library

### Acceptance Criteria
- [ ] Validate asset codes to match 1-12 alphanumeric characters.
- [ ] Validate Stellar public keys using Regex \`^G[A-Z0-9]{55}$\`.
- [ ] Validate domain inputs to ensure valid URL syntax.
- [ ] Add unit test assertions in \`test/generate.test.js\` covering validation errors.
- [ ] \`npm test\` passes 100%."

echo "Creating issue 3..."
gh issue create --repo "$REPO" \
  --title "feat(event-listeners): add database migration runner and connection retry backoff to postgres-sink" \
  --label "enhancement,event-listeners,postgres-sink" \
  --body "### Summary
Convert schema initialization in \`postgres-sink\` to use explicit \`sqlx::migrate!\` files and add exponential backoff when connecting to PostgreSQL on startup.

### Tech Stack
- Rust / Tokio
- \`sqlx\` (PostgreSQL driver)

### Acceptance Criteria
- [ ] Create \`migrations/\` directory inside \`event-listeners/postgres-sink\`.
- [ ] Move table definitions to SQL migration files.
- [ ] Add a connection retry loop when connecting \`PgPoolOptions\`.
- [ ] Verify \`cargo test\` passes."

echo "Creating issue 4..."
gh issue create --repo "$REPO" \
  --title "feat(event-listeners): implement HMAC signature headers for webhook-relay payload authentication" \
  --label "security,event-listeners,webhook-relay" \
  --body "### Summary
Add HMAC-SHA256 signature header (\`X-Soroban-Signature\`) to outgoing HTTP POST requests in \`webhook-relay\` generated with a shared secret (\`WEBHOOK_SECRET\` env variable).

### Tech Stack
- Rust / Tokio
- \`hmac\` / \`sha2\` crates

### Acceptance Criteria
- [ ] Read optional \`WEBHOOK_SECRET\` environment variable.
- [ ] Compute HMAC-SHA256 signature over the JSON payload body.
- [ ] Attach \`X-Soroban-Signature\` header to outgoing HTTP POST requests.
- [ ] Add unit test for HMAC generation helper function."

echo "Creating issue 5..."
gh issue create --repo "$REPO" \
  --title "docs: set up Starlight/GitBook documentation site structure" \
  --label "documentation,help-wanted" \
  --body "### Summary
Per Phase 11 of the Stellar Wave Builder Playbook, create an independent documentation site framework documenting architecture diagrams, policy integration guides, and indexer setup.

### Tech Stack
- Markdown / MDX
- Astro Starlight or GitBook

### Acceptance Criteria
- [ ] Scaffold \`docs/\` folder with documentation site config.
- [ ] Include Getting Started, Policy Architecture, and Event Listener guides.
- [ ] Add deployment instructions for GitHub Pages or Vercel."

echo "All 5 issues created successfully!"
