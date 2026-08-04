# Spend Limit

A standalone per-transaction spend-limit policy for Soroban smart accounts.

Note: this is a self-contained reference implementation with a simple
`check()` hook. It does **not** implement the `Policy` trait from
OpenZeppelin's `stellar-accounts` yet — see
[`../README.md`](../README.md#relationship-to-stellar-accounts) for how to
wire it into a smart account.

## What it enforces

A single transaction may move at most `max_amount` of a given token. Useful
for scoping a delegated signer to small transfers without giving it access
to the account's full balance.

Intentionally simple — one limit per token — so it's easy to read, audit,
and compose with other policies (see [`../rate-limit`](../rate-limit) for a
time-windowed complement).

## Contract API

| Function | Description |
|---|---|
| `initialize(admin)` | One-time setup |
| `set_limit(token, max_amount)` | Admin-only: set/update the per-transaction cap for a token |
| `check(token, amount)` | Policy hook: panics if `amount` exceeds the limit |
| `get_limit(token)` | Query: current limit for a token |
| `policy_name()` | Returns `Symbol::short("spend_lim")` |

## Usage

```bash
cargo test
soroban contract build
```

Deploy the built `.wasm` like any Soroban contract, then call
`initialize(admin)`, set limits with `set_limit(token, amount)`, and invoke
`check(token, amount)` from your smart account's auth flow (or cross-contract
from a signer) before a transfer is allowed.

## Tests

2 unit tests covering:
- Amount under the limit is allowed
- Amount over the limit panics
