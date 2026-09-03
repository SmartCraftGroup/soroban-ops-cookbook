# Planned GitHub Issues for Soroban Ops Cookbook

These 5 issues match the exact structure required by **Phase 10.5 of the Stellar Wave Builder Playbook**. You can copy-paste each issue directly into the GitHub Issues tab of your repository (`SmartCraftGroup/soroban-ops-cookbook`).

---

## Issue 1: `feat(account-policies): implement OpenZeppelin stellar-accounts Policy trait`

**Labels:** `good-first-issue`, `enhancement`, `account-policies`

### Summary
The policy contracts in `account-policies/` (`spend-limit`, `rate-limit`, `contract-allowlist`) currently expose a standalone `check()` helper function. We need to implement the official `Policy` trait from OpenZeppelin's `stellar-accounts` crate for each policy contract so they can be registered directly on smart accounts.

### Tech Stack
- Rust (`edition = "2021"`)
- Soroban SDK `v22.0.0`
- OpenZeppelin `stellar-accounts`

### Acceptance Criteria
- [ ] Add `stellar-accounts` dependency to `account-policies/*/Cargo.toml`.
- [ ] Implement `install`, `uninstall`, and `enforce` methods for `SpendLimitPolicy`, `RateLimitPolicy`, and `ContractAllowlistPolicy`.
- [ ] Maintain legacy `check()` hook for backwards compatibility with standalone usage.
- [ ] Add integration test verifying policy rejection when registered on a simulated smart account.
- [ ] All Rust tests, `cargo fmt`, and `cargo clippy` pass without warnings.

---

## Issue 2: `feat(anchor-configs): add interactive CLI input validation for assets and domains`

**Labels:** `enhancement`, `anchor-configs`, `good-first-issue`

### Summary
`generate-config.js` prompts users for SEP-24 / SEP-31 parameters. We need to add stricter interactive input validation for asset codes, Stellar public key addresses (G... 56 chars), and valid URL domains before generating `.env` and `docker-compose.yml` templates.

### Tech Stack
- Node.js (`v20+`)
- CommonJS / `prompts` CLI library
- `js-yaml`

### Acceptance Criteria
- [ ] Validate asset codes (e.g. `USDC`, `EURC`) to match 1-12 alphanumeric characters.
- [ ] Validate Stellar public keys using Regex `^G[A-Z0-9]{55}$`.
- [ ] Validate domain inputs to ensure valid URL syntax.
- [ ] Add unit test assertions in `test/generate.test.js` covering validation errors.
- [ ] `npm test` passes 100%.

---

## Issue 3: `feat(event-listeners): add database migration runner and connection retry backoff to postgres-sink`

**Labels:** `enhancement`, `event-listeners`, `postgres-sink`

### Summary
`event-listeners/postgres-sink` initializes its database table on startup via raw SQL queries. We want to convert schema initialization to use explicit `sqlx::migrate!` files and add exponential backoff when connecting to PostgreSQL on startup (handling Docker compose startup order race conditions).

### Tech Stack
- Rust / Tokio
- `sqlx` (PostgreSQL driver)
- Soroban RPC `getEvents` API

### Acceptance Criteria
- [ ] Create `migrations/` directory inside `event-listeners/postgres-sink`.
- [ ] Move table definitions (`soroban_events`, `sync_state`) to SQL migration files.
- [ ] Add a connection retry loop (max 5 retries with 2s backoff) when connecting `PgPoolOptions`.
- [ ] Update `docker-compose.yml` to test startup dependency.
- [ ] Verify `cargo check` and `cargo test` pass.

---

## Issue 4: `feat(event-listeners): implement HMAC signature headers for webhook-relay payload authentication`

**Labels:** `security`, `event-listeners`, `webhook-relay`

### Summary
Currently, `event-listeners/webhook-relay` sends raw HTTP POST requests to configured webhook URLs. To prevent spoofing, webhooks should be signed using an HMAC-SHA256 signature header (`X-Soroban-Signature`) generated with a shared secret (`WEBHOOK_SECRET` env variable).

### Tech Stack
- Rust / Tokio
- `hmac` / `sha2` crates
- `reqwest`

### Acceptance Criteria
- [ ] Read optional `WEBHOOK_SECRET` environment variable in `webhook-relay/src/main.rs`.
- [ ] Compute HMAC-SHA256 signature over the JSON payload body.
- [ ] Attach `X-Soroban-Signature: t=<timestamp>,v1=<signature>` header to outgoing HTTP POST requests.
- [ ] Document signature verification steps in `event-listeners/webhook-relay/README.md`.
- [ ] Add unit test for HMAC generation helper function.

---

## Issue 5: `docs: set up Starlight/GitBook documentation site structure`

**Labels:** `documentation`, `starlight`, `help-wanted`

### Summary
Per Phase 11 of the Stellar Wave Builder Playbook, create an independent documentation site framework (using Astro Starlight or GitBook) documenting architecture diagrams, policy integration guides, and indexer setup.

### Tech Stack
- Markdown / MDX
- Astro Starlight or GitBook

### Acceptance Criteria
- [ ] Scaffold `docs/` folder with documentation site config.
- [ ] Include Getting Started, Policy Architecture, and Event Listener guides.
- [ ] Add deployment instructions for GitHub Pages or Vercel.
