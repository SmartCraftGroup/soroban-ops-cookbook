# Soroban Ops Cookbook

[![CI](https://github.com/SmartCraftGroup/soroban-ops-cookbook/actions/workflows/ci.yml/badge.svg)](https://github.com/SmartCraftGroup/soroban-ops-cookbook/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Soroban SDK](https://img.shields.io/badge/Soroban--SDK-v22.0.0-purple.svg)](https://crates.io/crates/soroban-sdk)
[![Drips Wave](https://img.shields.io/badge/Drips-Stellar%20Wave-blue.svg)](https://drips.network)

Small, reusable patterns for the *operational glue* around Soroban apps — the stuff every team ends up writing once, badly, before finding a better way.

This is **not** a general "learn Soroban" cookbook (see [`stellar/soroban-examples`](https://github.com/stellar/soroban-examples) or [Soroban-Cookbook](https://github.com/Soroban-Cookbook/Soroban-Cookbook-) for that). It's a set of narrow, composable snippets for three recurring integration problems:

| Folder | Problem it solves |
|---|---|
| [`account-policies/`](./account-policies) | Standalone, reference-quality Soroban smart-account policy contracts (spend limits, rate limits, contract allowlists) for delegated signers and automated workloads, with a simple `check()` hook you can wire into your own auth flow. |
| [`anchor-configs/`](./anchor-configs) | A config generator that produces valid `docker-compose.yml` / `.env` files for SDF's [Anchor Platform](https://developers.stellar.org/docs/platforms/anchor-platform) from a short interview, instead of hand-writing SEP-24/SEP-31 config from docs. |
| [`event-listeners/`](./event-listeners) | Minimal, self-hosted services that subscribe to Soroban contract events and sink them into Postgres or forward them as webhooks — for teams that don't want a hosted indexer. |

## Why this exists

Each of these problems already has a "real" solution (OpenZeppelin's policy framework, SDF's Anchor Platform, Mercury/BlockEden's hosted indexers). This repo doesn't replace any of them — it packages the small, repetitive integration work *around* them that nobody's written down yet. The `account-policies` contracts are standalone reference implementations of policy patterns; see their [README](./account-policies) for how they relate to `stellar-accounts`.

## Maintainers & Contact

| Maintainer | Role | Contact |
|---|---|---|
| **Abdulmalik Ojo** (`@tecmalik`) | Lead Maintainer | [abdulmalikojo2@gmail.com](mailto:abdulmalikojo2@gmail.com) / Telegram: `@tecmalik` |
| **Bolaji Jimoh** (`@bojimoh`) | Core Contributor | [bolajijimoh8@gmail.com](mailto:bolajijimoh8@gmail.com) |

## Status & Contributing

Every snippet is checked in CI (`fmt`/`clippy`/tests for Rust, generator tests for `anchor-configs`) — see [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

Contributions are welcome! Please check out [`CONTRIBUTING.md`](./CONTRIBUTING.md), [`SECURITY.md`](./SECURITY.md), and our [open issues](./issues).

## Contributors

Made with [contrib.rocks](https://contrib.rocks).

<a href="https://github.com/SmartCraftGroup/soroban-ops-cookbook/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=SmartCraftGroup/soroban-ops-cookbook" alt="Contributors" />
</a>

## License

MIT — see [`LICENSE`](./LICENSE).
