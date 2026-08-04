# Contributing

This repo is structured as small, independent snippets rather than one
monolithic project. Each subfolder is meant to be copy-pasteable into a real
project with minimal changes.

## Adding a new pattern

1. Pick a folder (`account-policies/`, `anchor-configs/`, or `event-listeners/`)
   or propose a new top-level category if it's a genuinely new class of
   problem (open an issue first).
2. Each pattern gets its own subfolder with:
   - A short `README.md`: what problem it solves, what it depends on, how to
     run it.
   - Working code — it must build/run, not just illustrate an idea.
   - At least one example config or test showing it actually works.
3. Keep dependencies minimal. If you're wrapping an existing library
   (OpenZeppelin's `stellar-accounts`, Anchor Platform, Mercury), depend on
   it — don't reimplement it.

## Style

- Rust: `cargo fmt` + `cargo clippy` clean.
- Node/TS: `prettier` defaults.
- Every snippet needs a README explaining *why* it exists in one paragraph,
  not just usage instructions.

## Issue labels

- `good-first-issue` — small, well-scoped, good for first-time contributors.
- `pattern-request` — a new snippet someone wants but hasn't built.
- `bug` — something in an existing snippet is broken or outdated.

## Wiring `account-policies` contracts into OpenZeppelin `stellar-accounts`

The policy contracts in `account-policies/` are standalone: they expose a
`check(...)` hook, not the `Policy` trait from
[`stellar-accounts`](https://crates.io/crates/stellar-accounts). Wiring them
up is a good first integration PR. What that looks like (verify against the
current trait in the `stellar-accounts` crate before implementing):

1. Add `stellar-accounts` to the contract's `Cargo.toml` and implement
   `Policy` for the contract type:
   - `install(env, context)` / `uninstall(env, context)` — lifecycle hooks
     the smart account calls when the policy is added/removed.
   - `enforce(env, context, authenticated_signers, context_rule, smart_account)`
     — the per-transaction hook. Map the contract's `check(...)` body into
     this: panicking on violation is the expected denial mechanism.
2. Keep the existing `check(...)` functions as thin wrappers (or test-only
   helpers) so the standalone READMEs stay accurate.
3. Add an integration test that registers the policy on a real
   `stellar-accounts` smart account and asserts a violating transaction is
   denied. Update the `account-policies` READMEs to describe the trait wiring
   once verified.

If the trait shape has changed since this was written, update these notes —
that's exactly the kind of drift to keep in sync.
