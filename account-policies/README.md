# Account Policies

Standalone, reference-quality Soroban policy contracts for scoping what a
delegated signer or automated workload is allowed to do with a smart account.

These are **not** a replacement for
[OpenZeppelin's `stellar-accounts`](https://crates.io/crates/stellar-accounts)
framework — they're self-contained reference implementations of the policy
patterns people ask for most, with a deliberately simple `check()` hook so
they're easy to read, audit, and adapt:

| Pattern | What it enforces |
|---|---|
| [`spend-limit/`](./spend-limit) | Max amount per transaction, per token. |
| [`rate-limit/`](./rate-limit) | Max number of transactions per rolling time window. |
| [`contract-allowlist/`](./contract-allowlist) | Signer may only invoke a pre-approved set of contract addresses/functions. |

## Relationship to `stellar-accounts`

These contracts do **not** yet implement the `Policy` trait from
`stellar-accounts` (`enforce` / `install` / `uninstall`). They expose a
plain `check(...)` hook that panics to deny a transaction. To use them with
an OpenZeppelin smart account you have two options:

1. **Wire them into a smart account's auth flow yourself** — call the
   contract's `check()` via cross-contract call from your own account
   contract's `__check_auth`/auth logic, or from a signer wrapper.
2. **Adapt them to the `Policy` trait** — see the integration notes in
   [`CONTRIBUTING.md`](../CONTRIBUTING.md) for what the trait looks like and
   how to map `check()` onto `enforce`.

We deliberately ship them standalone rather than half-integrated: an
unverified trait binding would be worse than an honest standalone contract.

## Usage

```bash
cd spend-limit       # or rate-limit / contract-allowlist
cargo test
soroban contract build
```

Deploy the built `.wasm` like any Soroban contract. Each contract's README
lists its full public API.

## Policy summaries

### spend-limit

Sets a per-token cap on the maximum amount that can move in a single
transaction. Useful for scoping a delegated signer to small transfers without
giving it access to the account's full balance.

### rate-limit

Limits the number of transactions a signer can execute within a rolling
window of ledger sequences. For example, "at most 5 calls per ~1 hour
(720 ledgers)." Uses ledger sequence numbers as the clock since they're
the only monotonic timestamp available inside a Soroban contract.

### contract-allowlist

Restricts a signer to only calling specific contracts, and optionally
specific functions on those contracts. For example, "this signer may
only call `swap` on the DEX contract and `deposit` on the vault."
