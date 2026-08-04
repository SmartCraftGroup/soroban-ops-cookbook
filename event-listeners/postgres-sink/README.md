# Postgres Sink

Polls Soroban RPC `getEvents` for one contract and writes each event as a row
in Postgres, deduped by event id.

## Features

- **Persistent cursor** — ledger position is saved in a `sync_state` table so
  the service resumes where it left off after restarts.
- **Topic filtering** — optionally filter events by substring match against
  topic values via the `TOPIC_FILTER` env var.
- **Exponential backoff** — transient RPC failures are retried with exponential
  backoff before falling through to the next poll tick.
- **Upsert deduplication** — events are inserted with `ON CONFLICT DO NOTHING`
  so re-processing the same ledger range is safe.

## Run locally

```bash
docker compose up -d          # starts a local Postgres
export SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
export CONTRACT_ID=<your contract id>
export DATABASE_URL=postgres://sink:sink@localhost:5433/soroban_events
export START_LEDGER=<recent ledger, see below>
cargo run
```

`START_LEDGER` is required on first run (there is no persisted cursor yet).
Soroban RPC rejects ledgers older than its retention window, so pick a recent
one. Get the latest ledger with:

```bash
curl -X POST https://soroban-testnet.stellar.org \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getLatestLedger"}'
```

After the first run the cursor is persisted in the `sync_state` table and
`START_LEDGER` is ignored.

## Configuration

| Env var | Required | Default | Description |
|---|---|---|---|
| `SOROBAN_RPC_URL` | yes | — | Soroban RPC endpoint |
| `CONTRACT_ID` | yes | — | Contract to watch |
| `DATABASE_URL` | yes | — | Postgres connection string |
| `POLL_INTERVAL_SECS` | no | `10` | Seconds between poll ticks |
| `START_LEDGER` | first run | — | Initial ledger (required when no persisted cursor exists; must be ≥ 1) |
| `TOPIC_FILTER` | no | — | Comma-separated substrings to match against topic values |
| `MAX_RETRIES` | no | `3` | Max RPC retries with backoff before sleeping |

See `.env.example` for a template.

## Schema

The service auto-creates two tables on startup:

**`soroban_events`** — one row per contract event:

| Column | Type | Notes |
|---|---|---|
| `id` | `TEXT PK` | Soroban event id |
| `contract_id` | `TEXT` | Indexed |
| `ledger` | `BIGINT` | Indexed |
| `ledger_closed_at` | `TIMESTAMPTZ` | |
| `topic` | `JSONB` | |
| `value` | `JSONB` | |
| `inserted_at` | `TIMESTAMPTZ` | Auto-set |

**`sync_state`** — cursor persistence:

| Column | Type | Notes |
|---|---|---|
| `key` | `TEXT PK` | `'last_ledger'` |
| `value` | `BIGINT` | Next ledger to poll |
| `updated_at` | `TIMESTAMPTZ` | Auto-set |

## Fetching behavior

`getEvents` results are fetched page by page (following the RPC's pagination
cursor until `hasNext` is false), so ranges with more than 100 events are not
silently truncated.

## Not verified against a live RPC endpoint yet

This was written against the documented `getEvents` JSON-RPC shape but
hasn't been run against a live testnet contract in this environment.
If you hit a response-shape mismatch, that's a good first PR.
