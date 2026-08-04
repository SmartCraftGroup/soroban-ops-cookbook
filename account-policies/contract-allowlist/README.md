# Contract Allowlist

A standalone contract-allowlist policy for Soroban smart accounts.

Note: this is a self-contained reference implementation with a simple
`check()` hook. It does **not** implement the `Policy` trait from
OpenZeppelin's `stellar-accounts` yet — see
[`../README.md`](../README.md#relationship-to-stellar-accounts) for how to
wire it into a smart account.

## What it enforces

The delegated signer may only invoke functions on a pre-approved set of contract
addresses. Optionally, specific function names can be restricted per
contract — for example, "this signer may only call `swap` on the DEX
contract and `deposit` on the vault."

If no function-level restrictions are configured for a given contract,
all functions on that contract are allowed.

## Contract API

| Function | Description |
|---|---|
| `initialize(admin)` | One-time setup |
| `allow_contract(addr, allowed_fns)` | Admin-only: add a contract (with optional function restrictions) |
| `remove_contract(addr)` | Admin-only: remove a contract from the allowlist |
| `check(target_contract, function_name)` | Policy hook: panics if not allowed |
| `is_allowed(target_contract)` | Query: check if a contract is allowed |
| `get_allowed_functions(target_contract)` | Query: list allowed functions |
| `policy_name()` | Returns `Symbol::short("allow_ls")` |

## Usage

```bash
cargo test
soroban contract build
```

Deploy the built `.wasm` like any Soroban contract, then call `initialize(admin)`
to set the admin and `allow_contract(addr, fns)` to build the allowlist.
Call `check(...)` from your smart account's auth flow (or cross-contract from
a signer) to enforce it.

## Tests

5 unit tests covering:
- Allowed contract passes (all functions)
- Unlisted contract is rejected
- Allowed function passes
- Unlisted function is rejected
- Remove contract works
