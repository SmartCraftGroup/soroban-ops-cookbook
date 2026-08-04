# Webhook Relay

Polls Soroban RPC `getEvents` for one contract and forwards each event as a
JSON POST to a configured webhook URL, with exponential backoff/retry on
delivery failures.

This is the webhook counterpart to [`postgres-sink`](../postgres-sink) — same
polling loop, different output sink.

## Run locally

```bash
export SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
export CONTRACT_ID=<your contract id>
export WEBHOOK_URL=https://your-service.example.com/events
export START_LEDGER=<recent ledger, see below>
cargo run
```

`START_LEDGER` is required: Soroban RPC rejects ledgers older than its
retention window. Get the latest ledger with:

```bash
curl -X POST https://soroban-testnet.stellar.org \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getLatestLedger"}'
```

This service has no persisted cursor — every restart re-polls from
`START_LEDGER`, so events may be re-delivered. Dedupe on the receiving end
via the `X-Soroban-Event-Id` header (or keep the Postgres sink if you need
at-least-once processing with a cursor).

## Configuration

| Env var | Required | Default | Description |
|---|---|---|---|
| `SOROBAN_RPC_URL` | yes | — | Soroban RPC endpoint |
| `CONTRACT_ID` | yes | — | Contract to watch |
| `WEBHOOK_URL` | yes | — | URL to POST events to |
| `POLL_INTERVAL_SECS` | no | `10` | Seconds between poll ticks |
| `START_LEDGER` | yes | — | Initial ledger sequence to poll from (must be ≥ 1) |
| `MAX_RETRIES` | no | `5` | Max delivery retries per event |
| `TOPIC_FILTER` | no | — | Comma-separated substrings to match against topic values |

See `.env.example` for a template.

## Webhook payload

Each event is POSTed as JSON with the following shape:

```json
{
  "event_id": "0000000171798695937-0000000001",
  "contract_id": "CDLZFC...",
  "ledger": 40000,
  "ledger_closed_at": "2025-01-15T12:34:56Z",
  "topic": [{"symbol": "transfer"}],
  "value": {"i128": {"lo": 1000000, "hi": 0}},
  "delivered_at": "2025-01-15T12:35:02Z"
}
```

Headers include `X-Soroban-Event-Id` for deduplication on the receiving end.

## Retry behavior

Failed deliveries (non-2xx responses or network errors) are retried with
exponential backoff: 2s → 4s → 8s → 16s → 32s. After `MAX_RETRIES` failures
the event is logged and skipped.

## Fetching behavior

`getEvents` results are fetched page by page (following the RPC's pagination
cursor until `hasNext` is false), so ranges with more than 100 events are not
silently truncated.

## Not verified against a live RPC endpoint yet

This was written against the documented `getEvents` JSON-RPC shape but
hasn't been run against a live testnet contract in this environment.
If you hit a response-shape mismatch, that's a good first PR.
