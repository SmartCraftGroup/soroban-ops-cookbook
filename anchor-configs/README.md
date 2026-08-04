# Anchor Configs

A tiny CLI that generates a runnable `docker-compose.yml`, `.env`, and the
required config files for SDF's
[Anchor Platform](https://developers.stellar.org/docs/platforms/anchor-platform)
from a short interactive Q&A, instead of hand-assembling config from the
Anchor Platform docs.

This does **not** replace the Anchor Platform — it just removes the
"which of these 30 env vars do I actually need for SEP-24 deposit-only"
friction that trips up most first integrations.

The generated output follows the current Anchor Platform quick-run schema
(per-SEP `SEP10_ENABLED`-style env vars, Postgres via
`DATA_TYPE`/`DATA_SERVER`/`SECRET_DATA_*`, and file-based config under
`config/`).

## Usage

```bash
cd anchor-configs
npm install
npm start          # or: node generate-config.js
```

You'll be asked a handful of questions (which SEPs, which assets, testnet or
mainnet, asset decimals) and get a ready-to-run stack in an `output/` folder:

```
output/
├── docker-compose.yml     # anchor-platform + Postgres (+ SEP-24 reference UI)
├── .env                   # all platform env vars
└── config/
    ├── assets.yaml        # your asset(s)
    ├── clients.yaml       # wallet clients (demo wallet pre-registered)
    └── stellar.toml       # SEP-1 file served at /.well-known/stellar.toml
```

## Run it

```bash
cd output
docker compose up -d
curl http://localhost:8080/.well-known/stellar.toml   # should return your TOML
```

What works out of the box: the platform boots, serves SEP-1, and performs
SEP-10 web auth against the `SECRET_SEP10_SIGNING_SEED` you configure.
If you selected SEP-24, the reference UI runs on `http://localhost:3000`
and the demo wallet (demo-wallet.stellar.org) can run a deposit flow against
`http://localhost:8080`.

What you must replace before relying on it (the generator prints these too):

1. **`SECRET_SEP10_SIGNING_SEED`** in `.env` — real Stellar secret seed.
2. **`SIGNING_KEY`** in `config/stellar.toml` — public key of that seed:
   ```bash
   stellar keys generate sep10 --seed <your_seed>
   stellar keys public-key sep10
   ```
3. **`distribution_account`** in `config/assets.yaml` — the account that
   holds the asset for deposits/withdrawals.

SEP-24/31/38 *business* flows also need your own callback/backend server
(see the [Getting Started guide](https://developers.stellar.org/docs/platforms/anchor-platform/admin-guide/getting-started)
and its "How to implement your business callback server" section) — the
generated stack includes the platform + reference UI, not a production
backend.

## Tests

```bash
npm test
```

Runs the generator end-to-end with scripted answers and asserts the output
files match the current Anchor Platform schema (SEP flags, RPC URL per
network, Postgres config, config-file wiring, SEP-24 UI inclusion).

## Notes

- `docker-compose.yml` pins `stellar/anchor-platform:latest` (matching the
  official quick-run) — pin a specific release tag for production.
- Anchor Platform's config schema changes between versions. If you hit a
  mismatch, update the templates in `templates/` — this is a good
  `good-first-issue` if you've verified the current schema.

## Roadmap (see issues)

- [ ] Preset for common payment-rail providers (Flutterwave, MoneyGram-style)
- [ ] Validation against Anchor Platform's actual schema before writing files
