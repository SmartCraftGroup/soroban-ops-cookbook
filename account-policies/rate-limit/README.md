# Rate Limit

A standalone rolling-window rate-limit policy for Soroban smart accounts.

Note: this is a self-contained reference implementation with a simple
`check()` hook. It does **not** implement the `Policy` trait from
OpenZeppelin's `stellar-accounts` yet — see
[`../README.md`](../README.md#relationship-to-stellar-accounts) for how to
wire it into a smart account.

## What it enforces

At most `max_count` transactions within any rolling window of
`window_ledgers` ledger sequence numbers. For example, "at most 5 calls
per ~1 hour (720 ledgers at ~5 seconds each)."

The window is ledger-based (not wall-clock) because ledger sequence is
the only monotonic timestamp available inside a Soroban contract.

## Contract API

| Function | Description |
|---|---|
| `initialize(admin, max_count, window_ledgers)` | One-time setup |
| `set_limits(max_count, window_ledgers)` | Admin-only: update limits |
| `check()` | Policy hook: records call, panics if over limit |
| `get_limits()` | Returns `(max_count, window_ledgers)` |
| `get_call_count()` | Count of calls within the current window |
| `policy_name()` | Returns `Symbol::short("rate_lim")` |

## Usage

```bash
cargo test
soroban contract build
```

Deploy the built `.wasm` like any Soroban contract, then call
`initialize(admin, max_count, window_ledgers)` and invoke `check()` from
your smart account's auth flow (or cross-contract from a signer) to enforce
the rate limit.

## Tests

4 unit tests covering:
- Calls within limit succeed
- Calls over limit panic
- Window expiry allows new calls
- Call count reflects the current window
